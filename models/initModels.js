// Models
const { User } = require('./01-user.model');
const { Product } = require('./02-product.model');
const { Category } = require('./03-category.model');
const { ProductImg } = require('./07-productImg.model');
const { Order } = require('./05-order.model');
const { Cart } = require('./04-cart.model');
const { ProductInCart } = require('./06-productInCart.model');

const initModels = () => {

    User.hasMany(Product, { foreignKey: 'userId' });
    Product.belongsTo(User);

    User.hasMany(Order, { foreignKey: 'userId' });
    Order.belongsTo(User);

    User.hasOne(Cart, { foreignKey: 'userId' });
    Cart.belongsTo(User);

    Product.hasMany(ProductImg, { foreignKey: 'productId' });
    ProductImg.belongsTo(Product);

    Category.hasOne(Product, { foreignKey: 'categoryId' });
    Product.belongsTo(Category);

    Cart.hasOne(Order, { foreignKey: 'cartId' });
    Order.belongsTo(Cart);

    Cart.hasMany(ProductInCart, { foreignKey: 'cartId' });
    ProductInCart.belongsTo(Cart);

    ProductInCart.hasMany(ProductImg, { foreignKey: 'productId' });
    ProductImg.belongsTo(ProductInCart);

};

module.exports = { initModels };
