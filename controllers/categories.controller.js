const { Category } = require('../models/category.model');

const sortByCode = { code: 1 };

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}, { recipes: 0 }).sort(sortByCode);
    return res.status(200).json({ categories });
  } catch (error) {
    return next(error);
  }
};

const filterVisibleRecipes = (recipes, userId) =>
  recipes.filter((recipe) => !recipe.isPrivate || (userId && recipe.owner?.toString() === userId?.toString()));

const getCategoriesWithRecipes = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort(sortByCode)
      .populate('recipes');

    const normalized = categories.map((category) => {
      const visibleRecipes = filterVisibleRecipes(category.recipes || [], req.user._id);
      return {
        _id: category._id,
        code: category.code,
        description: category.description,
        recipesCount: visibleRecipes.length,
        recipes: visibleRecipes
      };
    });

    return res.status(200).json({ categories: normalized });
  } catch (error) {
    return next(error);
  }
};

const getCategoryByCodeOrNameWithRecipes = async (req, res, next) => {
  try {
    const key = String(req.params.key || '').trim();
    if (!key) {
      return res.status(400).json({ error: { message: 'Category code or name is required.' } });
    }

    const category = await Category.findOne({
      $or: [{ code: key }, { description: key }]
    }).populate('recipes');

    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found.' } });
    }

    const visibleRecipes = filterVisibleRecipes(category.recipes || [], req.user._id);

    return res.status(200).json({
      category: {
        _id: category._id,
        code: category.code,
        description: category.description,
        recipesCount: visibleRecipes.length,
        recipes: visibleRecipes
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategories,
  getCategoriesWithRecipes,
  getCategoryByCodeOrNameWithRecipes
};
