import { Box, Heading, Input, Button, Flex, Spinner, Text, HStack, Badge } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InvoicesTable from "@/components/InvoicesTable";
import { useDebounce } from "@/hooks/useDebounce";
import * as XLSX from "xlsx";
import axios from "axios";

const Invoices = () => {
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

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/invoices`;


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

    const exportToExcel = async () => {
        try {
            setExporting(true);

            if (invoices.length > 0) {
                console.log("Sample invoice data:", JSON.stringify(invoices[0], null, 2));
            }

            // Fetch customer details for each invoice
            const enrichedInvoices = await Promise.all(
                invoices.map(async (invoice) => {
                    try {
                        // Ensure `customerId` is correctly extracted
                        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?._id;

                        if (!customerId) throw new Error("Invalid customer ID");

                        // Fetch customer details
                        const response = await axios.get(`${API_URL}/api/customers/${customerId}`);

                        const customerData = response.data; // Axios automatically parses JSON

                        return {
                            ID: invoice?._id || "N/A",
                            Name: customerData?.name || "Customer Not Found",
                            Age: customerData?.age || "N/A",
                            Phone: customerData?.phone || "N/A",
                            "Subscription ID": customerData?.subscription || "N/A",
                            Status: invoice?.status || "N/A",
                            "Service Type": invoice?.serviceType || "N/A",
                            "Hours Used": invoice?.hoursUsed || "N/A",
                            "Paid Amount": invoice?.paidAmount || "N/A",
                            "Mode of Payment": invoice?.modeOfPayment || "N/A",
                            "Service Date": invoice?.serviceDate
                                ? new Date(invoice.serviceDate).toLocaleString()
                                : "N/A",
                        };
                    } catch (error) {
                        console.error("❌ Error fetching customer details:", error);
                        return {
                            ID: invoice?._id || "N/A",
                            Name: "Customer Not Found",
                            Age: "N/A",
                            Phone: "N/A",
                            "Subscription ID": "N/A",
                            Status: invoice?.status || "N/A",
                            "Service Type": invoice?.serviceType || "N/A",
                            "Hours Used": invoice?.hoursUsed || "N/A",
                            "Paid Amount": invoice?.paidAmount || "N/A",
                            "Mode of Payment": invoice?.modeOfPayment || "N/A",
                            "Service Date": invoice?.serviceDate
                                ? new Date(invoice.serviceDate).toLocaleString()
                                : "N/A",
                        };
                    }
                })
            );

            // Create Excel sheet
            const ws = XLSX.utils.json_to_sheet(enrichedInvoices);

            // Set column widths for better readability
            ws["!cols"] = [
                { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 25 },
                { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
            ];

            // Create a new workbook and append the sheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Invoices");

            // Generate the file name dynamically
            const fileName = `Invoices_${new Date().toISOString().split("T")[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            console.log("✅ Exported invoices to Excel");
        } catch (err) {
            console.error("❌ Error exporting to Excel:", err);
            setError("Failed to export invoices to Excel");
        } finally {
            setExporting(false);
        }
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="4">
                <Flex mb={4} gap={3}>
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
                    <Button
                        bg="#007BFF" /* Accent Color */
                        color="#FFFFFF" /* Button Text */
                        _hover={{ bg: "#0056B3" }}

                        onClick={exportToExcel}
                        isLoading={exporting}
                        loadingText="Exporting..."
                        disabled={invoices.length === 0}
                    >
                        Export
                    </Button>
                </Flex>
            </Box>

            {/* Loading and Error States */}
            {loading && <Spinner size="xl" mt={5} />}
            {error && <Text color="red.500">{error}</Text>}

            {!loading && !error && (
                <Box p={3} borderRadius="md" bg="white" shadow="sm">
                    {invoices.length > 0 ? (
                        <InvoicesTable invoices={invoices} setInvoices={setInvoices} />
                    ) : (
                        <Text>No invoices found</Text>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Invoices;
