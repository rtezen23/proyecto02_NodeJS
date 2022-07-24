const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/01-user.model');
const { Product } = require('../models/02-product.model');
const { Order } = require('../models/05-order.model');
const { Cart } = require('../models/04-cart.model');
const { ProductInCart } = require('../models/06-productInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

// Gen secrets for JWT, require('crypto').randomBytes(64).toString('hex')

dotenv.config({ path: './config.env' });

const getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.findAll({ attributes: { exclude: ['password'] } });
	res.status(200).json({
		status: 'success',
		users,
	});
});

const createUser = catchAsync(async (req, res, next) => {
	const { username, email, password } = req.body;

	// Hash password
	const salt = await bcrypt.genSalt(12);
	const hashPassword = await bcrypt.hash(password, salt);

	const newUser = await User.create({
		username,
		email,
		password: hashPassword,
	});

	// Remove password from response
	newUser.password = undefined;

	// Send welcome email
	await new Email(email).sendWelcome(username);

	res.status(201).json({
		status: 'success',
		newUser,
	});
});

const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate credentials (email)
	const user = await User.findOne({
		where: {
			email,
			status: 'active',
		},
	});

	if (!user) {
		return next(new AppError('Credentials invalid', 400));
	}

	// Validate password
	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) {
		return next(new AppError('Credentials invalid', 400));
	}

	// Generate JWT (JsonWebToken) ->
	const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});

	// Send response
	res.status(200).json({
		status: 'success',
		token,
	});
});

const getUserProducts = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const products = await Product.findAll({ where: { userId: sessionUser.id } });

	return res.status(200).json({
		status: 'success',
		products,
	})
});

const updateUser = catchAsync(async (req, res, next) => {
	const { user } = req;
	const { username } = req.body;

	await user.update({ username });

	res.status(204).json({ status: 'success' });
});

const deleteUser = catchAsync(async (req, res, next) => {
	const { user } = req;

	// await user.destroy();
	await user.update({ status: 'deleted' });

	res.status(204).json({ status: 'success' });
});

const getUserOrders = catchAsync(async (req, res, next) => {
	const { sessionUser } = req;

	const orders = await Order.findAll({
		include: { model: Cart, include: ProductInCart },
		where: { userId: sessionUser.id }
	});

	return res.status(200).json({
		status: 'success',
		orders,
	})
});

const getUserOrderById = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const order = await Order.findOne({
		include: { model: Cart, include: ProductInCart },
		where: { userId: id }
	});

	return res.status(200).json({
		status: 'success',
		order,
	})
});

module.exports = {
	createUser,
	login,
	getUserProducts,
	updateUser,
	deleteUser,
	getUserOrders,
	getUserOrderById,
	getAllUsers,
};
