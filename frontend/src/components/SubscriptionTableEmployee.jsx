
import { Table, Box, Text } from "@chakra-ui/react";


const SubscriptionTableEmployee = ({ subscriptions }) => {
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
                        <Table.ColumnHeader>Subscription Info</Table.ColumnHeader>
                        <Table.ColumnHeader>Net Payment</Table.ColumnHeader>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.ColumnHeader>Status</Table.ColumnHeader>

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

                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>


        </Box>
    );
};

export default SubscriptionTableEmployee;
