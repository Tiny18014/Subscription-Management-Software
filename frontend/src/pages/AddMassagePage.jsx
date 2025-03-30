import React, { useState } from "react";
import { Button, Box, Input, Container, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
const AddMassagePage = () => {
    const [massage, setMassage] = useState({
        massageName: "",
        description: "",


    });

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const handleChange = (e) => {
        setMassage({ ...massage, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${API_URL}/api/massages`, massage, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("Massage Added:", res.data);
            navigate("/massages");
        } catch (error) {
            console.error("Error adding massage", error);
        }
    };

    return (
        <Box p={5} w="full" pt="60px">
            <Container maxW="md" mt={10} p={6} boxShadow="lg" borderRadius="lg" pt="60px" >
                <Heading size="lg" mb={4}>Add Massage</Heading>
                <form onSubmit={handleSubmit}>

                    <Box mb={4}>
                        <Input type="text" name="massageName" value={massage.massageName} onChange={handleChange} placeholder="Enter Massage Name" required />
                    </Box>
                    <Box mb={4}>
                        <Input type="text" name="description" value={massage.description} onChange={handleChange} placeholder="Enter description" required />
                    </Box>


                    <Button
                        type="submit"
                        width="full"
                        bg="#007BFF" /* Accent Color */
                        color="#FFFFFF" /* Button Text */
                        _hover={{ bg: "#0056B3" }} /* Hover Color */
                    >Add massage</Button>
                </form>
            </Container>
        </Box>
    );
};

export default AddMassagePage;
