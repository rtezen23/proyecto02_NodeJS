const express = require('express');

// Controllers
const {
	createUser,
	login,
	getUserProducts,
	updateUser,
	deleteUser,
	getUserOrders,
	getUserOrderById,
	getAllUsers,
} = require('../controllers/users.controller');

// Middlewares
const {
	createUserValidators,
} = require('../middlewares/validators.middleware');
const { userExists } = require('../middlewares/users.middleware');
const { protectSession, protectUserAccount } = require('../middlewares/auth.middleware');

const usersRouter = express.Router();

usersRouter.get('/', getAllUsers);
usersRouter.post('/', createUserValidators, createUser);

usersRouter.post('/login', login);

usersRouter.use(protectSession);

usersRouter.get('/me', getUserProducts);

usersRouter.get('/orders', getUserOrders);
usersRouter.get('/orders/:id', getUserOrderById);

usersRouter
	.use('/:id', userExists)
	.use('/:id', protectUserAccount)
	.route('/:id')
	.patch(updateUser)
	.delete(deleteUser);


module.exports = { usersRouter };
