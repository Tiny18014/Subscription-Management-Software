import mongoose from "mongoose";

const MassageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true } // Add createdAt and updatedAt fields
);

const Massage = mongoose.model("Massage", MassageSchema);
export default Massage;
