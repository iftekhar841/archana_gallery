const Contact = require("../models/contactSchema");
const { validateEmail } = require("../helpers/helperFunction");
const sendEmail = require("../utils/sendEmail");

const createContact = async (contactDetails) => {
  const { fullName, email, phoneNumber, recieveNewsLetter, message } =
    contactDetails;

  console.log("🚀 ~ createContact ~ contactDetails:", contactDetails);

  const isExists = await Contact.findOne({ email });

  if (isExists) {
    throw new Error("Email already exists");
  }

  const emailRegex = validateEmail(email);
  console.log("🚀 ~ createContact ~ emailRegex:", emailRegex);

  const newContact = await Contact.create({
    fullName,
    email: emailRegex,
    phoneNumber,
    recieveNewsLetter,
    message,
  });

  if (!newContact) {
    throw new Error("Something went wrong while sending the contact.");
  }

  // ✅ Send email to admin if `recieveNewsLetter` is true
  if (recieveNewsLetter) {
    const adminEmail = email;
    const subject = "New Contact Inquiry Received";
    const emailBody = `
      <h2>New Inquiry Submitted</h2>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Receive Newsletter:</strong> Yes</p>
    `;

    await sendEmail(adminEmail, subject, emailBody);
  }

  return newContact;
};

const deleteContact = async (contactId) => {
  // Directly delete the contact and check if it exists in one query
  const deletedContact = await Contact.findByIdAndDelete(contactId);

  if (!deletedContact) {
    throw new Error("Contact does not exist or has already been deleted.");
  }

  const fetchAllContact = await Contact.find();

  if (!fetchAllContact || fetchAllContact.length === 0) {
    throw new Error("No contact record found.");
  }

  return fetchAllContact;
};

const getContactList = async () => {
  const allContact = await Contact.find();

  if (!allContact || allContact.length === 0) {
    throw new Error("No record found of this contact ");
  }

  return allContact;
};

module.exports = {
  createContact,
  deleteContact,
  getContactList,
};
