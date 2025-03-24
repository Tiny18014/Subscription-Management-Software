import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    validityHours: { type: Number, required: true }, // e.g., 10 hours, 20 hours
    price: { type: Number, required: true },
    status: { type: String, default: "active" },
    startDate: { type: Date, default: Date.now },
});

export default mongoose.model("Subscription", SubscriptionSchema);
