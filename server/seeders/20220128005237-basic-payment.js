"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("payments", [
      {
        fullname: "Andi",
        email: "andi@mail.com",
        donateAmount: "75000000",
        status: "success",
        proofAttachment: "proof.png",
        idUser: 1,
        idFund: 1,
      },
      {
        fullname: "Andi",
        email: "andi@mail.com",
        donateAmount: "50000000",
        status: "success",
        proofAttachment: "proof.png",
        idUser: 1,
        idFund: 2,
      },
      {
        fullname: "Andi",
        email: "andi@mail.com",
        donateAmount: "25000000",
        status: "success",
        proofAttachment: "proof.png",
        idUser: 1,
        idFund: 3,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
