"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("users", [
      {
        fullname: "Andi",
        email: "andi@mail.com",
        password: hashedPassword,
      },
      {
        fullname: "Jamal",
        email: "jamal@mail.com",
        password: hashedPassword,
      },
      {
        fullname: "Udin",
        email: "udin@mail.com",
        password: hashedPassword,
      },
    ]);

    await queryInterface.bulkInsert("funds", [
      {
        title: "The Strength of a People, Power of Community",
        thumbnail: "strength.png",
        goal: "200000000",
        description: "The Strength of a People. The Power of Community Campaign was created in response to the financial needs as a direct result of the COVID-19 pandemic.",
        idUser: "1",
      },
      {
        title: "Empowering Communities, Ending Poverty",
        thumbnail: "poverty.png",
        goal: "200000000",
        description: "More than seven hundred million people in the world are estimated to be living in extreme poverty and 70 percent of the world's poor are women.",
        idUser: "2",
      },
      {
        title: "Please help our brothers in flores",
        thumbnail: "flores.png",
        goal: "200000000",
        description:
          "Our brother Carlos Flores is in need of our help. He has been battling COVID and has been in hospital for a few weeks. He recently got admitted to the ICU, due to an infection in his lungs caused by different medications given to him during these last weeks. Meanwhile, his wife has also came out positive and unable to work. The Flores Family needs us now and to know they are not alone in this battle. We are his friend and his family, we are here to help him with whatever we can to make it easier on them.",
        idUser: "3",
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
