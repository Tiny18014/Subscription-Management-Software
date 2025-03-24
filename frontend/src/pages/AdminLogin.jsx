import { useState } from "react";
import { Box, Heading, Input, Button, VStack, Text, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", response.data.role);

                if (response.data.role === "admin") {
                    navigate("/dashboard");
                } else if (response.data.role === "employee") {
                    navigate("/customerdashboard");
                }
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <Box
            height="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="grey"
            bgImage="url('/Spa BG.png')" // Update this path to your background image
            bgSize="cover" // Ensures the background image covers the entire area
            bgPosition="center" // Centers the background image
        >
            <VStack
                spacing={6}
                p={8}
                bgColor="rgba(255, 255, 255, 0.8)"
                boxShadow="lg"
                borderRadius="lg"
                textAlign="center"
            >

                <Heading size="lg">Admin Login</Heading>

                {error && <Text color="red.500">{error}</Text>}

                <Input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.200"
                    color="black"
                />

                <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.200"
                    color="black"
                />

                <Button bg="#007BFF" /* Accent Color */
                    color="#FFFFFF" /* Button Text */
                    _hover={{ bg: "#0056B3" }} size="lg" w="full" onClick={handleLogin}>
                    Login
                </Button>
            </VStack>
        </Box>
    );
};

export default AdminLogin;
