const express = require('express');

// Controllers
const {
    addProductToCart,
    updateCartProduct,
    deleteCartProduct,
    purchaseCart,
} = require('../controllers/carts.controller');

// Middlewares
// const { createcartValidators } = require('../middlewares/validators.middleware');
// const { cartExists } = require('../middlewares/carts.middleware');
const { protectSession } = require('../middlewares/auth.middleware');

const cartsRouter = express.Router();
cartsRouter.use(protectSession);
cartsRouter.post('/add-product', addProductToCart);
cartsRouter.patch('/update-cart', updateCartProduct);
cartsRouter.delete('/:productId', deleteCartProduct);
cartsRouter.post('/purchase', purchaseCart);

module.exports = { cartsRouter };
