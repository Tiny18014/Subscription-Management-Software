import { useState } from "react";
import { Table, Button, Box, Input } from "@chakra-ui/react";
import axios from "axios";

const MassageTable = ({ massages, setMassages }) => {
    const [selectedMassage, setSelectedMassage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const deleteMassage = async (id) => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token

            if (!token) {
                console.error("No token found, user is not authenticated.");
                return;
            }

            await axios.delete(`${API_URL}/api/massages/${id}`, { headers: { Authorization: `Bearer ${token}` } });


            setMassages((prev) => prev.filter((massage) => massage._id !== id));
        } catch (error) {
            console.error("Error deleting massage:", error);
        }
    };



    const openEditModal = (massage) => {
        setSelectedMassage(massage);
        setIsOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedMassage((prev) => ({ ...prev, [name]: value }));
    };

    const saveChanges = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token from storage
            if (!token) {
                console.error("No auth token found.");
                return;
            }

            await axios.put(
                `http://localhost:5000/api/massages/update/${selectedMassage._id}`,
                selectedMassage,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send tokens in headers
                    },

                }
            );

            setMassages((prev) =>
                prev.map((s) => (s._id === selectedMassage._id ? selectedMassage : s))
            );
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating massage:", error);
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
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {massages.map((massage) => (
                        <Table.Row key={massage._id}>
                            <Table.Cell>{massage.name}</Table.Cell>
                            <Table.Cell>{massage.description}</Table.Cell>

                            <Table.Cell>{new Date(massage.createdAt).toLocaleDateString()}</Table.Cell>

                            <Table.Cell>{massage.status}</Table.Cell>
                            <Table.Cell>
                                <button onClick={() => openEditModal(massage)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25Z" fill="currentColor" />
                                        <path d="M20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="currentColor" />
                                    </svg>
                                </button>

                                <button onClick={() => deleteMassage(massage._id)} style={{ color: "red" }}>

                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5V6H19V4Z" fill="currentColor" />
                                    </svg>
                                </button>

                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Edit Massage Modal */}
            {isOpen && selectedMassage && (
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
                    <h2>Edit Massage</h2>
                    <Input name="name" value={selectedMassage.name} onChange={handleEditChange} placeholder="Name" mb={2} />
                    <Input name="description" value={selectedMassage.description} onChange={handleEditChange} placeholder="Description" mb={2} />
                    <select name="status" value={selectedMassage.status} onChange={handleEditChange} mb={2}>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <Button onClick={saveChanges} colorScheme="blue" mr={2}>Save</Button>
                    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                </Box>
            )}
        </Box>
    );
};

export default MassageTable;
