import { useState, useEffect } from "react";
import { Table, Button, Input, Box, Heading, Flex, Text } from "@chakra-ui/react";
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
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState("");
    const [subscriptions, setSubscriptions] = useState([]);
    const [renewCustomer, setRenewCustomer] = useState(null);
    const debouncedSearch = useDebounce(searchQuery, 500);
    const navigate = useNavigate();
    const location = useLocation();
    const newCustomer = location.state?.newCustomer;
    const API_URL = import.meta.env.VITE_BACKEND_URL;



    const fetchCustomers = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/api/customers`;


            if (debouncedSearch.trim()) {
                url = `${API_URL}/api/customers/search?query=${encodeURIComponent(debouncedSearch)}`;

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
            const response = await axios.get(`${API_URL}/api/massages`);
            console.log("Fetched Massages:", response.data); // Debugging line

            // Fix: Check if response.data is an array directly or has a massages property
            if (Array.isArray(response.data)) {
                setMassages(response.data);
            } else {
                setMassages(response.data.massages || []);
            }
        } catch (error) {
            console.error("Error fetching massages:", error);
            setMassages([]); // Ensure massages is at least an empty array on error
        }
    };



    const fetchSubscriptions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/subscriptions`);

            console.log("Fetched Subscriptions:", response.data); // Debugging line

            // Fix: Handle both array and object with subscriptions property
            if (Array.isArray(response.data)) {
                setSubscriptions(response.data);
            } else {
                setSubscriptions(response.data.subscriptions || []);
            }
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            setSubscriptions([]); // Ensure subscriptions is at least an empty array on error
        }
    };


    useEffect(() => {
        fetchCustomers();
        fetchMassages();
        fetchSubscriptions();
    }, [debouncedSearch]);

    useEffect(() => {
        if (newCustomer && !customers.some(c => c._id === newCustomer._id)) {
            setCustomers(prev => [...prev, newCustomer]);
        }
    }, [newCustomer, customers]);


    const openModal = async (customer) => {
        try {
            await fetchMassages(); // Fetch massages again before opening modal
            setSelectedCustomer(customer);
            setServiceType(""); // Reset service type when opening modal
            setUsedHours(""); // Reset used hours when opening modal
            setIsOpen(true);
        } catch (error) {
            console.error("Error opening modal:", error);
        }
    };



    const closeModal = () => {
        setSelectedCustomer(null);
        setUsedHours("");
        setServiceType("");
        setIsOpen(false);
    };

    const openRenewModal = (customer) => {
        setRenewCustomer(customer);
        setSelectedSubscription("");
        setIsRenewModalOpen(true);
    };

    const closeRenewModal = () => {
        setRenewCustomer(null);
        setSelectedSubscription("");
        setIsRenewModalOpen(false);
    };

    const handleUseSubscription = async () => {
        const hours = parseFloat(usedHours);

        if (!isNaN(hours) && hours > 0 && selectedCustomer && serviceType) {
            if (selectedCustomer.remainingHours <= 0 || hours > selectedCustomer.remainingHours) {
                toaster.create({
                    description: "Not enough hours remaining in the subscription.",
                    type: "error",
                });
                return;
            }


            try {
                const newRemainingHours = Math.max(0, selectedCustomer.remainingHours - hours);
                const newStatus = newRemainingHours === 0 ? "Inactive" : selectedCustomer.status;

                await axios.put(`${API_URL}/api/customers/update/${selectedCustomer._id}`, {

                    remainingHours: newRemainingHours,
                    status: newStatus, // Update status if hours reach 0
                });

                const serviceDate = new Date().toISOString();
                const selectedService = massages.find((m) => m._id === serviceType);
                const serviceName = selectedService ? selectedService.name : "Unknown Service";

                await axios.post(`${API_URL}/api/invoices/add`, {
                    customer: selectedCustomer._id,
                    customerName: selectedCustomer.name, // Store name
                    serviceType: selectedService ? selectedService.name : "Unknown Service",
                    servicePrice: selectedService ? selectedService.price : 0, // Store price
                    hoursUsed: hours,
                    serviceDate: new Date().toISOString(),
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

    const handleRenewSubscription = async () => {
        if (!selectedSubscription || !renewCustomer) {
            toaster.create({
                description: "Please select a subscription",
                type: "error",
            });
            return;
        }

        try {
            // Make API call to renew subscription
            const response = await axios.put(`${API_URL}/api/customers/renew/${renewCustomer._id}`, {
                subscriptionId: selectedSubscription // Send only subscriptionId in body
            });

            // Check if the API call was successful
            if (response.data.success) {
                fetchCustomers(); // Refresh the customer list after renewal
                toaster.create({
                    description: "Subscription renewed successfully",
                    type: "success",
                });
                closeRenewModal();
            } else {
                // Handle API success: false response
                toaster.create({
                    description: response.data.message || "Failed to renew subscription",
                    type: "error",
                });
            }
        } catch (error) {
            // Enhanced error logging
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });

            // Show error message to user
            toaster.create({
                description: error.response?.data?.message || "Error renewing subscription. Please try again.",
                type: "error",
            });
        }
    };

    // Format date with both date and time
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    // Function to determine status color
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
                return "green.500";
            default:
                return "gray.500";
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
            <Box p={3} borderRadius="md" bg="white" shadow="sm">
                <Table.Root size="sm" striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>ID</Table.ColumnHeader>
                            <Table.ColumnHeader>Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Subscription</Table.ColumnHeader>
                            <Table.ColumnHeader>Created At</Table.ColumnHeader>
                            <Table.ColumnHeader>Hours Remaining</Table.ColumnHeader>
                            <Table.ColumnHeader>Status</Table.ColumnHeader>
                            <Table.ColumnHeader>Actions</Table.ColumnHeader>

                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {customers.map((customer, index) => (
                            <Table.Row key={customer._id || `customer-${index}`}>

                                <Table.Cell>
                                    <Text title={`Customer ID: ${customer._id}`}>
                                        CUS-{customer._id.substring(customer._id.length - 6).toUpperCase()}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text fontWeight="medium" title={customer.name}>
                                        {customer?.name || "Unknown Customer"}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>{customer.subscription?.name}</Table.Cell>
                                <Table.Cell>
                                    <Text title={formatDateTime(customer.createdAt)}>
                                        {new Date(customer.createdAt).toLocaleDateString()}</Text>
                                </Table.Cell>
                                <Table.Cell>{customer.remainingHours}</Table.Cell>
                                <Table.Cell>
                                    <Box
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        bg={getStatusColor(customer.status)}
                                        color="white"
                                        display="inline-block"
                                    >
                                        {customer.status}
                                    </Box>
                                </Table.Cell>
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
                                    <Button
                                        bg="#28A745" // Green color for renew button
                                        color="#FFFFFF"
                                        _hover={{ bg: "#218838" }}
                                        marginLeft="10px"
                                        paddingX="15px"
                                        fontWeight="bold"
                                        onClick={() => openRenewModal(customer)}
                                    >
                                        Renew
                                    </Button>

                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>
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
                        <p><strong>Hours Remaining:</strong> {selectedCustomer?.remainingHours}</p>

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
                                massages.map((massage) => (
                                    <option key={massage._id} value={massage._id}>
                                        {massage.name}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No Massages Available</option>
                            )}
                        </select>

                        <input
                            type="number"
                            value={usedHours}
                            onChange={(e) => setUsedHours(e.target.value)}
                            placeholder="Hours Used"
                            min="1"
                            max={selectedCustomer?.remainingHours}
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
                                    opacity: serviceType && usedHours > 0 && usedHours <= selectedCustomer?.remainingHours ? 1 : 0.6,
                                }}
                                disabled={!serviceType || usedHours <= 0 || usedHours > selectedCustomer?.remainingHours}
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
            {isRenewModalOpen && (
                <>
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
                        onClick={closeRenewModal}
                    />
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
                        <h2 style={{ marginBottom: "8px", textAlign: "center" }}>Renew Subscription</h2>

                        <p><strong>Customer:</strong> {renewCustomer?.name}</p>

                        <select
                            value={selectedSubscription}
                            onChange={(e) => setSelectedSubscription(e.target.value)}
                            style={{
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                width: "100%",
                                fontSize: "16px",
                            }}
                        >
                            <option value="">Select Subscription</option>
                            {subscriptions.length > 0 ? (
                                subscriptions.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name} - {sub.validityHours} hours
                                    </option>
                                ))
                            ) : (
                                <option disabled>No Subscriptions Available</option>
                            )}
                        </select>



                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                            <button
                                onClick={handleRenewSubscription}
                                style={{
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    flex: 1,
                                    marginRight: "8px",
                                    opacity: selectedSubscription ? 1 : 0.6,
                                }}
                                disabled={!selectedSubscription}
                            >
                                Confirm
                            </button>

                            <button
                                onClick={closeRenewModal}
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