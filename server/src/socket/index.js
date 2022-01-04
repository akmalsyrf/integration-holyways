const { user } = require("../../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const connectedUser = {};
const socketIo = (io) => {};

module.exports = socketIo;
