import { useState } from "react";
import {
    Box,
    Heading,
    Input,
    Button,
    VStack,
    Text,
    Flex
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email and password are required!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            height="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.700"
            bgImage="url('/Spa BG.png')"
            bgSize="cover"
            bgPosition="center"
        >
            <VStack
                spacing={6}
                p={8}
                bgColor="rgba(255, 255, 255, 0.85)"
                boxShadow="lg"
                borderRadius="lg"
                textAlign="center"
                w="sm"
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
                    _focus={{ bg: "white" }}
                />

                <Box position="relative" width="100%">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="gray.200"
                        color="black"
                        _focus={{ bg: "white" }}
                        pr="2.5rem"
                    />
                    <Button
                        position="absolute"
                        right="8px"
                        top="50%"
                        transform="translateY(-50%)"
                        size="sm"
                        h="1.5rem"
                        minW="1.5rem"
                        p="0"
                        bg="transparent"
                        _hover={{ bg: "transparent" }}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </Button>
                </Box>

                <Button
                    bg="#007BFF"
                    color="#FFFFFF"
                    _hover={{ bg: "#0056B3" }}
                    size="lg"
                    w="full"
                    onClick={handleLogin}
                    isLoading={loading}
                    isDisabled={loading}
                >
                    Login
                </Button>
            </VStack>
        </Box>
    );
};

export default AdminLogin;