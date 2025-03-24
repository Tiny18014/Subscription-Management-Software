import { Box, Heading, Input, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InvoicesTableEmployee from "@/components/InvoicesTableEmployee";
import { useDebounce } from "@/hooks/useDebounce";

import axios from "axios";

const InvoicesEmployee = () => {
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

    return (
        <Box p={5} w="full" pt="60px">
            <Heading size="lg" mb={4}>Invoices</Heading>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="4">
                <Flex mb={4} gap={3}>
                    <Input
                        placeholder="Search Invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        color="black"
                    />

                </Flex>
            </Box>

            {/* Loading and Error States */}
            {loading && <Spinner size="xl" mt={5} />}
            {error && <Text color="red.500">{error}</Text>}

            {!loading && !error && (
                <Box p={3} borderRadius="md">
                    {invoices.length > 0 ? (
                        <InvoicesTableEmployee invoices={invoices} />
                    ) : (
                        <Text>No invoices found</Text>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default InvoicesEmployee;
