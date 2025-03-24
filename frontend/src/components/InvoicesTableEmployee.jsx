import { useState } from "react";
import { Table, Button, Box, Input } from "@chakra-ui/react";
import axios from "axios";

const InvoicesTableEmployee = ({ invoices }) => {



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

                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {invoices.map((inv) => (
                        <Table.Row key={inv._id}>
                            <Table.Cell>{inv._id}</Table.Cell>
                            <Table.Cell>{inv.customer?.name} ({inv.customer?.phone})</Table.Cell>
                            <Table.Cell>{inv.paidAmount}</Table.Cell>
                            <Table.Cell>{new Date(inv.serviceDate).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{inv.modeOfPayment}</Table.Cell>
                            <Table.Cell>{inv.status}</Table.Cell>


                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>


        </Box>
    );
};

export default InvoicesTableEmployee;