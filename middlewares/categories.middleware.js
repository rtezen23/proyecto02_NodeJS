// Models
const { Category } = require('../models/03-category.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const categoryExists = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findOne({ where: { id } });

    if (!category) {
        return next(new AppError('Category not found', 404));
    }

    req.category = category;
    next();
});

module.exports = { categoryExists };
