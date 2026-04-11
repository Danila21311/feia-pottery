const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true
    },
    care: {
      type: DataTypes.STRING,
      allowNull: true
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    collection: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  return Product;
};
