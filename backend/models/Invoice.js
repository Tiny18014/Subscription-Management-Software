import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },

    // Store basic customer details instead of a reference
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true }, // Store the name separately

    // Store service details instead of referencing a massage service
    serviceType: { type: String, required: true },
    servicePrice: { type: Number, default: 0 }, // Store service price

    hoursUsed: { type: Number, required: true },
    serviceDate: { type: Date, default: Date.now },

    // Store subscription details separately
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    subscriptionName: { type: String }, // Keep subscription name
    subscriptionPrice: { type: Number }, // Keep subscription price

    // Payment details
    paidAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    modeOfPayment: { type: String, required: true, enum: ["Cash", "Card", "UPI", "Subscription", "Bank Transfer", "Cheque"] },
    status: { type: String, enum: ['paid', 'pending', 'partially_paid', 'cancelled', 'refunded'], required: true, default: 'pending' },

    createdBy: { type: String },
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