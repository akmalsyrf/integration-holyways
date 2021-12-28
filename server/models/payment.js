"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      payment.belongsTo(models.user, {
        foreignKey: {
          name: "idUser",
        },
      });
      payment.belongsTo(models.fund, {
        foreignKey: {
          name: "idFund",
        },
      });
    }
  }
  payment.init(
    {
      fullname: DataTypes.STRING,
      email: DataTypes.STRING,
      donateAmount: DataTypes.INTEGER,
      status: DataTypes.STRING,
      proofAttachment: DataTypes.STRING,
      idUser: DataTypes.INTEGER,
      idFund: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "payment",
    }
  );
  return payment;
};
