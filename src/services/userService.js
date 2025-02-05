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

  console.log("userDetails", userDetails);

  if (
    [fullName, email, password, phoneNumber].some(
      (field) =>
        (typeof field !== "string" && typeof field !== "number") ||
        (typeof field === "string" && field.trim() === "")
    )
  ) {
    throw new Error(
      "All fields are required and must be non-empty strings or numbers"
    );
  }

  const existingUser = await User.findOne({ email });
  console.log("existingUser", existingUser);

  if (existingUser) {
    throw new Error("Email is already exist");
  }

  const emailRegex = validateEmail(email);
  console.log("email", emailRegex);

  // Check if the phone number already exists
  const existingPhoneNumber = await User.findOne({ phoneNumber });
  if (existingPhoneNumber) {
    throw new Error("Phone number already exists, please use a unique number");
  }

  console.log("existingPhoneNumber", existingPhoneNumber);

  const user = await User.create({
    fullName,
    email: emailRegex,
    password,
    phoneNumber,
    recieveNewsLetter,
    role,
  });

  console.log("User", user);
  if (!user) {
    throw new Error("Something went wrong while registering the user");
  }

  // Convert the Mongoose document to a plain JS object
  const userObject = user.toObject();

  // Exclude the password field
  delete userObject.password;

  console.log("userObject", userObject);

  return userObject;
};

// This service method handles the login logic
const userLogin = async (loginDetails) => {
  const { email, password } = loginDetails;

  if (
    [email, password].some(
      (field) => typeof field === "string" && field.trim() === ""
    )
  ) {
    throw new Error("All fields are required and must be non-empty strings");
  }

  // Check if the user exists or not
  const isUserExists = await User.findOne({ email });

  console.log("isUserExists", isUserExists);

  if (!isUserExists) {
    throw new Error("User doesn't exits");
  }

  const isPasswordValid = await isUserExists.isPasswordCorrect(password);
  console.log("isPass", isPasswordValid);

  if (!isPasswordValid) {
    throw new Error("Invalid user credentials.");
  }

  const accessToken = await generateToken(isUserExists);

  console.log("acess", accessToken);

  // Convert the Mongoose document to a plain JS object
  const loggedInUser = isUserExists.toObject();

  // Exclude the password field
  delete loggedInUser.password;

  console.log("loggedInUser", loggedInUser);

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
