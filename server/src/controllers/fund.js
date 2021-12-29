const { fund, payment, user } = require("../../models");

exports.getAllFunds = async (req, res) => {
  try {
    const data = await fund.findAll({
      include: [
        {
          model: payment,
          as: "usersDonate",
          attributes: { exclude: ["idFund", "createdAt", "updatedAt"] },
        },
      ],
      attributes: { exclude: ["idUser", "createdAt", "updatedAt"] },
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
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.addFund = async (req, res) => {
  try {
    const data = await fund.create({ ...req.body, idUser: req.users.id, thumbnail: req.file.filename });
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
    const data = await fund.destroy({ where: { id } });
    res.status(200).send({
      status: "success",
      data: {
        id: data,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.addUserDonate = async (req, res) => {
  const { fundId } = req.params;
  const userData = await user.findOne({
    where: { id: req.users.id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  const data = { ...req.body, fullname: userData.fullname, email: userData.email, proofAttachment: req.file.filename, idUser: userData.id, idFund: fundId };
  try {
    const userDonate = await payment.create(data);
    res.status(200).send({
      status: "success",
      data: {
        userDonate,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.editUserDonateByFund = async (req, res) => {
  try {
    const { fundId, userId } = req.params;

    await payment.update(req.body, { where: { idFund: fundId, id: userId } });

    const data = await fund.findOne({
      where: { id: fundId },
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
      data,
    });
  } catch (error) {
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
