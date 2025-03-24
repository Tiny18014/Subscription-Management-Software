import { useState } from "react";
import { Button, Box, Input } from "@chakra-ui/react";
import React from "react";


const AddCustomerModal = ({ isOpen, onClose, onAddCustomer }) => {
    const [customer, setCustomer] = useState({
        name: "",
        age: "",
        email: "",
        phoneNumber: "",
        subscriptionType: "",
    });

    const handleChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddCustomer(customer);
        setCustomer({ name: "", age: "", email: "", phoneNumber: "", subscriptionType: "" });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Add Customer</h2>
                <form onSubmit={handleSubmit}>
                    <Box mb={4}>
                        <label>Name:</label>
                        <Input type="text" name="name" value={customer.name} onChange={handleChange} required />
                    </Box>
                    <Box mb={4}>
                        <label>Age:</label>
                        <Input type="number" name="age" value={customer.age} onChange={handleChange} required />
                    </Box>
                    <Box mb={4}>
                        <label>Email:</label>
                        <Input type="email" name="email" value={customer.email} onChange={handleChange} required />
                    </Box>
                    <Box mb={4}>
                        <label>Phone Number:</label>
                        <Input type="tel" name="phoneNumber" value={customer.phoneNumber} onChange={handleChange} required />
                    </Box>
                    <Box mb={4}>
                        <label>Subscription Type:</label>
                        <select name="subscriptionType" value={customer.subscriptionType} onChange={handleChange} required>
                            <option value="">Select Subscription</option>
                            <option value="Basic">Basic</option>
                            <option value="Premium">Premium</option>
                            <option value="VIP">VIP</option>
                        </select>

                    </Box>
                    <Button type="submit" colorScheme="blue" mr={2}>Add</Button>
                    <Button onClick={onClose} colorScheme="gray">Cancel</Button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;
