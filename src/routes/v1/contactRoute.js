const express = require("express");
const contactControllers = require("../../controllers/contactController");
const { verifyJWT } = require("../../middleware/authMiddleware");

const contactRoute = express.Router();

contactRoute.post("/sendInquiry", contactControllers.createContact);

contactRoute.delete(
  "/deleteInquiry/:id",
  verifyJWT,
  contactControllers.deleteContact
);

contactRoute.get("/getInquiry", contactControllers.getContactList);

module.exports = contactRoute;
