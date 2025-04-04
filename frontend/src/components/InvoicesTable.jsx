import { useState } from "react";
import { Table, Button, Box, Input, Text } from "@chakra-ui/react";
import axios from "axios";

const InvoicesTable = ({ invoices, setInvoices }) => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // Modified deleteInvoice function with additional logging
    // Modified deleteInvoice function with token verification
    const deleteInvoice = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found, user is not authenticated.");
                return;
            }

            console.log(`Deleting invoice with ID: ${id}`);

            await axios.delete(`${API_URL}/api/invoices/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Invoice deleted successfully.");
            setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
        } catch (error) {
            console.error("Error deleting invoice:", error);
            if (error.response) {
                console.error("Status code:", error.response.status);
                console.error("Response data:", error.response.data);
            }
        }
    };

    // Open edit modal
    const openEditModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsOpen(true);
    };

    // Handle input change in modal
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedInvoice((prev) => ({ ...prev, [name]: value }));
    };

    // Save changes function
    const saveChanges = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No auth token found.");
                return;
            }

            await axios.put(`${API_URL}/api/invoices/update/${selectedInvoice._id}`, selectedInvoice, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setInvoices((prev) =>
                prev.map((inv) => (inv._id === selectedInvoice._id ? selectedInvoice : inv))
            );

            setIsOpen(false);
        } catch (error) {
            console.error("Error updating Invoice:", error);
        }
    };
    // Function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
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
            case 'paid':
                return "green.500";
            case 'pending':
                return "yellow.500";
            default:
                return "gray.500";
        }
    };

    // Function to get payment icon based on mode
    const getPaymentIcon = (mode) => {
        switch (mode) {
            case 'Cash':
                return '💵';
            case 'Card':
                return '💳';
            case 'UPI':
                return '📱';
            case 'Subscription':
                return '🔄';
            default:
                return '💰';
        }
    };

    return (
        <Box>
            <Table.Root size="sm" striped>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Invoice #</Table.ColumnHeader>
                        <Table.ColumnHeader>Customer</Table.ColumnHeader>
                        <Table.ColumnHeader>Service</Table.ColumnHeader>
                        <Table.ColumnHeader>Date Issued</Table.ColumnHeader>
                        <Table.ColumnHeader>Hours</Table.ColumnHeader>
                        <Table.ColumnHeader>Amount</Table.ColumnHeader>
                        <Table.ColumnHeader>Payment</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {invoices.map((inv) => (
                        <Table.Row key={inv._id}>
                            <Table.Cell>
                                <Text title={`Invoice ID: ${inv._id}`}>
                                    INV-{inv._id.substring(inv._id.length - 6).toUpperCase()}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>
                                <Text fontWeight="medium" title={inv.customer?._id || "Customer ID unavailable"}>
                                    {inv.customerName || "Unknown Customer"}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>{inv.serviceType}</Table.Cell>
                            <Table.Cell>
                                <Text title={formatDateTime(inv.serviceDate)}>
                                    {new Date(inv.serviceDate).toLocaleDateString()}
                                </Text>
                            </Table.Cell>
                            <Table.Cell>{inv.hoursUsed} hrs</Table.Cell>
                            <Table.Cell>
                                <Text fontWeight="bold">{formatCurrency(inv.paidAmount)}</Text>

                            </Table.Cell>
                            <Table.Cell>
                                <Box display="flex" alignItems="center">
                                    <Text mr={1}>{getPaymentIcon(inv.modeOfPayment)}</Text>
                                    <Text>{inv.modeOfPayment}</Text>
                                </Box>
                            </Table.Cell>
                            <Table.Cell>
                                <Box
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    bg={getStatusColor(inv.status)}
                                    color="white"
                                    display="inline-block"
                                >
                                    {inv.status}
                                </Box>
                            </Table.Cell>
                            <Table.Cell>
                                <button onClick={() => openEditModal(inv)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" fill="currentColor" />
                                        <path d="M20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="currentColor" />
                                    </svg>
                                </button>

                                <button onClick={() => deleteInvoice(inv._id)} style={{ color: "red" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5V6H19V4Z" fill="currentColor" />
                                    </svg>
                                </button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Edit Invoice Modal */}
            {isOpen && selectedInvoice && (
                <div className="modal" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000 }}>
                    <div className="modal-content" style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
                        <h2 style={{ color: "#333333" }}>Edit Invoice</h2>

                        <Input
                            name="id"
                            value={selectedInvoice._id}
                            readOnly
                            mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        />

                        <Input
                            name="paidAmount"
                            value={selectedInvoice.paidAmount || ''}
                            onChange={handleEditChange}
                            placeholder="Paid Amount"
                            mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        />

                        <select name="modeOfPayment" value={selectedInvoice.modeOfPayment} onChange={handleEditChange}>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Subscription">Subscription</option>
                        </select>


                        <select
                            name="status"
                            value={selectedInvoice.status}
                            onChange={handleEditChange}
                            mb={2}
                            style={{ width: "100%", padding: "8px", marginBottom: "10px", backgroundColor: "#E9ECEF", border: "1px solid #CED4DA", color: "#333333" }}
                        >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
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

export default InvoicesTable;