import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// -------------------- REGISTER USER --------------------
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email.",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle optional profile photo
    let profilePhotoUrl = null;
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudRes = await cloudinary.uploader.upload(fileUri.content);
        profilePhotoUrl = cloudRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        profilePhotoUrl = null;
      }
    }

    // Create user
    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: profilePhotoUrl,
      },
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// -------------------- LOGIN USER --------------------
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
        message: "Account doesn't exist with the selected role.",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const userData = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user: userData,
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// -------------------- LOGOUT USER --------------------
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};

// -------------------- UPDATE PROFILE --------------------
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const userId = req.id; // from authentication middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Update basic info
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skills.split(",").map(s => s.trim());

    // Optional resume/profile photo upload
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudRes = await cloudinary.uploader.upload(fileUri.content);

        // Determine if this is resume or profile photo (you can customize logic)
        if (req.body.type === "resume") {
          user.profile.resume = cloudRes.secure_url;
          user.profile.resumeOriginalName = req.file.originalname;
        } else {
          user.profile.profilePhoto = cloudRes.secure_url;
        }
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      success: false,
    });
  }
};
