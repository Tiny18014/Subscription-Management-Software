import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Subscription from "../models/Subscription.js";
import Massage from "../models/Massage.js";

export const getAdminDashboard = async (req, res) => {
    try {
        // Total Customers
        const totalCustomers = await Customer.countDocuments();

        // Active Subscriptions (Fixed Case-Sensitivity)
        const activeSubscriptions = await Customer.countDocuments({ status: { $regex: /^active$/i } });

        // Total Massages Booked (Exclude Subscription Purchases)
        const totalMassagesBooked = await Invoice.countDocuments({ modeOfPayment: "Subscription" });

        // Total Revenue from Paid Invoices
        const totalRevenueResult = await Invoice.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, totalRevenue: { $sum: "$paidAmount" } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        // Monthly Revenue Trend
        const monthlyRevenue = await Invoice.aggregate([
            { $match: { status: "paid" } },
            {
                $group: {
                    _id: { $month: "$serviceDate" },
                    totalRevenue: { $sum: "$paidAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueTrend = monthlyRevenue.map(item => ({
            month: monthNames[item._id - 1],
            totalRevenue: item.totalRevenue
        }));

        // **Fixed: Top Subscriptions Based on Customers**
        const topSubscriptions = await Customer.aggregate([
            { $match: { subscription: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$subscription",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subscriptionDetails"
                }
            },
            { $unwind: "$subscriptionDetails" },
            {
                $project: {
                    name: "$subscriptionDetails.name",
                    count: 1
                }
            }
        ]);

        const popularMassages = await Invoice.aggregate([
            {
                $match: {
                    serviceType: { $not: /Plan/i } // Excludes any serviceType containing "Plan" (case-insensitive)
                }
            },
            {
                $group: {
                    _id: "$serviceType",
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { bookings: -1 } },
            { $limit: 5 }
        ]);

        const subscriptionDistribution = await Customer.aggregate([
            { $match: { subscription: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$subscription",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subscriptionDetails"
                }
            },
            { $unwind: "$subscriptionDetails" },
            {
                $project: {
                    name: "$subscriptionDetails.name",
                    count: 1
                }
            }
        ]);

        const monthlyStats = await Invoice.aggregate([
            {
                $match: { serviceDate: { $exists: true, $ne: null } } // Ensure serviceDate exists
            },
            {
                $group: {
                    _id: { $month: "$serviceDate" },
                    totalRevenue: { $sum: "$paidAmount" },
                    customers: { $addToSet: "$customer" }
                }
            },
            {
                $project: {
                    month: "$_id",
                    totalRevenue: 1,
                    customerCount: { $size: "$customers" }
                }
            },
            { $sort: { month: 1 } }
        ]);
        res.json({
            totalCustomers,
            activeSubscriptions,
            totalMassagesBooked,
            totalRevenue,
            revenueTrend,
            topSubscriptions,
            popularMassages: popularMassages.map(massage => ({ name: massage._id, bookings: massage.bookings })),
            subscriptionDistribution,
            monthlyStats
        });

    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({ success: false, message: "Error fetching dashboard data" });
    }
};
