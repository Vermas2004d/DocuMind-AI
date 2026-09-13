import "dotenv/config";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const googleLogin = async (req, res) => {
  try {
    console.log("Google auth request received");
    const { credential } = req.body;

    console.log("Credential received:", Boolean(credential));

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log("Google token verified");

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const profilePicture = payload.picture;

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        profilePicture,
      });
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.profilePicture && profilePicture) {
        user.profilePicture = profilePicture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    console.log("User found/created:", user._id.toString());

    // Create our application's JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("JWT generated:", Boolean(token));
    console.log("Sending auth response");

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message || error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};