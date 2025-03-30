import {
    Box, Heading, Input, Flex, Spinner, Text,
    Select, HStack, Badge
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InvoicesTableEmployee from "@/components/InvoicesTableEmployee";
import { useDebounce } from "@/hooks/useDebounce";
import { FiRefreshCw, FiFilter, FiDownload, FiCalendar } from "react-icons/fi";
import axios from "axios";

const InvoicesEmployee = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPaymentMode, setFilterPaymentMode] = useState("all");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [stats, setStats] = useState({
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        totalAmount: 0,
        paidAmount: 0
    });

    const navigate = useNavigate();
    const location = useLocation();
    const newInvoice = location.state?.newInvoice;
    const debouncedSearch = useDebounce(searchQuery, 500);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    console.log("Backend URL:", API_URL); // Debugging

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/invoices`;
            console.log("Fetching from:", url);


            if (debouncedSearch.trim()) {
                url = `${API_URL}/api/invoices/search?query=${encodeURIComponent(debouncedSearch)}`;
            }

            // Add filter parameters
            const params = new URLSearchParams();
            if (filterStatus !== "all") params.append("status", filterStatus);
            if (filterPaymentMode !== "all") params.append("paymentMode", filterPaymentMode);
            if (dateRange.from) params.append("dateFrom", dateRange.from);
            if (dateRange.to) params.append("dateTo", dateRange.to);

            if (params.toString()) {
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch invoices");
            }

            const data = await response.json();
            console.log("✅ Fetched Invoices:", data.invoices);

            setInvoices(data.invoices || []);

            // Calculate statistics
            const allInvoices = data.invoices || [];
            const paidInvs = allInvoices.filter(inv => inv.status.toLowerCase() === 'paid');
            const pendingInvs = allInvoices.filter(inv => inv.status.toLowerCase() === 'pending');

            setStats({
                totalInvoices: allInvoices.length,
                paidInvoices: paidInvs.length,
                pendingInvoices: pendingInvs.length,
                totalAmount: allInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
                paidAmount: paidInvs.reduce((sum, inv) => sum + inv.paidAmount, 0)
            });

        } catch (err) {
            console.error("❌ Error fetching invoices:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchInvoices();
    }, [debouncedSearch, filterStatus, filterPaymentMode, dateRange]);

    useEffect(() => {
        if (newInvoice) {
            console.log("🆕 New Invoice Added:", newInvoice);
            setInvoices((prev) => [...prev, newInvoice]);
        }
    }, [newInvoice]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <Box p={5} w="full" pt="60px">
            <Heading size="lg" mb={4}>Invoices</Heading>

            {/* Statistics Cards */}
            <Flex mb={5} gap={4} flexWrap="wrap">
                <Box bg="white" p={3} borderRadius="md" shadow="sm" minW="150px" flex="1">
                    <Text color="gray.500" fontSize="sm">Total Invoices</Text>
                    <Text fontSize="2xl" fontWeight="bold">{stats.totalInvoices}</Text>
                </Box>
                <Box bg="white" p={3} borderRadius="md" shadow="sm" minW="150px" flex="1">
                    <Text color="gray.500" fontSize="sm">Paid Invoices</Text>
                    <HStack>
                        <Text fontSize="2xl" fontWeight="bold">{stats.paidInvoices}</Text>
                        <Badge colorScheme="green">
                            {stats.totalInvoices ? Math.round(stats.paidInvoices / stats.totalInvoices * 100) : 0}%
                        </Badge>
                    </HStack>
                </Box>
                <Box bg="white" p={3} borderRadius="md" shadow="sm" minW="150px" flex="1">
                    <Text color="gray.500" fontSize="sm">Pending Invoices</Text>
                    <Text fontSize="2xl" fontWeight="bold">{stats.pendingInvoices}</Text>
                </Box>

            </Flex>

            {/* Search and Filter Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Flex gap={3} >
                    <Input
                        placeholder="Search by customer name, invoice ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        color="black"

                    />

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        bg="white"

                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={filterPaymentMode}
                        onChange={(e) => setFilterPaymentMode(e.target.value)}
                        bg="white"

                    >
                        <option value="all">All Payment</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Subscription">Subscription</option>
                    </select>


                </Flex>


            </Box>

            {/* Loading and Error States */}
            {loading && <Spinner size="xl" mt={5} />}
            {error && <Text color="red.500">{error}</Text>}

            {!loading && !error && (
                <Box p={3} borderRadius="md" bg="white" shadow="sm">
                    {invoices.length > 0 ? (
                        <InvoicesTableEmployee invoices={invoices} />
                    ) : (
                        <Text p={4} textAlign="center">No invoices found</Text>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default InvoicesEmployee;