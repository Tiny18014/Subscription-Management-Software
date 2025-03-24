import { Box, Heading, Button, VStack, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();

    const handleEmployeeAccess = () => {
        localStorage.setItem("role", "employee");
        localStorage.setItem("token", "guest-token"); // Temporary token for employees
        navigate("/customerdashboard");
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

                <Heading size="lg" color="#333333">Welcome to Paradise Wellness Spa</Heading>

                {/* Admin login remains */}
                <Button bg="#007BFF" /* Accent Color */
                    color="#FFFFFF" /* Button Text */
                    _hover={{ bg: "#0056B3" }} size="lg" w="full" onClick={() => navigate("/admin-login")}>
                    Login as Admin
                </Button>

                {/* Employees can directly access their dashboard, role is set before navigating */}
                <Button bg="#007BFF" /* Accent Color */
                    color="#FFFFFF" /* Button Text */
                    _hover={{ bg: "#0056B3" }} size="lg" w="full" onClick={handleEmployeeAccess}>
                    Continue as Employee
                </Button>
            </VStack>
        </Box>
    );
};

export default Landing;
