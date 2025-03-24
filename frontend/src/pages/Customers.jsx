import { Box, Heading, Input, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerTable from "@/components/CustomerTable";
import { useDebounce } from "@/hooks/useDebounce";

const Customers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const newCustomer = location.state?.newCustomer; // Received new customer data

    const debouncedSearch = useDebounce(searchQuery, 500); // Debounce API calls

    // Function to fetch customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:5000/api/customers`;

            if (debouncedSearch.trim()) {
                url = `http://localhost:5000/api/customers/search?query=${encodeURIComponent(debouncedSearch)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setCustomers(data.customers || []);
            } else {
                throw new Error(data.message || "Failed to fetch customers");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [debouncedSearch]);

    useEffect(() => {
        if (newCustomer) {
            setCustomers((prev) => [...prev, newCustomer]);
        }
    }, [newCustomer]);

    return (
        <Box p={5} w="full" pt="60px" >
            <Heading size="lg" mb={4} color="#333333">Customers</Heading>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Flex gap={3}>
                    <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="#E9ECEF"
                        border="1px solid #CED4DA"
                        color="#333333"
                        _placeholder={{ color: "#666666" }}
                        _focus={{ borderColor: "#007BFF", boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.25)" }}
                    />
                    <Button
                        bg="#007BFF"
                        color="#FFFFFF"
                        _hover={{ bg: "#0056B3" }}
                        paddingX="20px"
                        fontWeight="bold"
                        onClick={() => navigate("/add-customer")}
                    >
                        Add Customer
                    </Button>
                </Flex>
            </Box>

            {/* Loading and Error States */}
            {loading ? <Spinner size="xl" mt={5} /> : null}
            {error ? <Text color="red.500">{error}</Text> : null}

            {/* Customer Table */}
            {!loading && !error && (
                <Box p={3} borderRadius="md" bg="white">
                    <CustomerTable customers={customers} setCustomers={setCustomers} />
                </Box>
            )}
        </Box>
    );
};

export default Customers;
