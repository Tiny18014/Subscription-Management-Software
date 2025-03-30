import { Box, Heading, Input, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SubscriptionTableEmployee from "@/components/SubscriptionTableEmployee";
import { useDebounce } from "@/hooks/useDebounce";

const SubscriptionsEmployee = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const newSubscription = location.state?.newSubscription; // Received new subscription data
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const debouncedSearch = useDebounce(searchQuery, 500); // Debounce API calls
    // Function to fetch subscriptions
    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/subscriptions`;


            if (debouncedSearch.trim()) {
                url = `${API_URL}/api/subscriptions/search?query=${encodeURIComponent(debouncedSearch)}`;

            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setSubscriptions(data.subscriptions || []);
            } else {
                throw new Error(data.message || "Failed to fetch subscriptions");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [debouncedSearch]);

    useEffect(() => {
        if (newSubscription) {
            setSubscriptions((prev) => [...prev, newSubscription]);
        }
    }, [newSubscription]);

    return (
        <Box p={5} w="full" pt="60px">
            <Heading size="lg" mb={4}>Subscriptions</Heading>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="4">
                <Flex mb={4} gap={3}>
                    <Input
                        placeholder="Search subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        color="black"
                    />

                </Flex>
            </Box>

            {/* Loading and Error States */}
            {loading ? <Spinner size="xl" mt={5} /> : null}
            {error ? <Text color="red.500">{error}</Text> : null}

            {/* Subscription Table */}
            {!loading && !error && (
                <Box p={3} borderRadius="md" bg="white" shadow="sm">
                    <SubscriptionTableEmployee subscriptions={subscriptions} />
                </Box>
            )}
        </Box>
    );
};

export default SubscriptionsEmployee;
