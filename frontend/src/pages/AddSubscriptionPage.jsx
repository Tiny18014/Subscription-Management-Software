import React, { useState } from "react";
import { Button, Box, Input, Container, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
const AddSubscriptionPage = () => {
    const [subscription, setSubscription] = useState({
        subscriptionName: "",
        validityHours: "",
        price: "",
    });

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const handleChange = (e) => {
        setSubscription({ ...subscription, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${API_URL}/api/subscriptions/add`, subscription, {

                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("Subscription Added:", res.data);
            navigate("/subscriptions");
        } catch (error) {
            console.error("Error adding subscription", error);
        }
    };


    return (
        <Box p={5} w="full" pt="60px">
            <Container maxW="md" mt={10} p={6} boxShadow="lg" borderRadius="lg" pt="60px">
                <Heading size="lg" mb={4}>Add Subscription</Heading>
                <form onSubmit={handleSubmit}>


                    <Box mb={4}>
                        <Input type="text" name="subscriptionName" value={subscription.subscriptionName} onChange={handleChange} placeholder="Enter Name" required />
                    </Box>
                    <Box mb={4}>
                        <Input type="number" name="validityHours" value={subscription.validityHours} onChange={handleChange} placeholder="Enter validity (in hours or days)" required />
                    </Box>
                    <Box mb={4}>
                        <Input type="number" name="price" value={subscription.price} onChange={handleChange} placeholder="Net Payment Amount (₹)" required />
                    </Box>

                    <Button
                        type="submit"
                        width="full"
                        bg="#007BFF" /* Accent Color */
                        color="#FFFFFF" /* Button Text */
                        _hover={{ bg: "#0056B3" }} /* Hover Color */
                    >Add Subscription</Button>
                </form>
            </Container>
        </Box>
    );
};

export default AddSubscriptionPage;
