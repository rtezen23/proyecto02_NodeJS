const { Cart } = require('../models/04-cart.model');
const { ProductInCart } = require('../models/06-productInCart.model');
const { Product } = require('../models/02-product.model');
const { Order } = require('../models/05-order.model');

const { Email } = require('../utils/email.util');
const { AppError } = require('../utils/appError.util');

const { catchAsync } = require('../utils/catchAsync.util');

const addProductToCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { productId, quantity } = req.body;

    let cartExist = await Cart.findOne({ where: { userId: sessionUser.id, status: 'active' } })
    if (!cartExist) cartExist = await Cart.create({ userId: sessionUser.id })

    const productInCartExist = await ProductInCart.findOne({ where: { productId, cartId: cartExist.id } })

    if (productInCartExist) {
        if (productInCartExist.status !== 'removed') {
            return next(new AppError("This product has already been added", 400));
        } else {
            if (quantity <= productInCartExist.quantity) {
                const newProductInCart = await productInCartExist.update({
                    status: 'active', quantity
                })

                return res.status(201).json({
                    status: 'success',
                    newProductInCart,
                });
            } else return next(new AppError("Requested quantity exceeded stock", 400));
        }

    }

    const productToAdd = await Product.findOne({ where: { id: productId } })

    if (quantity <= productToAdd.quantity) {
        const newProductInCart = await ProductInCart.create({
            cartId: cartExist.id,
            productId,
            quantity
        })

        res.status(201).json({
            status: 'success',
            newProductInCart,
        });
    } else return next(new AppError("Requested quantity exceeded stock", 400));

});

const updateCartProduct = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { productId, quantity } = req.body;

    const userCart = await Cart.findOne({ where: { userId: sessionUser.id } });
    const productInUserCart = await ProductInCart.findOne({ where: { productId, cartId: userCart.id } });
    const product = await Product.findOne({ where: { id: productInUserCart.productId } })

    if (quantity > product.quantity) {
        return next(new AppError('Requested quantity exceeded stock', 400));
    } else if (quantity === 0) {
        await productInUserCart.update({ quantity: 0, status: 'removed' })
    } else await productInUserCart.update({ quantity, status: 'active' })

    res.status(204).json({ status: 'success' });
});

const deleteCartProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { sessionUser } = req;

    const userCart = await Cart.findOne({ where: { userId: sessionUser.id } });
    const productInUserCart = await ProductInCart.findOne({ where: { productId, cartId: userCart.id } });

    await productInUserCart.update({ quantity: 0, status: 'removed' });

    res.status(204).json({ status: 'success' });
});

const purchaseCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const userCart = await Cart.findOne({ where: { userId: sessionUser.id, status: 'active' } });

    const cartProducts = await ProductInCart.findAll({ where: { cartId: userCart.id, status: 'active' } });

    let totalPrice = 0;
    let purchaseData = [];

    const cartProductsPromises = cartProducts.map(async cartProduct => {
        let purchaseItem = { name: '', price: 0, quantity: 0 };
        const product = await Product.findOne({ where: { id: cartProduct.productId } })
        purchaseItem.name = product.title;
        purchaseItem.price = product.price;
        purchaseItem.quantity = cartProduct.quantity;
        purchaseData.push(purchaseItem);
        await product.update({ quantity: product.quantity - cartProduct.quantity });
        totalPrice += cartProduct.quantity * product.price;
        await cartProduct.update({ status: 'purchased' })
    });

    await Promise.all(cartProductsPromises);
    console.log(purchaseData);

    await userCart.update({ status: 'purchased' })

    const newOrder = await Order.create({
        userId: sessionUser.id,
        cartId: userCart.id,
        totalPrice
    })

    await new Email(sessionUser.email).sendNewPurchase(purchaseData, totalPrice);


    res.status(201).json({
        status: 'success',
        newOrder,
    });

});

module.exports = {
    addProductToCart,
    updateCartProduct,
    deleteCartProduct,
    purchaseCart,
};