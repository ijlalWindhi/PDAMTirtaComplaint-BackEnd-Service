'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        foreignKey: 'id_user',
        as: 'user'
      });
    }
  }
  report.init({
    id_user: DataTypes.INTEGER,
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    address: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'report',
    timestamps: false,
    tableName: 'report'
  });
  return report;
};