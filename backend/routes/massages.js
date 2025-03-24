import express from "express";
import Massage from "../models/Massage.js";

const router = express.Router();

// Get all massages
router.get("/", async (req, res) => {
    try {
        const massages = await Massage.find();
        console.log("Fetched from DB:", massages);
        if (!massages || massages.length === 0) {
            return res.status(404).json({ message: "No massages found" });
        }
        res.status(200).json(massages);

    } catch (error) {
        res.status(500).json({ message: "Error fetching massages", error });
    }
});



// Add a new massage
router.post("/", async (req, res) => {
    try {
        const { massageName, description } = req.body; // Get data from request body

        if (!massageName || !description) {
            return res.status(400).json({ success: false, message: "Massage name and description are required" });
        }

        // Create a new Massage object
        const newMassage = new Massage({
            name: massageName,  // Make sure 'name' matches the schema
            description: description,
            status: "Active",  // Default status
        });

        await newMassage.save(); // Save to DB

        res.status(201).json({ success: true, massage: newMassage });
    } catch (error) {
        console.error("Error adding massage:", error);
        res.status(500).json({ success: false, message: "Error adding massage", error });
    }
});

// Update a massage
router.put("/update/:id", async (req, res) => {
    try {
        const updatedMassage = await Massage.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMassage) return res.status(404).json({ message: "Massage not found" });
        res.status(200).json(updatedMassage);
    } catch (error) {
        res.status(500).json({ message: "Error updating massage", error });
    }
});

// Delete a massage
router.delete("/:id", async (req, res) => {
    try {
        const deletedMassage = await Massage.findByIdAndDelete(req.params.id);
        if (!deletedMassage) return res.status(404).json({ message: "Massage not found" });
        res.status(200).json({ message: "Massage deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting massage", error });
    }
});




router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query.trim()) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        // Search by name or description
        const searchConditions = [
            { name: { $regex: query, $options: "i" } },

        ];

        // Find massages matching search
        const massages = await Massage.find({ $or: searchConditions });

        res.status(200).json({ success: true, massages });
    } catch (error) {
        console.error("Error searching massages:", error);
        res.status(500).json({ success: false, message: "Error searching massages" });
    }
});




export default router;
