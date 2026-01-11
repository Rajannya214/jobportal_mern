import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// ----------------- REGISTER COMPANY -----------------
export const registerCompany = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Company name is required",
                success: false,
            });
        }

        // Check if company already exists
        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({
                message: "A company with this name already exists",
                success: false,
            });
        }

        // Create company
        const company = await Company.create({
            name,
            userId: req.id, // from auth middleware
        });

        return res.status(201).json({
            message: "Company registered successfully",
            company,
            success: true,
        });
    } catch (error) {
        console.error("Register Company Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ----------------- GET ALL COMPANIES -----------------
export const getCompany = async (req, res) => {
    try {
        const companies = await Company.find({ userId: req.id });
        return res.status(200).json({
            companies,
            success: true,
        });
    } catch (error) {
        console.error("Get Companies Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ----------------- GET COMPANY BY ID -----------------
export const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                message: "Company not found",
                success: false,
            });
        }
        return res.status(200).json({
            company,
            success: true,
        });
    } catch (error) {
        console.error("Get Company By ID Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ----------------- UPDATE COMPANY -----------------
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const updateData = { name, description, website, location };

        // Optional logo upload
        if (req.file) {
            try {
                const fileUri = getDataUri(req.file);
                const cloudRes = await cloudinary.uploader.upload(fileUri.content, {
                    folder: "company_logos",
                });
                updateData.logo = cloudRes.secure_url;
            } catch (err) {
                console.error("Cloudinary upload failed:", err);
                // Don't fail the whole request if upload fails
            }
        }

        // Update company
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
        return res.status(500).json({ message: "Server error", success: false });
    }
};
