const express = require('express');

const auth = require('../middlewares/auth.middleware');
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
router.get('/preparation-time/:minutes', auth, getRecipesByPreparationTime);
router.get('/', auth, getRecipes);
router.get('/:id', auth, getRecipeById);

router.post('/', auth, addRecipe);
router.patch('/:id', auth, updateRecipe);
router.delete('/:id', auth, deleteRecipe);

module.exports = router;

