import { Box, Flex, Text } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
    return (
        <Flex bg="#FFFFFF" color="#333333">
            {/* Sidebar */}
            <Sidebar bg="#F4F4F4" />

            {/* Main Content */}
            <Box flex="1" ml="250px" pt="60px" p="4">
                {/* Profile Icon */}
                <Box
                    position="absolute"
                    top="10px"
                    right="20px"
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
                    _hover={{ bg: "#0056B3" }}
                >
                    <Text>A</Text>
                </Box>

                <Navbar />
                <Outlet />
            </Box>
        </Flex>
    );
};

export default Layout;
