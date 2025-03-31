import { useState } from "react";
import { Table, Button, Box, Input, Text } from "@chakra-ui/react";
import axios from "axios";

const SubscriptionTable = ({ subscriptions, setSubscriptions }) => {
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const deleteSubscription = async (id) => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token

            if (!token) {
                console.error("No token found, user is not authenticated.");
                return;
            }

            await axios.delete(`${API_URL}/api/subscriptions/delete/${id}`, {

                headers: {
                    Authorization: `Bearer ${token}`, // Add token to request
                },
            });

            setSubscriptions((prev) => prev.filter((sub) => sub._id !== id));
        } catch (error) {
            console.error("Error deleting subscription:", error);
        }
    };



    const openEditModal = (subscription) => {
        setSelectedSubscription(subscription);
        setIsOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedSubscription((prev) => ({ ...prev, [name]: value }));
    };

    const saveChanges = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token from storage
            if (!token) {
                console.error("No auth token found.");
                return;
            }

            await axios.put(
                `${API_URL}/api/subscriptions/update/${selectedSubscription._id}`,

                selectedSubscription,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token in headers
                    },
                }
            );

            setSubscriptions((prev) =>
                prev.map((s) => (s._id === selectedSubscription._id ? selectedSubscription : s))
            );
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating subscription:", error);
        }
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <Box>
            <Table.Root size="sm" striped>
                <Table.Header>
                    <Table.Row>

                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Subscription Validity</Table.ColumnHeader>
                        <Table.ColumnHeader>Net Payment</Table.ColumnHeader>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>

                    {subscriptions.map((sub) => (
                        <Table.Row key={sub._id}>

                            <Table.Cell>{sub.name}</Table.Cell>
                            <Table.Cell>{sub.validityHours} Hours</Table.Cell>
                            <Table.Cell>
                                <Text fontWeight="bold">{formatCurrency(sub.price)}</Text>

                            </Table.Cell>
                            <Table.Cell>{new Date(sub.startDate).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>
                                <Box
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    bg={getStatusColor(sub.status)}
                                    color="white"
                                    display="inline-block"
                                >
                                    {sub.status}
                                </Box>
                            </Table.Cell>
                            <Table.Cell>
                                <button onClick={() => openEditModal(sub)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" fill="currentColor" />
                                        <path d="M20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="currentColor" />
                                    </svg>
                                </button>

                                <button onClick={() => deleteSubscription(sub._id)} style={{ color: "red" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5V6H19V4Z" fill="currentColor" />
                                    </svg>
                                </button>

                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {isOpen && selectedSubscription && (
                <div className="modal" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000 }}>
                    <div className="modal-content" style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <h2 style={{ color: "#333333" }}>Edit Subscription</h2>
                        <Input name="name" value={selectedSubscription.name} onChange={handleEditChange} placeholder="Name" mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }} />

                        <Input name="price" value={selectedSubscription.price} onChange={handleEditChange} placeholder="Net Payment" mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }} />
                        <Input name="startDate" value={selectedSubscription.startDate} onChange={handleEditChange} placeholder="Created At" mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }} />
                        <select name="status" value={selectedSubscription.status} onChange={handleEditChange} mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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

export default SubscriptionTable;
