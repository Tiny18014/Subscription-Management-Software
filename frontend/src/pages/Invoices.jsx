import { Box, Heading, Input, Button, Flex, Spinner, Text } from "@chakra-ui/react";
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
    const navigate = useNavigate();
    const location = useLocation();
    const newInvoice = location.state?.newInvoice;
    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:5000/api/invoices`;

            if (debouncedSearch.trim()) {
                url = `http://localhost:5000/api/invoices/search?query=${encodeURIComponent(debouncedSearch)}`;
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
        } catch (err) {
            console.error("❌ Error fetching invoices:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [debouncedSearch]);

    useEffect(() => {
        if (newInvoice) {
            console.log("🆕 New Invoice Added:", newInvoice);
            setInvoices((prev) => [...prev, newInvoice]);
        }
    }, [newInvoice]);

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
                        const response = await axios.get(`http://localhost:5000/api/customers/${customerId}`);
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
            <Heading size="lg" mb={4}>
                Invoices
            </Heading>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="4">
                <Flex mb={4} gap={3}>
                    <Input
                        placeholder="Search Invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        color="black"
                    />
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
                <Box p={3} borderRadius="md">
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
