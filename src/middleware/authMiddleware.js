const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("token", token);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized request: Token missing" });
    }

    // Verify if the secret key is provided
    if (!process.env.ACCESS_TOKEN_KEY) {
      throw new Error("Server configuration error: Missing access token key");
    }

    // Verify JWT Token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    const user = await User.findById(decodedToken?.id).select("-password");
    // console.log("user", user);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Access Token: User not found" });
    }

    req.user = user; // Attaching user to the request object
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token has expired" });
    }
    return res
      .status(401)
      .json({ message: error.message || "Invalid access token" });
  }
});

const optionalVerifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null; // No token → Public access
      return next();
    }

    if (!process.env.ACCESS_TOKEN_KEY) {
      throw new Error("Server configuration error: Missing access token key");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    const user = await User.findById(decodedToken?.id).select("-password");

    if (!user) {
      req.user = null; // Invalid token → Treat as public user
      return next();
    }

    req.user = user; // Attach user if valid
    next();
  } catch (error) {
    req.user = null; // Invalid token → Treat as public user
    next();
  }
};

module.exports = {
  verifyJWT,
  optionalVerifyJWT,
};
