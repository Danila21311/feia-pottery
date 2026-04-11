const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Import models
const User = require('./User')(sequelize);
const UserRole = require('./UserRole')(sequelize);
const Product = require('./Product')(sequelize);
const Workshop = require('./Workshop')(sequelize);
const Order = require('./Order')(sequelize);

// Associations
User.hasMany(UserRole, { foreignKey: 'userId', as: 'roles' });
UserRole.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  UserRole,
  Product,
  Workshop,
  Order
};
