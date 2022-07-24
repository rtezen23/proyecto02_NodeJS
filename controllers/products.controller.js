// Models
const { Product } = require('../models/02-product.model');
const { Category } = require('../models/03-category.model');
const { ProductImg } = require('../models/07-productImg.model');

const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase.util');

const { AppError } = require('../utils/appError.util');

const { catchAsync } = require('../utils/catchAsync.util');

const createProduct = catchAsync(async (req, res, next) => {
    const { title, description, price, categoryId, quantity } = req.body;
    const { sessionUser } = req;

    const newProduct = await Product.create({
        title,
        description,
        price,
        categoryId,
        quantity,
        userId: sessionUser.id,
    });

    if (req.files.length > 0) {
        const filesPromises = req.files.map(async file => {
            const imgRef = ref(storage, `products/${Date.now()}_${file.originalname}`);
            const imgRes = await uploadBytes(imgRef, file.buffer);

            return await ProductImg.create({
                productId: newProduct.id,
                imgUrl: imgRes.metadata.fullPath,
            });
        });

        await Promise.all(filesPromises);
    }

    res.status(201).json({
        status: 'success',
        newProduct,
    });
});

const getActiveProducts = catchAsync(async (req, res, next) => {

    const products = await Product.findAll({
        where: { status: 'active' }
    });

    res.status(200).json({
        status: 'success',
        products,
    });
});

const getProductById = catchAsync(async (req, res, next) => {
    const { product } = req;

    // Map async
    // const productImgsPromises = product.productImgs.map(async productImg => {
    //     const imgRef = ref(storage, productImg.imgUrl);

    //     const imgFullPath = await getDownloadURL(imgRef);

    //     productImg.imgUrl = imgFullPath;
    // });

    // await Promise.all(productImgsPromises);

    res.status(200).json({
        status: 'success',
        product,
    });
});

const updateProduct = catchAsync(async (req, res, next) => {
    const { product, sessionUser } = req;
    const { title, description, price, quantity } = req.body;

    if (product.userId !== sessionUser.id) {
        return next(new AppError("You didn't create this product", 401))
    }

    await product.update({ title, description, price, quantity });

    res.status(204).json({ status: 'success' });
});

const deleteProduct = catchAsync(async (req, res, next) => {
    const { product, sessionUser } = req;

    if (product.userId !== sessionUser.id) {
        return next(new AppError("You didn't create this product", 401))
    }

    await product.update({ status: 'inactive' });

    res.status(204).json({ status: 'success' });
});

const getActiveCategories = catchAsync(async (req, res, next) => {

    const categories = await Category.findAll({
        where: { status: 'active' }
    });

    res.status(200).json({
        status: 'success',
        categories,
    });
});

const createCategory = catchAsync(async (req, res, next) => {

    const { name } = req.body;

    const newCategory = await Category.create({
        name,
    });

    res.status(201).json({
        status: 'success',
        newCategory,
    });
});

const updateCategory = catchAsync(async (req, res, next) => {
    const { category } = req;
    const { name } = req.body;

    await category.update({ name });

    res.status(204).json({ status: 'success' });
});


module.exports = {
    createProduct,
    getActiveProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getActiveCategories,
    createCategory,
    updateCategory,
};
