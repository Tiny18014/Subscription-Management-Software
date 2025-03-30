import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    // Basic invoice information
    invoiceNumber: { type: String, unique: true }, // Consider auto-generating this
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },

    // Service details
    serviceType: { type: String, required: true },
    hoursUsed: { type: Number, required: true },
    serviceDate: { type: Date, default: Date.now },

    // Financial information
    paidAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    cgst: { type: Number, default: function () { return this.paidAmount * 0.09; } },
    sgst: { type: Number, default: function () { return this.paidAmount * 0.09; } },
    netAmount: { type: Number, default: function () { return this.paidAmount - this.taxAmount; } },

    // Payment information
    modeOfPayment: {
        type: String,
        required: true,
        enum: ["Cash", "Card", "UPI", "Subscription", "Bank Transfer", "Cheque"]
    },
    status: {
        type: String,
        enum: ['paid', 'pending', 'partially_paid', 'cancelled', 'refunded'],
        required: true,
        default: 'pending'
    },

    // For subscription-related invoices
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },

    // Additional information
    notes: { type: String },
    createdBy: { type: String }, // Track which employee created the invoice
}, { timestamps: true });

// Auto-generate invoice number before saving
invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        // Get current date
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Count existing invoices this month
        const count = await mongoose.models.Invoice.countDocuments({
            createdAt: {
                $gte: new Date(`${year}-${month}-01`),
                $lt: new Date(`${year}-${parseInt(month) + 1}-01`)
            }
        });

        // Create invoice number in format: INV-YYYYMM-XXXX
        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;