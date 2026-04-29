const mongoose = require('mongoose');

const { Recipe, validateRecipe } = require('../models/recipe.model');
const { Category } = require('../models/category.model');

const buildAccessFilter = (req) => {
  if (!req.user?._id) {
    return { isPrivate: false };
  }

  return {
    $or: [
      { isPrivate: false },
      { owner: req.user._id }
    ]
  };
};

const parsePositiveInt = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) return fallback;
  return n;
};

const getRecipes = async (req, res, next) => {
  try {
    const accessFilter = buildAccessFilter(req);

    const limit = Math.min(parsePositiveInt(req.query.limit, 5), 50);
    const page = parsePositiveInt(req.query.page, 1);
    const skip = (page - 1) * limit;

    const { search } = req.query;

    let filter = accessFilter;
    if (search && String(search).trim() !== '') {
      let regex;
      try {
        regex = new RegExp(String(search), 'i');
      } catch (e) {
        return res.status(400).json({ error: { message: 'Invalid search RegExp.' } });
      }

      const searchFilter = {
        $or: [
          { name: regex },
          { description: regex },
          { 'layers.description': regex },
          { 'layers.ingredients': regex }
        ]
      };

      filter = { $and: [accessFilter, searchFilter] };
    }

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort({ addedDate: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      recipes,
      page,
      limit,
      total
    });
  } catch (error) {
    return next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: { message: 'Invalid recipe id.' } });
    }

    const accessFilter = buildAccessFilter(req);
    const recipe = await Recipe.findOne({ _id: id, ...accessFilter });

    if (!recipe) {
      return res.status(404).json({ error: { message: 'Recipe not found.' } });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    return next(error);
  }
};

const getRecipesByPreparationTime = async (req, res, next) => {
  try {
    const maxMinutes = Number(req.params.minutes);
    if (!Number.isFinite(maxMinutes) || maxMinutes <= 0) {
      return res.status(400).json({ error: { message: 'Invalid minutes.' } });
    }

    const accessFilter = buildAccessFilter(req);
    const filter = {
      $and: [
        accessFilter,
        { preparationTime: { $lte: maxMinutes } }
      ]
    };

    const recipes = await Recipe.find(filter).sort({ preparationTime: 1 });

    return res.status(200).json({ recipes });
  } catch (error) {
    return next(error);
  }
};

const addRecipe = async (req, res, next) => {
  try {
    const { error } = validateRecipe(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const categoryExists = await Category.exists({ _id: req.body.category });
    if (!categoryExists) {
      return res.status(404).json({ error: { message: 'Category not found.' } });
    }

    const created = await Recipe.create({
      ...req.body,
      owner: req.user._id
    });

    // Keep category counters in sync (best-effort).
    await Category.findByIdAndUpdate(
      req.body.category,
      { $inc: { recipesCount: 1 }, $push: { recipes: created._id } },
      { new: true }
    );

    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: { message: 'Invalid recipe id.' } });
    }

    const { error } = validateRecipe(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const existing = await Recipe.findById(id);
    if (!existing) {
      return res.status(404).json({ error: { message: 'Recipe not found.' } });
    }

    const isOwner = existing.owner?.toString() === req.user._id?.toString();
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: { message: 'Access denied.' } });
    }

    const categoryExists = await Category.exists({ _id: req.body.category });
    if (!categoryExists) {
      return res.status(404).json({ error: { message: 'Category not found.' } });
    }

    const oldCategoryId = existing.category?.toString();
    const newCategoryId = String(req.body.category);

    const updated = await Recipe.findByIdAndUpdate(
      id,
      { ...req.body, owner: existing.owner },
      { new: true, runValidators: true }
    );

    if (oldCategoryId !== newCategoryId) {
      await Category.findByIdAndUpdate(
        oldCategoryId,
        { $inc: { recipesCount: -1 }, $pull: { recipes: existing._id } },
        { new: true }
      );
      await Category.findByIdAndUpdate(
        newCategoryId,
        { $inc: { recipesCount: 1 }, $push: { recipes: updated._id } },
        { new: true }
      );
    }

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: { message: 'Invalid recipe id.' } });
    }

    const existing = await Recipe.findById(id);
    if (!existing) {
      return res.status(404).json({ error: { message: 'Recipe not found.' } });
    }

    const isOwner = existing.owner?.toString() === req.user._id?.toString();
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: { message: 'Access denied.' } });
    }

    const deleted = await Recipe.findByIdAndDelete(id);

    if (deleted?.category) {
      await Category.findByIdAndUpdate(
        deleted.category,
        { $inc: { recipesCount: -1 }, $pull: { recipes: deleted._id } },
        { new: true }
      );
    }

    return res.status(200).json({ message: 'Recipe deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  getRecipesByPreparationTime,
  addRecipe,
  updateRecipe,
  deleteRecipe
};

