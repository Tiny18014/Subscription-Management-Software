import { Box, Heading, Input, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MassageTable from "@/components/MassageTable";
import { useDebounce } from "@/hooks/useDebounce";

const Massages = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [massages, setMassages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const newMassage = location.state?.newMassage;
    const debouncedSearch = useDebounce(searchQuery, 500);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // Function to fetch massages
    const fetchMassages = async () => {

        try {
            setLoading(true);
            let url = `${API_URL}/api/massages`;


            if (debouncedSearch.trim()) {
                url = `${API_URL}/api/massages/search?query=${encodeURIComponent(debouncedSearch)}`;

            }


            const response = await fetch(url);
            const data = await response.json();


            if (response.ok) {
                // Check data structure and handle both formats
                const massageArray = Array.isArray(data) ? data : (data.massages || []);
                setMassages(massageArray);

            } else {
                throw new Error(data.message || "Failed to fetch massages");
            }
        } catch (err) {
            console.error("Error fetching massages:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchMassages();
    }, [debouncedSearch]);

    useEffect(() => {

        if (newMassage) {
            setMassages((prev) => {

                return [...prev, newMassage];
            });
        }
    }, [newMassage]);

    useEffect(() => {

    }, [massages]);


    return (
        <Box p={5} w="full" pt="60px">
            <Heading size="lg" mb={4}>Massages</Heading>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Flex gap={3}>
                    <Input
                        placeholder="Search Massages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="white"
                        color="black"
                    />
                    <Button
                        type="submit"

                        bg="#007BFF" /* Accent Color */
                        color="#FFFFFF" /* Button Text */
                        _hover={{ bg: "#0056B3" }} /* Hover Color */
                        onClick={() => navigate("/add-massages")}>
                        Add Massage
                    </Button>
                </Flex>
            </Box>

            {/* Loading and Error States */}
            {loading ? <Spinner size="xl" mt={5} /> : null}
            {error ? <Text color="red.500">{error}</Text> : null}



            {!loading && !error && (
                <Box p={3} borderRadius="md" bg="white" shadow="sm">
                    {massages.length > 0 ? (
                        <>

                            <MassageTable massages={massages} setMassages={setMassages} />
                        </>
                    ) : (
                        <Text>No massages found</Text>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Massages;