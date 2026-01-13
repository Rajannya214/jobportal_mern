import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const updateCompany = async (req, res) => {
  try {
    // Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid company ID",
        success: false,
      });
    }

    const { name, description, website, location } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (website) updateData.website = website;
    if (location) updateData.location = location;

    // Optional logo upload
    if (req.file && req.file.buffer) {
      const fileUri = getDataUri(req.file);
      const cloudRes = await cloudinary.uploader.upload(
        fileUri.content,
        { folder: "company_logos" }
      );
      updateData.logo = cloudRes.secure_url;
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company information updated successfully",
      company,
      success: true,
    });

  } catch (error) {
    console.error("Update Company Error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false,
    });
  }
};
