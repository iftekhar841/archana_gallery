const mongoose = require("mongoose");

const homeBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    bannerImage: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Home = mongoose.model("Home", homeBannerSchema);

module.exports = Home;
