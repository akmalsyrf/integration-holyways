const express = require("express");
const router = express.Router();

//middlewares
const auth = require("../middlewares/auth");
const uploadFile = require("../middlewares/uploadFile");

//auth
const { login, register, checkAuth } = require("../controllers/auth");
router.post("/login", login);
router.post("/register", register);
router.get("/check-auth", auth, checkAuth);

//user
const { getAllUsers, editUser, deleteUser } = require("../controllers/user");
router.get("/users", getAllUsers);
router.patch("/user/:id", editUser);
router.delete("/user/:id", deleteUser);

// fund
const { getAllFunds, getFund, addFund, editFund, deleteFund } = require("../controllers/fund");
router.get("/funds", getAllFunds);
router.get("/fund/:id", getFund);
router.post("/fund", uploadFile("thumbnail"), auth, addFund);
router.patch("/fund/:id", auth, editFund);
router.delete("/fund/:id", auth, deleteFund);

//userDonate
const { getUserDonateByFund, editUserDonateByFund, addUserDonate, notification } = require("../controllers/userDonate");
router.get("/usersDonate/:fundId", getUserDonateByFund);
router.post("/fund/:fundId", auth, addUserDonate);
router.patch("/fund/:fundId/:userId", editUserDonateByFund);
router.post("/notification", notification);

module.exports = router;
