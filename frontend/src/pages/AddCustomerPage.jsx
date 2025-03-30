import React, { useState, useEffect } from "react";
import { Button, Box, Input, Container, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddCustomerPage = () => {
    const [customer, setCustomer] = useState({
        name: "",
        age: "",
        email: "",
        phoneNumber: "",
        subscription: "", // Ensure this matches the backend field
    });
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/api/subscriptions`)

            .then((response) => {
                console.log("API Response:", response.data);
                if (response.data && Array.isArray(response.data)) {
                    setSubscriptions(response.data);
                } else if (response.data.subscriptions) {
                    setSubscriptions(response.data.subscriptions);
                } else {
                    console.error("Unexpected API response format:", response.data);
                }
            })
            .catch((error) => console.error("Error fetching subscriptions:", error));
    }, []);


    const handleChange = (e) => {
        console.log(`Field changed: ${e.target.name} -> ${e.target.value}`);
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...customer,
            age: Number(customer.age), // Ensure age is a number
        };
        console.log("Submitting payload:", payload);

        try {
            const response = await axios.post("http://localhost:5000/api/customers", payload);
            console.log("Customer added successfully:", response.data);
            navigate("/customers");
        } catch (error) {
            console.error("Error adding customer:", error.response?.data || error);
        }
    };


    return (
        <Box p={5} w="full" pt="60px">
            <Container maxW="md" mt={10} p={6} boxShadow="lg" borderRadius="lg">
                <Heading size="lg" mb={4}>Add Customer</Heading>
                <form onSubmit={handleSubmit}>
                    <Box mb={4}>
                        <Input type="text" name="name" value={customer.name} onChange={handleChange} placeholder="Name" required />
                    </Box>
                    <Box mb={4}>
                        <Input type="number" name="age" value={customer.age} onChange={handleChange} placeholder="Age" required />
                    </Box>
                    <Box mb={4}>
                        <Input type="email" name="email" value={customer.email} onChange={handleChange} placeholder="Email" required />
                    </Box>
                    <Box mb={4}>
                        <Input type="tel" name="phone" value={customer.phone} onChange={handleChange} placeholder="Phone Number" required />
                    </Box>
                    <Box mb={4}>
                        <select name="subscription" value={customer.subscription} onChange={handleChange} required>
                            <option value="">Select Subscription</option>
                            {subscriptions
                                .filter(sub => sub.status.toLowerCase() === "active") // Filter only active subscriptions
                                .map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))
                            }
                        </select>
                    </Box>

                    <Button
                        type="submit"
                        width="full"
                        bg="#007BFF"
                        color="#FFFFFF"
                        _hover={{ bg: "#0056B3" }}
                    >Add</Button>
                </form>
            </Container>
        </Box>
    );
};

export default AddCustomerPage;
