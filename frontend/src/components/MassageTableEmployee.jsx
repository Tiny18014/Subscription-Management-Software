import { useState } from "react";
import { Table, Button, Box, Input } from "@chakra-ui/react";
import axios from "axios";

const MassagesTableEmployee = ({ massages }) => {
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
        <Box>
            <Table.Root size="sm" striped>
                <Table.Header>
                    <Table.Row>

                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Description</Table.ColumnHeader>

                        <Table.ColumnHeader>Created At</Table.ColumnHeader>

                        <Table.ColumnHeader>Status</Table.ColumnHeader>

                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {massages.map((massage) => (
                        <Table.Row key={massage._id}>
                            <Table.Cell>{massage.name}</Table.Cell>
                            <Table.Cell>{massage.description}</Table.Cell>

                            <Table.Cell>{new Date(massage.createdAt).toLocaleDateString()}</Table.Cell>

                            <Table.Cell>
                                <Box
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    bg={getStatusColor(massage.status)}
                                    color="white"
                                    display="inline-block"
                                >
                                    {massage.status}
                                </Box>
                            </Table.Cell>

                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>


        </Box>
    );
};

export default MassagesTableEmployee;
