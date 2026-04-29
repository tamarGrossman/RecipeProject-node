const express = require('express');

const auth = require('../middlewares/auth.middleware');
const optionalAuth = require('../middlewares/optional-auth.middleware');
const {
  getRecipes,
  getRecipeById,
  getRecipesByPreparationTime,
  addRecipe,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipes.controller');

const router = express.Router();

// IMPORTANT: keep specific routes before "/:id".
router.get('/preparation-time/:minutes', optionalAuth, getRecipesByPreparationTime);
router.get('/', optionalAuth, getRecipes);
router.get('/:id', optionalAuth, getRecipeById);

router.post('/', auth, addRecipe);
router.patch('/:id', auth, updateRecipe);
router.delete('/:id', auth, deleteRecipe);

module.exports = router;

