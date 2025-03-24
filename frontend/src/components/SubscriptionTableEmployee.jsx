
import { Table, Box, } from "@chakra-ui/react";


const SubscriptionTableEmployee = ({ subscriptions }) => {

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
                            <Table.Cell>{sub.price}</Table.Cell>
                            <Table.Cell>{new Date(sub.startDate).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{sub.status}</Table.Cell>

                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>


        </Box>
    );
};

export default SubscriptionTableEmployee;
