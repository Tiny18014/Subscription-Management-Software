import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    serviceType: { type: String, required: true },
    hoursUsed: { type: Number, required: true },
    serviceDate: { type: Date, default: Date.now },
    modeOfPayment: { type: String, required: false, enum: ["Cash", "Card", "UPI", "Subscription"] },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['paid', 'pending'], required: true },
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
