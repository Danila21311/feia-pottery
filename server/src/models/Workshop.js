const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Workshop = sequelize.define('Workshop', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    format: {
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
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    currentParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    includes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'workshops',
    timestamps: true
  });

  return Workshop;
};
