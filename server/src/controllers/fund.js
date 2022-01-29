const { fund, payment, user } = require("../../models");
const fs = require("fs");

exports.getAllFunds = async (req, res) => {
  try {
    const dataFund = await fund.findAll({
      // include: [
      //   {
      //     model: payment,
      //     as: "usersDonate",
      //     attributes: { exclude: ["idFund", "createdAt", "updatedAt"] },
      //   },
      // ],
      order: [["id", "DESC"]],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    const usersDonate = await payment.findAll({
      attributes: { exclude: ["createdAt"] },
    });

    const data = dataFund.map((fund) => {
      return {
        id: fund.id,
        title: fund.title,
        thumbnail: fund.thumbnail,
        goal: fund.goal,
        description: fund.description,
        idUser: fund.idUser,
        donationObtained: usersDonate.reduce((total, donation) => {
          if (donation.idFund == fund.id) {
            if (donation.status == "success") {
              return total + donation.donateAmount;
            } else {
              return total;
            }
          } else {
            return total;
          }
        }, 0),
        usersDonate: usersDonate.map((donate) => {
          if (donate.idFund == fund.id) {
            return donate;
          } else {
            return "";
          }
        }),
      };
    });
    res.status(200).send({
      status: "success",
      data: {
        funds: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.getFund = async (req, res) => {
  try {
    const { id } = req.params;
    const dataFund = await fund.findOne({
      where: { id },
      // include: [
      //   {
      //     model: payment,
      //     as: "usersDonate",
      //     attributes: { exclude: ["createdAt", "updatedAt"] },
      //   },
      // ],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    const usersDonate = await payment.findAll({
      where: { idFund: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const data = {
      id: dataFund.id,
      title: dataFund.title,
      thumbnail: dataFund.thumbnail,
      goal: dataFund.goal,
      description: dataFund.description,
      idUser: dataFund.idUser,
      donationObtained: usersDonate.reduce((total, donation) => {
        if (donation.idFund == dataFund.id) {
          if (donation.status == "success") {
            return total + donation.donateAmount;
          } else {
            return total;
          }
        } else {
          return total;
        }
      }, 0),
      usersDonate: usersDonate.map((donate) => {
        if (donate.idFund == dataFund.id) {
          return donate;
        } else {
          return "";
        }
      }),
    };
    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.addFund = async (req, res) => {
  console.log(req.users);
  try {
    const data = await fund.create({
      ...req.body,
      idUser: req.users.id,
      thumbnail: req.file.filename,
    });
    const value = data.dataValues;
    const response = {
      id: value.id,
      title: value.title,
      thumbnail: value.thumbnail,
      goal: value.goal,
      description: value.description,
    };
    res.status(200).send({
      status: "success",
      data: {
        fund: { ...response, usersDonate: [] },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.editFund = async (req, res) => {
  try {
    const { id } = req.params;
    const compareImg = await fund.findOne({ where: { id } });
    // if (req.file.filename != compareImg.dataValues.thumbnail) {
    // }
    const body = {
      ...req.body,
      // thumbnail: req.file.filename,
      idUser: req.users.id,
    };
    await fund.update(body, { where: { id } });
    const data = await fund.findOne({
      where: { id },
      include: [
        {
          model: payment,
          as: "usersDonate",
          attributes: { exclude: ["idUser", "idFund", "createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["idUser", "createdAt", "updatedAt"] },
    });
    res.status(200).send({
      status: "success",
      data: {
        fund: data,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.deleteFund = async (req, res) => {
  try {
    const { id } = req.params;

    //delete proof attachment
    const dataPayment = await payment.findAll({
      where: {
        idFund: id,
      },
    });

    if (dataPayment) {
      dataPayment.map((donate) => {
        fs.unlink("uploads/" + donate.proofAttachment, (err) => {
          if (err) throw err;
          return console.log("Delete proof donate image");
        });
      });
    }

    //delete thumbnail fund
    const dataFund = await fund.findOne({
      where: {
        id,
      },
    });
    fs.unlink("uploads/" + dataFund.thumbnail, (err) => {
      if (err) throw err;
      console.log("Delete fund thumbnail");
    });

    //delete fund
    await fund.destroy({ where: { id } });
    res.status(200).send({
      status: "success",
      data: {
        id,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
