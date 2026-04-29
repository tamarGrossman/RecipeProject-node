const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  User,
  validateUser,
  validateLogin,
  validatePasswordUpdate
} = require('../models/user.model');

const register = async (req, res, next) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ error: { message: 'Email already exists.' } });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid email or password.' } });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: { message: 'Invalid email or password.' } });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password');
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found.' } });
    }
    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user._id !== req.params.id) {
      return res.status(403).json({ error: { message: 'Access denied.' } });
    }

    const { error } = validatePasswordUpdate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found.' } });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  deleteUser,
  updatePassword
};
