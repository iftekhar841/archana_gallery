const express = require("express");
const userController = require("../../controllers/userController");
const { verifyJWT } = require("../../middleware/authMiddleware");

const userRoute = express.Router();

userRoute.post("/register", userController.registerUser);

userRoute.post("/login", userController.userLogin);

userRoute.post("/logout", verifyJWT, userController.userLogout);

userRoute.get("/isLogin-user", verifyJWT, userController.isLoginUser);

module.exports = userRoute;
