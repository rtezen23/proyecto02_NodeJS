const express = require('express');
const { upload } = require('../utils/upload.util.js');

// Controllers
const {
    createProduct,
    getActiveProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getActiveCategories,
    createCategory,
    updateCategory,
} = require('../controllers/products.controller');

// Middlewares
const { createProductValidators } = require('../middlewares/validators.middleware');
const { productExists } = require('../middlewares/products.middleware');
const { categoryExists } = require('../middlewares/categories.middleware');
const { protectSession, protectUserAccount } = require('../middlewares/auth.middleware');

const productsRouter = express.Router();
//createProductValidators, 
productsRouter.use(protectSession);
productsRouter.post('/', upload.array('productImg', 5), createProductValidators, createProduct);
productsRouter.get('/', getActiveProducts);

productsRouter.get('/categories', getActiveCategories);
productsRouter.post('/categories', createCategory);
productsRouter.patch('/categories/:id', categoryExists, updateCategory);

productsRouter.get('/:id', productExists, getProductById)
productsRouter
    .use('/:id', productExists)
    .route('/:id')
    .patch(updateProduct)
    .delete(deleteProduct);


module.exports = { productsRouter };
