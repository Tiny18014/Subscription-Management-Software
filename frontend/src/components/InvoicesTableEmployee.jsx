
import { Table, Button, Box, Text } from "@chakra-ui/react";

const InvoicesTableEmployee = ({ invoices }) => {
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
                                    {inv.customer?.name || "Unknown Customer"}
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

                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default InvoicesTableEmployee;