const contactService = require("../services/contactService");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

const createContact = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, phoneNumber, message } = req.body;

    // ✅ Validate required fields
    if (!fullName || !email || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (Full Name, Email, Phone Number, Message) are required.",
      });
    }

    // ✅ Call service to create contact entry
    const contact = await contactService.createContact(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Your inquiry has been submitted successfully. We will get back to you soon via email.",
      contact,
    });
  } catch (error) {
    console.error("Contact Error failed", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while sending contact. Please try again.",
    });
  }
});

const deleteContact = asyncHandler(async (req, res) => {
  try {
    const { id: contactId } = req.params;
    // Check if exhibitionId is valid
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Contact ID format.",
      });
    }

    // Check if the user is an admin
    const isAuthenticated = req.user;
    if (!isAuthenticated || isAuthenticated.role !== process.env.IS_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access! Only admins can delete contact.",
      });
    }

    const contactResponse = await contactService.deleteContact(contactId);

    return res.status(200).json({
      success: true,
      message: "Contact deleting successfully",
      contct: contactResponse,
    });
  } catch (error) {
    console.error("Conact Error failed", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while deleting contact. Please try again.",
    });
  }
});

const getContactList = asyncHandler(async (req, res) => {
  try {
    const contactResponse = await contactService.getContactList();

    return res.status(200).json({
      success: true,
      message: "Contact fetching successfully.",
      contact: contactResponse,
    });
  } catch (error) {
    console.error("Contact Error failed".error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while fetching contact. Please try again.",
    });
  }
});

module.exports = {
  createContact,
  deleteContact,
  getContactList,
};
