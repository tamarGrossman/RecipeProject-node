const express = require('express');

const auth = require('../middlewares/auth.middleware');
const optionalAuth = require('../middlewares/optional-auth.middleware');
const {
  getCategories,
  getCategoriesWithRecipes,
  getCategoryByCodeOrNameWithRecipes
} = require('../controllers/categories.controller');

const router = express.Router();

router.get('/', optionalAuth, getCategories);
router.get('/with-recipes', optionalAuth, getCategoriesWithRecipes);
router.get('/:key/recipes', optionalAuth, getCategoryByCodeOrNameWithRecipes);

module.exports = router;
