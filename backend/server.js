import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import invoiceRoutes from "./routes/invoices.js";
import dashboardRoutes from "./routes/dashboard.js";
import massagesRoutes from "./routes/massages.js";

// ✅ Load environment variables
dotenv.config({ path: './.env' });

console.log("MONGO_URI from .env:", process.env.MONGO_URI || "NOT FOUND");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use((req, res, next) => {
    console.log("Incoming Request Body:", req.body);
    next();
});


// ✅ Connect to DB before starting the server
connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`🚀 Server started at http://localhost:${process.env.PORT || 5000}`);
    });
});

// ✅ Basic API check
app.get("/", (req, res) => {
    res.send("Server is ready123");
});

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/massages", massagesRoutes);
// ✅ Route to fetch collections
app.get("/customers", async (req, res) => {
    try {
        const db = mongoose.connection.db; // ✅ Get the database instance
        const collections = await db.listCollections().toArray(); // ✅ Fetch collections
        const collectionNames = collections.map((col) => col.name); // ✅ Extract collection names

        console.log("Collections in the database:", collectionNames);
        res.json({ collections: collectionNames });
    } catch (error) {
        console.error("❌ Error fetching collections:", error);
        res.status(500).json({ message: "Error fetching collections" });
    }
});

