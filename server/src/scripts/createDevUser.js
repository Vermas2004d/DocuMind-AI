import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";

dotenv.config();

const createDevUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    let user = await User.findOne({
      email: "dev@documind.ai",
    });

    if (!user) {
      user = await User.create({
        name: "DocuMind Developer",
        email: "dev@documind.ai",
      });
    //   6aa3f24ee448fe20630cbf2d

      console.log("Development user created");
    } else {
      console.log("Development user already exists");
    }

    console.log("User ID:", user._id.toString());

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create development user:", error);
    process.exit(1);
  }
};

createDevUser();

