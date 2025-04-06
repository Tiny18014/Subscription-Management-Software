import { Box, VStack, Text, Icon, Image } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUsers, FaLayerGroup, FaFileInvoice, FaUser } from "react-icons/fa";
import { TbMassage } from "react-icons/tb";

const Sidebar = () => {
    // Get user role from localStorage
    const role = localStorage.getItem("role"); // "admin" or "employee"

    // Define sidebar items based on role
    const menuItems = [

        {
            name: "Dashboard",
            path: role === "admin" ? "/dashboard" : "/customerdashboard",
            icon: FaHome,
            roles: ["admin"]
        },

        {
            name: "Customers",
            path: role === "admin" ? "/customers" : "/customerdashboard",
            icon: FaUsers,
            roles: ["admin", "employee"]
        },

        {
            name: "Subscriptions",
            path: role === "admin" ? "/subscriptions" : "/subscriptionsemployee",
            icon: FaLayerGroup,
            roles: ["admin", "employee"]
        },
        {
            name: "Massages",
            path: role === "admin" ? "/massages" : "/massagesemployee",
            icon: TbMassage,
            roles: ["admin", "employee"]
        },
        {
            name: "Invoices",
            path: role === "admin" ? "/invoices" : "/invoicesemployee",
            icon: FaFileInvoice,
            roles: ["admin", "employee"]
        }
    ];

    return (
        <Box as="aside" w="250px" bg="#F4F4F4" color="#333333" height="100vh" position="fixed" p="4">
            <Box display="flex" alignItems="center" justifyContent="center" mb="6" p="4">
                <Image src="/Spa Logo.png" alt="Logo" boxSize="80px" />
            </Box>

            <VStack spacing="4" align="start">
                {menuItems
                    .filter((item) => item.roles.includes(role)) // Filter items based on role
                    .map((item) => (
                        <NavLink
                            to={item.path}
                            key={item.name}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                backgroundColor: isActive ? "#007BFF" : "transparent",
                                width: "100%",
                                textDecoration: "none",
                                color: isActive ? "#FFFFFF" : "#333333",
                                fontWeight: isActive ? "bold" : "normal",

                            })}
                        >
                            <Icon as={item.icon} boxSize={5} />
                            <Text>{item.name}</Text>
                        </NavLink>
                    ))}
            </VStack>
        </Box>
    );
};

export default Sidebar;
