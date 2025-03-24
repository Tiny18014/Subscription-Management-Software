import { useState, useEffect } from "react";
import { Table, Button, Input, Box, Heading, Flex } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { toaster } from "@/components/ui/toaster"
import axios from "axios";
import { useDebounce } from "@/hooks/useDebounce";


export default function CustomerPanel() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [usedHours, setUsedHours] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [serviceType, setServiceType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [massages, setMassages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const debouncedSearch = useDebounce(searchQuery, 500);
    const navigate = useNavigate();
    const location = useLocation();
    const newCustomer = location.state?.newCustomer;

    useEffect(() => {
        fetchCustomers();
        fetchMassages();
    }, [debouncedSearch]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:5000/api/customers`;

            if (debouncedSearch.trim()) {
                url = `http://localhost:5000/api/customers/search?query=${encodeURIComponent(debouncedSearch)}`;
            }

            const response = await axios.get(url);
            setCustomers(response.data.customers || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMassages = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/massages");
            setMassages(response.data || []);
        } catch (error) {
            console.error("Error fetching massages:", error);
        }
    };

    useEffect(() => {
        if (newCustomer) {
            setCustomers((prev) => [...prev, newCustomer]);
        }
    }, [newCustomer]);

    const openModal = (customer) => {
        setSelectedCustomer(customer);
        setIsOpen(true);
    };

    const closeModal = () => {
        setSelectedCustomer(null);
        setUsedHours("");
        setIsOpen(false);
    };

    const handleUseSubscription = async () => {
        const hours = parseFloat(usedHours);

        if (!isNaN(hours) && hours > 0 && selectedCustomer && serviceType) {
            if (selectedCustomer.remainingHours <= 0) {
                toaster.create({
                    description: "Subscription has expired. Customer cannot use the service.",
                    type: "error",
                });
                return; // Stop execution if subscription has expired
            }

            try {
                await axios.put(`http://localhost:5000/api/customers/update/${selectedCustomer._id}`, {
                    remainingHours: Math.max(0, selectedCustomer.remainingHours - hours),
                });

                const serviceDate = new Date().toISOString();
                const selectedService = massages.find((m) => m._id === serviceType);
                const serviceName = selectedService ? selectedService.name : "Unknown Service";

                await axios.post("http://localhost:5000/api/invoices/add", {
                    customer: selectedCustomer._id,
                    serviceType: serviceName,
                    hoursUsed: hours,
                    serviceDate: serviceDate,
                    modeOfPayment: "Subscription",
                    status: "paid",
                    paidAmount: 0,
                });

                fetchCustomers();
                toaster.create({
                    description: "Subscription updated and invoice generated",
                    type: "success",
                });
            } catch (error) {
                console.error("Error updating subscription or generating invoice:", error);
            }
            closeModal();
        }
    };





    return (
        <Box p={5} w="full" pt="60px">
            <Heading size="lg" mb={4}>Customers</Heading>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="4">
                <Flex mb={4} gap={3}>
                    <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg="#E9ECEF"
                        border="1px solid #CED4DA"
                        color="#333333"
                        _placeholder={{ color: "#666666" }}
                        _focus={{ borderColor: "#007BFF", boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.25)" }}
                    />
                    <Button
                        type="submit"

                        bg="#007BFF" /* Accent Colo */
                        color="#FFFFFF" /* Button Text */
                        _hover={{ bg: "#0056B3" }} /* Hover Color */
                        onClick={() => navigate("/add-customer-1")}>
                        Add Customer
                    </Button>
                </Flex>
            </Box>
            <Table.Root size="sm" striped>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Name</Table.ColumnHeader>
                        <Table.ColumnHeader>Subscription</Table.ColumnHeader>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.ColumnHeader>Hours Remaining</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>

                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {customers.map((customer, index) => (
                        <Table.Row key={customer._id || `customer-${index}`}>
                            <Table.Cell>{customer._id}</Table.Cell>
                            <Table.Cell>{customer.name}</Table.Cell>
                            <Table.Cell>{customer.subscription?.name}</Table.Cell>
                            <Table.Cell>{customer.createdAt}</Table.Cell>
                            <Table.Cell>{customer.remainingHours}</Table.Cell>
                            <Table.Cell>

                                <Button
                                    bg={customer.remainingHours > 0 ? "#007BFF" : "#B0B0B0"} // Greyed out if remainingHours is 0
                                    color="#FFFFFF"
                                    _hover={customer.remainingHours > 0 ? { bg: "#0056B3" } : {}}
                                    paddingX="20px"
                                    fontWeight="bold"
                                    onClick={() => openModal(customer)}
                                    disabled={customer.remainingHours <= 0} // Correct condition
                                >
                                    Use
                                </Button>


                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {isOpen && (
                <>
                    {/* Overlay to darken backgroun */}
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            zIndex: 999,
                        }}
                        onClick={closeModal} // Close modal when clicking outside
                    />

                    {/* Modal container */}
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "#fff",
                            padding: "24px",
                            borderRadius: "12px",
                            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                            width: "90%",
                            maxWidth: "400px",
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <h2 style={{ marginBottom: "8px", textAlign: "center" }}>Use Massage</h2>

                        <p><strong>Customer:</strong> {selectedCustomer?.name}</p>
                        <p><strong>Subscription:</strong> {selectedCustomer?.subscription?.name}</p>

                        <select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            style={{
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                width: "100%",
                                fontSize: "16px",
                            }}
                        >
                            <option value="">Select Service</option>
                            {massages.length > 0 ? (
                                massages.map((sub, index) => (
                                    <option key={sub._id || `massage-${index}`} value={sub._id}>
                                        {sub.name}
                                    </option>
                                ))
                            ) : (
                                <option key="no-services" disabled>No services available</option>
                            )}
                        </select>




                        <input
                            type="number"
                            value={usedHours}
                            onChange={(e) => setUsedHours(e.target.value)}
                            placeholder="Hours Used"
                            min="1"
                            max={selectedCustomer?.hoursLeft}
                            style={{
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                width: "100%",
                                fontSize: "16px",
                            }}
                        />

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                            <button
                                onClick={handleUseSubscription}
                                style={{
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    flex: 1,
                                    marginRight: "8px",
                                    opacity: serviceType && usedHours > 0 && usedHours <= selectedCustomer?.hoursLeft ? 1 : 0.6,
                                }}
                                disabled={!serviceType || usedHours <= 0 || usedHours > selectedCustomer?.hoursLeft}
                            >
                                Confirm
                            </button>

                            <button
                                onClick={closeModal}
                                style={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    flex: 1,
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

        </Box>
    );
}
