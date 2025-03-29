
import React, { useState, useEffect } from "react";
import { Button, Box, Input, Container, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddCustomerPageEmployee = () => {
    const [customer, setCustomer] = useState({
        name: "",
        age: "",
        email: "",
        phone: "",
        subscription: "",
        remainingHours: 0, // Added remainingHours field
    });
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState([]); // Store fetched subscriptions

    useEffect(() => {
        axios.get(`${API_URL}/api/subscriptions`)
            .then((response) => {
                console.log("Fetched Subscriptions:", response.data.subscriptions); // Debugging
                setSubscriptions(response.data.subscriptions);
            })
            .catch((error) => console.error("Error fetching subscriptions:", error));
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "subscription") {
            const selectedSub = subscriptions.find(sub => sub._id === value);
            if (selectedSub) {
                console.log("Selected Subscription:", selectedSub); // Debugging
            }

            setCustomer(prevCustomer => ({
                ...prevCustomer,
                subscription: value,
                remainingHours: selectedSub ? selectedSub.validityHours : 0, // Correctly set remainingHours
            }));
        } else {
            setCustomer(prevCustomer => ({ ...prevCustomer, [name]: value }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Add customer
            const customerResponse = await axios.post(`${API_URL}/api/customers`, customer);
            const customerData = customerResponse.data.customer;

            // Navigate after successful customer creation
            navigate("/customerdashboard");

        } catch (error) {
            console.error("Error adding customer:", error);
        }
    };



    return (
        <Box p={5} w="full" pt="60px">
            <Container maxW="md" mt={10} p={6} boxShadow="lg" borderRadius="lg" >
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
                            {subscriptions.map(sub => (
                                <option key={sub._id} value={sub._id}>
                                    {sub.name} - {sub.validityHours} hours
                                </option>
                            ))}
                        </select>
                    </Box>
                    <Box mb={4}>
                        <Input type="number" name="remainingHours" value={customer.remainingHours} readOnly placeholder="Remaining Hours" />

                    </Box>
                    <Button
                        type="submit"
                        width="full"
                        bg="#007BFF" /* Accent Color */
                        color="#FFFFFF" /* Button Text */
                        _hover={{ bg: "#0056B3" }} /* Hover Color */
                    >Add</Button>
                </form>
            </Container>
        </Box>
    );
};

export default AddCustomerPageEmployee;
