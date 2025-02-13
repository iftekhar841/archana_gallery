const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");

const app = express();

// Use morgan middleware with the "dev" format
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(helmet());
app.use(fileUpload()); // Enable file upload middleware

// Globally invalid routes handles
// app.use((req, res, next) => {
//   res
//     .status(404)
//     .json({
//       success: false,
//       message: `Cannot ${req.method} ${req.originalUrl}`,
//     });
// });

// Route Import Here
const {
  userRoute,
  artistRoute,
  artWorkRoute,
  homeRoute,
} = require("./src/routes/index.js");

//routes declaration
app.use("/api/user", userRoute);
app.use("/api/artist", artistRoute);
app.use("/api/artWork", artWorkRoute);
app.use("/api/banner", homeRoute);

app.get("/", (req, res) => {
  res.send("Now we are showing the data from here");
});

module.exports = app;
