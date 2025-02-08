const User = require("../models/userSchema.js");
const jwt = require("jsonwebtoken");
const { validateEmail } = require("../helpers/helperFunction.js");

// Generate the token
const generateToken = async (user) => {
  return jwt.sign(
    {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

//Register User
const registerUser = async (userDetails) => {
  const { fullName, email, password, role, phoneNumber, recieveNewsLetter } =
    userDetails;

  const existingUser = await User.findOne({ email }).select("email");

  if (existingUser) {
    throw new Error("Email is already exist");
  }

  const emailRegex = validateEmail(email);

  // Check if the phone number already exists
  const existingPhoneNumber = await User.findOne({ phoneNumber }).select(
    "phoneNumber"
  );
  if (existingPhoneNumber) {
    throw new Error("Phone number already exists, please use a unique number");
  }

  const user = await User.create({
    fullName,
    email: emailRegex,
    password,
    phoneNumber,
    recieveNewsLetter,
    role,
  });
  if (!user) {
    throw new Error("Something went wrong while registering the user");
  }

  // Convert the Mongoose document to a plain JS object
  const userObject = user.toObject();

  // Exclude the password field
  delete userObject.password;

  return userObject;
};

// This service method handles the login logic
const userLogin = async (loginDetails) => {
  const { email, password } = loginDetails;

  // Check if the user exists or not
  const isUserExists = await User.findOne({ email });

  if (!isUserExists) {
    throw new Error("User doesn't exits");
  }

  const isPasswordValid = await isUserExists.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new Error("Invalid user credentials.");
  }

  const accessToken = await generateToken(isUserExists);

  // Convert the Mongoose document to a plain JS object
  const loggedInUser = isUserExists.toObject();

  // Exclude the password field
  delete loggedInUser.password;

  return {
    loggedInUser,
    accessToken,
  };
};

//Logout User
const userLogout = async () => {
  return { message: "User logged out successfully." };
};

module.exports = {
  registerUser,
  userLogin,
  userLogout,
};
