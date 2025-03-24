import { Box, Button, Text } from "@chakra-ui/react";
import {
    MenuRoot,
    MenuTrigger,
    MenuContent,
    MenuItem,
} from "@/components/ui/menu";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    // Get role from localStorage
    const role = localStorage.getItem("role");

    // Determine avatar letter based on role
    const avatarLetter = role === "admin" ? "A" : "E";

    const handleSignOut = () => {
        localStorage.removeItem("role"); // Clear stored role
        navigate("/");
    };

    return (
        <Box
            as="nav"
            position="fixed"
            top="0"
            left="250px" // Adjust to match sidebar width
            right="0"
            height="60px"
            bg="#FFFFFF"
            color="#333333"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            paddingX="20px"
            boxShadow="md"
            zIndex="1000"
            borderBottom="1px solid #CED4DA" // Soft border for contrast
        >
            <Text fontSize="lg" fontWeight="bold" color="#333333">
                The Paradise Wellness Spa
            </Text>
            <MenuRoot>
                <MenuTrigger asChild>
                    <Box
                        width="40px"
                        height="40px"
                        borderRadius="full"
                        bg="#007BFF"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="#FFFFFF"
                        fontWeight="bold"
                        fontSize="lg"
                        cursor="pointer"
                        _hover={{ bg: "#0056B3" }} // Hover effect
                    >
                        <Text>{avatarLetter}</Text>
                    </Box>
                </MenuTrigger>
                <MenuContent>
                    <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </MenuContent>
            </MenuRoot>
        </Box>
    );
};

export default Navbar;
