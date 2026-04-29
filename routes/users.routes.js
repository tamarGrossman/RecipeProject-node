const express = require('express');
const {
  register,
  login,
  getAllUsers,
  deleteUser,
  updatePassword
} = require('../controllers/users.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', auth, admin, getAllUsers);
router.delete('/:id', auth, admin, deleteUser);
router.patch('/:id/password', auth, updatePassword);

module.exports = router;
