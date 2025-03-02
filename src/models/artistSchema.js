const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    artistEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    artistImage: {
      type: Array,
      required: true,
    },
    dateOfBirth: {
      type: String, // Store as String to maintain custom format
      required: true,
    },
    presentAddress: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` automatically
  }
);

const Artist = mongoose.model("Artist", artistSchema);

module.exports = Artist;
