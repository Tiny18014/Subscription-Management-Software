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

    const navigate = useNavigate();
    const location = useLocation();
    const newInvoice = location.state?.newInvoice;
    const debouncedSearch = useDebounce(searchQuery, 500);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    console.log("Backend URL:", API_URL); // Debugging
    const fetchInvoices = async () => {
        try {
            let url = `${API_URL}/api/invoices`;
            console.log("Fetching from:", url);

            const response = await fetch(url, { method: "GET" });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch invoices");
            }

            const data = await response.json();
            console.log("✅ Invoices Fetched:", data); // Debugging

            setInvoices(data.invoices || []);
            console.log("Updated Invoices State:", invoices); // Check if state is updated
        } catch (err) {
            console.error("❌ Fetch Error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchInvoices();
    }, [debouncedSearch]);
    useEffect(() => {
        console.log("Rendering Table with Invoices:", invoices);
    }, [invoices]);

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

            {!loading && !error && invoices.length > 0 ? (
                <Box p={3} borderRadius="md">
                    <InvoicesTableEmployee invoices={invoices} />
                </Box>
            ) : (
                !loading && <Text>No invoices found</Text>
            )}

        </Box>
    );
};

export default InvoicesEmployee;
