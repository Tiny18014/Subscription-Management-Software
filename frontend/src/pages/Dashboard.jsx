import React, { useEffect, useState } from "react";
import { Box, Grid, Heading, Text, Spinner, Center } from "@chakra-ui/react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart, Bar, CartesianGrid } from "recharts";


import axios from "axios";

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`https://subscription-management-software-1.onrender.com/api/dashboard`); // Adjust API route as needed
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!dashboardData) {
        return <p>No data available</p>;
    }


    return (
        <Box p={5}>
            <Heading mb={5}>Admin Dashboard</Heading>

            {/* Stats Cards */}
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <StatCard title="Total Customers" value={dashboardData.totalCustomers} />
                <StatCard title="Total Revenue" value={`₹${dashboardData.totalRevenue}`} />
                <StatCard title="Active Subscriptions" value={dashboardData.activeSubscriptions} />
                <StatCard title="Massages Booked" value={dashboardData.totalMassagesBooked} />
            </Grid>

            {/* Revenue Trend Chart */}
            <Box mt={8} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={3}>Revenue Trend</Heading>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.revenueTrend}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="totalRevenue" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </Box>

            <Box mt={8} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={3}>Monthly Revenue & Customer Growth</Heading>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickFormatter={(tick) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][tick - 1]}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalRevenue" fill="#4C51BF" name="Revenue (₹)" />
                        <Bar dataKey="customerCount" fill="#48BB78" name="New Customers" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>


            <Box mt={8} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={3}>Top Subscriptions</Heading>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                                <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>Subscription Name</th>
                                <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>Customers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.topSubscriptions.map((sub, index) => (
                                <tr key={sub._id || index} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "8px" }}>{sub.name}</td>
                                    <td style={{ padding: "8px" }}>{sub.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
            <Box mt={8} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={3}>Customer Subscription Distribution</Heading>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={dashboardData.subscriptionDistribution}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {dashboardData.subscriptionDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFC"][index % 5]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            {/* Most Popular Massages Table */}
            <Box mt={8} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={3}>Most Popular Massages</Heading>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                                <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>Massage Type</th>
                                <th style={{ padding: "8px", borderBottom: "2px solid #ddd" }}>Times Booked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.popularMassages.map((massage, index) => (
                                <tr key={massage._id || index} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "8px" }}>{massage.name}</td>
                                    <td style={{ padding: "8px" }}>{massage.bookings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>

        </Box>
    );
};

const StatCard = ({ title, value }) => (
    <Box p={4} shadow="md" borderWidth="1px" borderRadius="md">
        <Heading size="sm">{title}</Heading>
        <Text fontSize="2xl" fontWeight="bold">{value}</Text>
    </Box>
);

export default AdminDashboard;