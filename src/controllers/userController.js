const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const registerUser = asyncHandler(async (req, res) => {
  try {
    if (
      !req.body.fullName ||
      !req.body.email ||
      !req.body.password ||
      !req.body.phoneNumber
    ) {
      return res
        .status(400)
        .json({ success: false, message: "required feilds are missing" });
    }

    // Register the user with the provided data
    const registerResponse = await userService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered Successfully.",
      user: registerResponse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const userLogin = asyncHandler(async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ success: false, message: "required feilds are missing" });
    }

    const { loggedInUser, accessToken } = await userService.userLogin(req.body);

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      success: true,
      message: "User logged in successfully.",
      accessToken,
      user: loggedInUser,
    });
  } catch (error) {
    console.error("Login Error:", error); // ✅ Better error logging

    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed.",
    });
  }
});

const userLogout = asyncHandler(async (req, res) => {
  try {
    const logoutResponse = await userService.userLogout();
    console.log("logout", logoutResponse);

    // Set cookie options for enhanced security
    const options = {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production",  // Secure cookies in production
      // sameSite: "Strict",  // Prevent CSRF attacks
    };

    res.clearCookie("accessToken", options);

    return res
      .status(200)
      .json({ success: true, message: logoutResponse.message });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed.",
    });
  }
});

module.exports = {
  registerUser,
  userLogin,
  userLogout,
};
