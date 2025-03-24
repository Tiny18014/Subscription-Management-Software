import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true, unique: true },

    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    remainingHours: { type: Number, required: true, default: 0 }, // ✅ Add this field
    status: { type: String, enum: ["Active", "Expired"], default: "Active" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", CustomerSchema);
