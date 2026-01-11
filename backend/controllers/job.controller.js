import { Job } from "../models/job.model.js";

// ----------------- ADMIN: POST NEW JOB -----------------
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id; // from auth middleware

        // Validation
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        // Create job
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        return res.status(201).json({
            message: "New job created successfully",
            job,
            success: true
        });

    } catch (error) {
        console.error("Post Job Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ----------------- GET ALL JOBS (FOR STUDENTS) -----------------
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        const jobs = await Job.find(query)
            .populate("company")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Get All Jobs Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ----------------- GET JOB BY ID -----------------
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId)
            .populate("company")
            .populate("applications"); // populate applications if needed

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        return res.status(200).json({ job, success: true });

    } catch (error) {
        console.error("Get Job By ID Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ----------------- GET ADMIN JOBS -----------------
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({ created_by: adminId })
            .populate("company")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs,
            success: true
        });

    } catch (error) {
        console.error("Get Admin Jobs Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
