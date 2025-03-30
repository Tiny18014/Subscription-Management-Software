import { useState, useEffect } from "react";
import { Table, Button, Box, IconButton, Text } from "@chakra-ui/react";

import axios from "axios";

const CustomerTable = ({ customers, setCustomers }) => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const API_URL = import.meta.env.VITE_BACKEND_URL;


    const deleteCustomer = async (id) => {
        try {
            const token = localStorage.getItem("token"); // Get the stored JWT token
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            await axios.delete(`${API_URL}/api/customers/delete/${id}`, {

                headers: {
                    Authorization: `Bearer ${token}`, // Send token in Authorization header
                },
            });

            setCustomers(customers.filter((c) => c._id !== id));
        } catch (error) {
            console.error("Error deleting customer:", error.response?.data || error);
        }
    };


    const openEditModal = (customer) => {
        setSelectedCustomer(customer);
        setIsOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedCustomer((prev) => ({ ...prev, [name]: value }));
    };

    const saveChanges = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token from storage
            if (!token) {
                console.error("No auth token found.");
                return;
            }

            await axios.put(
                `${API_URL}/api/customers/update/${selectedCustomer._id}`,

                selectedCustomer,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token in headers
                    },
                }
            );

            setCustomers((prev) =>
                prev.map((c) => (c._id === selectedCustomer._id ? selectedCustomer : c))
            );
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };

    // Format date with both date and time
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    // Function to determine status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'Active':
                return "green.500";
            case 'active':
                return "green.500";
            default:
                return "gray.500";
        }
    };
    return (
        <Box >
            <Table.Root size="sm" striped >
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Subscription</Table.ColumnHeader>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.ColumnHeader>Hours Remaining</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {customers.map((customer, index) => (
                        <Table.Row key={customer._id || `customer-${index}`}>

                            <Table.Cell>
                                <Text title={`Customer ID: ${customer._id}`}>
                                    CUS-{customer._id.substring(customer._id.length - 6).toUpperCase()}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>
                                <Text fontWeight="medium" title={customer.name}>
                                    {customer?.name || "Unknown Customer"}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>{customer.subscription?.name}</Table.Cell>
                            <Table.Cell>
                                <Text title={formatDateTime(customer.createdAt)}>
                                    {new Date(customer.createdAt).toLocaleDateString()}</Text>
                            </Table.Cell>
                            <Table.Cell>{customer.remainingHours}</Table.Cell>
                            <Table.Cell>
                                <Box
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    bg={getStatusColor(customer.status)}
                                    color="white"
                                    display="inline-block"
                                >
                                    {customer.status}
                                </Box>
                            </Table.Cell>
                            <Table.Cell>
                                <button onClick={() => openEditModal(customer)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" fill="currentColor" />
                                        <path d="M20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="currentColor" />
                                    </svg>
                                </button>
                                <button onClick={() => deleteCustomer(customer._id)} style={{ color: "red" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5V6H19V4Z" fill="currentColor" />
                                    </svg>
                                </button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>

            </Table.Root>

            {isOpen && (
                <div className="modal" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000 }}>
                    <div className="modal-content" style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <h2 style={{ color: "#333333" }}>Edit Customer</h2>
                        <input
                            name="name"
                            value={selectedCustomer.name}
                            onChange={handleEditChange}
                            placeholder="Name"
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        /><br />
                        <input
                            name="subscription"
                            value={selectedCustomer.subscription?.name}
                            onChange={handleEditChange}
                            placeholder="Subscription"
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        /><br />
                        <input
                            name="createdAt"
                            value={selectedCustomer.createdAt}
                            onChange={handleEditChange}
                            placeholder="Created At"
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        /><br />
                        <select
                            name="status"
                            value={selectedCustomer.status}
                            onChange={handleEditChange}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        >
                            <option>Active</option>
                            <option>Inactive</option>
                        </select><br />
                        <Button
                            onClick={saveChanges}
                            style={{ backgroundColor: "#007BFF", color: "#FFFFFF", marginRight: "10px", padding: "8px 16px", borderRadius: "4px" }}
                            _hover={{ backgroundColor: "#0056B3" }}
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => setIsOpen(false)}
                            style={{ backgroundColor: "#CED4DA", color: "#333333", padding: "8px 16px", borderRadius: "4px" }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </Box>
    );
};

export default CustomerTable;
