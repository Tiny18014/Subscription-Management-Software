import express from "express";
import Subscription from "../models/Subscription.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add Subscription (Admin Only)
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { subscriptionName, validityHours, price } = req.body;

        // Convert string values to numbers
        const newSubscription = new Subscription({
            name: subscriptionName,
            validityHours: Number(validityHours),
            price: Number(price),
            status: "active",
            startDate: new Date(),
        });

        await newSubscription.save();
        res.status(201).json({ success: true, subscription: newSubscription });
    } catch (error) {
        console.error("Error adding subscription:", error);
        res.status(500).json({ success: false, message: "Error adding subscription", error });
    }
});

// Get All Subscriptions (Open Access)
router.get("/", async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching subscriptions", error });
    }
});

// Update Subscription (Admin Only)
router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        const updatedSubscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, subscription: updatedSubscription });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating subscription", error });
    }
});

// Delete Subscription (Admin Only)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Received DELETE request for ID:", id); // Debugging log

        const deletedSubscription = await Subscription.findByIdAndDelete(id);

        if (!deletedSubscription) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }

        res.status(200).json({ success: true, message: "Subscription deleted successfully" });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query.trim()) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        // Search condition
        const searchConditions = [
            { name: { $regex: query, $options: "i" } } // Case-insensitive search for name
        ];

        // If query is a valid number, add price filter
        if (!isNaN(query)) {
            searchConditions.push({ price: Number(query) });
        }

        // Find subscription
        const subscriptions = await Subscription.find({ $or: searchConditions });

        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        console.error("Error searching subscriptions:", error); // Log actual error
        res.status(500).json({ success: false, message: "Error searching subscriptions" });
    }
});



export default router;
