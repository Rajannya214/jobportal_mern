import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Register Company
export const registerCompany = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false,
      });
    }

    let company = await Company.findOne({ name });
    if (company) {
      return res.status(400).json({
        message: "You can't register the same company.",
        success: false,
      });
    }

    company = await Company.create({
      name,
      userId: req.id,
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get all companies
export const getCompany = async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.id });

    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ UPDATE COMPANY (IMPORTANT FIX)
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const updateData = { name, description, website, location };

    // Safe file upload
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        const cloudRes = await cloudinary.uploader.upload(
          fileUri.content,
          { folder: "company_logos" }
        );
        updateData.logo = cloudRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        // DO NOT FAIL REQUEST
      }
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company information updated.",
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
