const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }, // נצפין ב-Bcrypt בהמשך
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

const User = mongoose.model('users', userSchema);

const validateUser = (user) => {
    const schema = Joi.object({
        username: Joi.string().min(2).required(),
        password: Joi.string().min(6).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
            .messages({'string.pattern.base': 'הסיסמה חייבת להכיל אות גדולה, אות קטנה ומספר'}),
        email: Joi.string().email().required(),
        address: Joi.string().required(),
        role: Joi.string().valid('admin', 'user')
    });
    return schema.validate(user);
};

module.exports = { User, validateUser };