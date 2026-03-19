const mongoose = require('mongoose');
const Joi = require('joi');

const categorySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    recipesCount: { type: Number, default: 0 },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'recipes' }] // Reference array
});

const Category = mongoose.model('categories', categorySchema);

const validateCategory = (category) => {
    const schema = Joi.object({
        code: Joi.string().required(),
        description: Joi.string().required()
    });
    return schema.validate(category);
};

module.exports = { Category, validateCategory };