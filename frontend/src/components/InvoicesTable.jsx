import { useState } from "react";
import { Table, Button, Box, Input } from "@chakra-ui/react";
import axios from "axios";

const InvoicesTable = ({ invoices, setInvoices }) => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    // Delete invoice
    const deleteInvoice = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found, user is not authenticated.");
                return;
            }

            await axios.delete(`${API_URL}/api/invoices/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
        } catch (error) {
            console.error("Error deleting invoice:", error);
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

    // Save changes
    const saveChanges = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No auth token found.");
                return;
            }

            await axios.put(
                `${API_URL}/api/invoices/update/${selectedInvoice._id}`,
                selectedInvoice,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setInvoices((prev) =>
                prev.map((inv) => (inv._id === selectedInvoice._id ? selectedInvoice : inv))
            );

            setIsOpen(false);
        } catch (error) {
            console.error("Error updating Invoice:", error);
        }
    };

    return (
        <Box>
            <Table.Root size="sm" striped>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Invoice ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Customer Info</Table.ColumnHeader>
                        <Table.ColumnHeader>Net Payment</Table.ColumnHeader>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.ColumnHeader>Mode of Payment</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {invoices.map((inv) => (
                        <Table.Row key={inv._id}>
                            <Table.Cell>{inv._id}</Table.Cell>
                            <Table.Cell>{inv.customer?.name} </Table.Cell>
                            <Table.Cell>{inv.paidAmount}</Table.Cell>
                            <Table.Cell>{new Date(inv.serviceDate).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{inv.modeOfPayment}</Table.Cell>
                            <Table.Cell>{inv.status}</Table.Cell>
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

            {isOpen && selectedInvoice && (
                <Box
                    position="fixed"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    bg="grey"
                    p={6}
                    boxShadow="lg"
                    borderRadius="md"
                    width="300px"
                >
                    <h2>Edit Invoice</h2>
                    <Input name="id" value={selectedInvoice._id} readOnly mb={2} />
                    <Input name="paidAmount" value={selectedInvoice.paidAmount || ''} onChange={handleEditChange} placeholder="Paid Amount" mb={2} />

                    <select name="modeOfPayment" value={selectedInvoice.modeOfPayment} onChange={handleEditChange} mb={2}>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                    </select>
                    <select name="status" value={selectedInvoice.status} onChange={handleEditChange} mb={2}>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <Button onClick={saveChanges} colorScheme="blue" mr={2}>Save</Button>
                    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                </Box>
            )}
        </Box>
    );
};

export default InvoicesTable;