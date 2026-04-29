const express = require('express');

const auth = require('../middlewares/auth.middleware');
const {
  getCategories,
  getCategoriesWithRecipes,
  getCategoryByCodeOrNameWithRecipes
} = require('../controllers/categories.controller');

const router = express.Router();

router.get('/', auth, getCategories);
router.get('/with-recipes', auth, getCategoriesWithRecipes);
router.get('/:key/recipes', auth, getCategoryByCodeOrNameWithRecipes);

module.exports = router;
