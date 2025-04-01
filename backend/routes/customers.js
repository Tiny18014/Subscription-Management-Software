import express from "express";
import mongoose from "mongoose";  // ✅ Correct ES module import
import Customer from "../models/Customer.js";
import Subscription from "../models/Subscription.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Invoice from "../models/Invoice.js";

const router = express.Router();
// Get all customers with subscription detail
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find().populate("subscription").lean();

        // Append validityHours from Subscription model
        const customersWithHours = customers.map(customer => ({
            ...customer,
            validityHours: customer.subscription?.validityHours || 0
        }));

        res.status(200).json({ success: true, customers: customersWithHours });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching customers", error });
    }
});

// Search customers by name or phone
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query.trim()) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        const customers = await Customer.find({
            $or: [{ name: { $regex: query, $options: "i" } }, { phone: { $regex: query, $options: "i" } }],
        }).populate("subscription");

        res.status(200).json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error searching customers", error });
    }
});



// Add a new customer
router.post("/", async (req, res) => {

    try {
        const { name, age, email, phone, subscription } = req.body;

        // Get subscription details
        const selectedSub = await Subscription.findById(subscription);
        if (!selectedSub) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        // Create customer entry
        const newCustomer = new Customer({
            name,
            age,
            email,
            phone,
            subscription,
            remainingHours: selectedSub.validityHours,
        });

        await newCustomer.save();

        // Create invoice entry
        const newInvoice = new Invoice({
            customer: newCustomer._id,
            serviceType: selectedSub.name,  // Subscription plan name
            hoursUsed: selectedSub.validityHours,  // Total hours from subscription
            modeOfPayment: "Subscription",
            paidAmount: selectedSub.price, // Store the subscription price
            status: "paid",
        });

        await newInvoice.save();

        res.status(201).json({
            message: "Customer and invoice added successfully",
            customer: newCustomer,
            invoice: newInvoice
        });

    } catch (error) {
        console.error("Error adding customer and invoice:", error);
        res.status(500).json({ message: "Error processing request", error });
    }
});



// Update Customer Info (Admin Only)
router.put("/update/:id", async (req, res) => {
    try {
        const { subscription } = req.body;
        let updatedFields = req.body;

        if (subscription) {
            const subscriptionPlan = await Subscription.findById(subscription);
            if (!subscriptionPlan) return res.status(400).json({ success: false, message: "Invalid subscription plan" });
            updatedFields.remainingHours = subscriptionPlan.validityHours;
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
        res.status(200).json({ success: true, customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating customer", error });
    }
});

// Delete Customer (Admin Only)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting customer", error });
    }
});

// 📌 Get all invoices for a specific customer
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/renew/:customerId", async (req, res) => {
    try {
        const { customerId } = req.params; // Extract from URL
        const { subscriptionId } = req.body; // Extract from body

        console.log("Incoming Request:", { customerId, subscriptionId }); // Debugging

        // Validate inputs
        if (!customerId || !subscriptionId) {
            return res.status(400).json({
                success: false,
                message: "Customer ID and Subscription ID are required"
            });
        }

        const customer = await Customer.findById(customerId);
        const subscription = await Subscription.findById(subscriptionId);

        if (!customer) {
            console.log("Customer not found in DB"); // Debugging
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        if (!subscription) {
            console.log("Subscription not found in DB"); // Debugging
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }

        // Update customer's subscription and reset remaining hours
        customer.subscription = subscriptionId;
        customer.remainingHours += subscription.validityHours;
        customer.status = "Active";
        await customer.save();

        // Create a new invoice for the renewal with exact enum values
        const invoice = new Invoice({
            customer: customerId,
            serviceType: subscription.name || "Subscription Service",
            hoursUsed: subscription.validityHours || 0,
            modeOfPayment: "Subscription",
            paidAmount: subscription.price || 0,
            // Make sure this matches EXACTLY one of your enum values
            status: "paid", // Try lowercase if the enum includes 'paid' 
            serviceDate: new Date(),
            subscriptionId: subscriptionId
        });

        // Log the invoice before saving to debug
        console.log("Invoice to be created:", JSON.stringify(invoice, null, 2));

        try {
            await invoice.save();
        } catch (invoiceError) {
            console.error("Invoice creation error:", invoiceError);
            // Continue even if invoice creation fails
            // Revert customer changes if needed
            // customer.subscription = previousSubscription;
            // customer.remainingHours -= subscription.validityHours;
            // await customer.save();

            return res.status(500).json({
                success: false,
                message: "Error creating invoice",
                error: invoiceError.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Subscription renewed and invoice generated",
            customer: {
                id: customer._id,
                name: customer.name,
                remainingHours: customer.remainingHours,
                status: customer.status
            }
        });
    } catch (error) {
        console.error("Renewal error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});


export default router;
