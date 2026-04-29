const mongoose = require('mongoose');
const Joi = require('joi');

const layerSchema = new mongoose.Schema({
    description: { type: String, required: true },
    ingredients: [{ type: String, required: true }]
});

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    preparationTime: { type: Number, required: true },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    addedDate: { type: Date, default: Date.now },
    layers: [layerSchema], // Embedded
    instructions: { type: [String], required: true },
    image: { type: String, default: "" },
    isPrivate: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

const Recipe = mongoose.model('recipes', recipeSchema);

const validateRecipe = (recipe) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        description: Joi.string().allow(''),
        category: Joi.string().hex().length(24),
        categoryName: Joi.string().min(1),
        preparationTime: Joi.number().min(1).required(),
        difficulty: Joi.number().min(1).max(5).required(),
        layers: Joi.array().items(Joi.object({
            description: Joi.string().required(),
            ingredients: Joi.array().items(Joi.string()).min(1).required()
        })).min(1).required(),
        instructions: Joi.array().items(Joi.string()).min(1).required(),
        image: Joi.string().allow(''),
        isPrivate: Joi.boolean()
        // ה-owner בדרך כלל יגיע מהטוקן בשרת, לא מה-body
    }).or('category', 'categoryName');
    return schema.validate(recipe);
};

module.exports = { Recipe, validateRecipe };