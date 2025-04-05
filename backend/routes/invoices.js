import express from "express";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Massage from "../models/Massage.js";
import authMiddleware from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { status, paymentMode, dateFrom, dateTo } = req.query;

        let query = {};

        // Filtering conditions
        if (status && status !== "all") query.status = status;
        if (paymentMode && paymentMode !== "all") query.modeOfPayment = paymentMode;
        if (dateFrom || dateTo) {
            query.serviceDate = {};
            if (dateFrom) query.serviceDate.$gte = new Date(dateFrom);
            if (dateTo) query.serviceDate.$lte = new Date(dateTo);
        }

        const invoices = await Invoice.find(query)
            .populate("customer", "name") // Fetch only customer name
            .exec();

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ success: false, message: "Error fetching invoices", error });
    }
});


router.post("/add", async (req, res) => {
    try {
        const { customer, serviceType, hoursUsed, serviceDate, modeOfPayment, status, paidAmount } = req.body;

        if (!customer || !serviceType || !hoursUsed || !serviceDate || !modeOfPayment || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Ensure customer ID is valid
        if (!mongoose.Types.ObjectId.isValid(customer)) {
            return res.status(400).json({ error: "Invalid customer ID" });
        }
        // Retrieve customer details if the customer exists
        let customerData = await Customer.findById(customer).select("name");

        // Ensure customerName is set, even if the customer is deleted
        const customerName = customerData ? customerData.name : req.body.customerName || "Deleted Customer";

        const newInvoice = new Invoice({
            customer: new mongoose.Types.ObjectId(customer),
            customerName,
            serviceType,
            hoursUsed,
            serviceDate: new Date(serviceDate),  // Ensure date is properly formatted
            modeOfPayment,
            status,
            paidAmount: paidAmount || 0,  // Default to 0 if not provided
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error("Invoice creation error:", error);
        res.status(400).json({ error: "Invalid request data" });
    }
});



// DELETE an invoice (Soft Delete)
router.delete("/:invoiceId", async (req, res) => {
    try {
        const { invoiceId } = req.params;
        console.log("Received DELETE request for invoice ID:", invoiceId);

        if (!invoiceId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("Invalid ObjectId format");
            return res.status(400).json({ success: false, message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            console.log("Invoice not found in database");
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        const customer = await Customer.findById(invoice.customer);
        if (customer) {
            customer.remainingHours += invoice.hoursUsed;
            await customer.save();
        }

        await Invoice.findByIdAndDelete(invoiceId);
        console.log("Invoice deleted successfully");

        res.status(200).json({ success: true, message: "Invoice deleted & hours restored" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ success: false, message: "Error deleting invoice", error });
    }
});

// UPDATE an invoice
router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }
        const customer = await Customer.findById(existingInvoice.customer);
        if (customer) {
            customer.remainingHours += existingInvoice.hoursUsed; // Restore old hours
            customer.remainingHours -= req.body.hoursUsed; // Deduct new hours
            await customer.save();
        }

        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInvoice) return res.status(404).json({ message: "Invoice not found" });

        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: "Error updating Invoice", error });
    }
});


const mongoose = require("mongoose");

router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || !query.trim()) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        const searchConditions = [];

        // 1. Search by paidAmount if query is numeric
        if (!isNaN(query)) {
            searchConditions.push({ paidAmount: Number(query) });
        }

        // 2. Search by populated customer name (via customer reference)
        const customerIds = await Customer.find({
            name: { $regex: query, $options: "i" }
        }).distinct("_id");

        if (customerIds.length > 0) {
            searchConditions.push({ customer: { $in: customerIds } });
        }

        // 3. Search by customerName stored directly on invoice (for deleted customers)
        searchConditions.push({
            customerName: { $regex: query, $options: "i" }
        });

        // 4. Search by invoice ID suffix (after "INV-")
        if (query.startsWith("INV-") && query.length > 4) {
            const suffix = query.slice(4).toLowerCase();

            // Use aggregation to match stringified ObjectId
            const matchingInvoices = await Invoice.aggregate([
                {
                    $addFields: {
                        stringId: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        stringId: { $regex: suffix + "$", $options: "i" }
                    }
                }
            ]);

            // Extract matched ObjectIds
            const matchedIds = matchingInvoices.map(inv => inv._id);
            if (matchedIds.length > 0) {
                searchConditions.push({ _id: { $in: matchedIds } });
            }
        }

        // Combine and search
        const invoices = await Invoice.find({ $or: searchConditions })
            .populate("customer", "name")
            .exec();

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        console.error("Error searching invoices:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



// Create invoice when a service is used
router.post("/invoices", async (req, res) => {
    try {
        const { customerId, serviceType, hoursUsed } = req.body;

        // Fetch service price
        const massage = await Massage.findById(serviceType);
        if (!massage) return res.status(404).json({ message: "Service not found" });

        const totalAmount = hoursUsed * massage.pricePerHour; // Example calculation

        const newInvoice = new Invoice({ customerId, serviceType, hoursUsed, totalAmount });
        await newInvoice.save();

        res.status(201).json({ message: "Invoice generated successfully", invoice: newInvoice });
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/invoice-schema-info", (req, res) => {
    const statusEnum = Invoice.schema.path('status').enumValues;
    res.json({ statusEnum });
});
export default router;
