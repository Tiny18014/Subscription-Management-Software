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
            setMassages(response.data || []);
        } catch (error) {
            console.error("Error fetching massages:", error);
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/subscriptions`);
            console.log("Fetched Subscriptions:", response.data); // Debugging line
            setSubscriptions(response.data.subscriptions || []); // Extract subscriptions array
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        }
    };


    useEffect(() => {
        fetchCustomers();
        fetchMassages();
        fetchSubscriptions();
    }, [debouncedSearch]);

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

    const openRenewModal = (customer) => {
        setRenewCustomer(customer);
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
            if (selectedCustomer.remainingHours <= 0) {
                toaster.create({
                    description: "Subscription has expired. Customer cannot use the service.",
                    type: "error",
                });
                return; // Stop execution if subscription has expired
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

    const handleRenewSubscription = async () => {
        if (!selectedSubscription || !renewCustomer) {
            toaster.create({
                description: "Please select a subscription",
                type: "error",
            });
            return;
        }

        try {
            await axios.put(`${API_URL}/api/customers/renew/${renewCustomer._id}`, {
                subscriptionId: selectedSubscription, // Send only subscriptionId in body
            });

            fetchCustomers(); // Refresh the customer list after renewal
            toaster.create({
                description: "Subscription renewed successfully",
                type: "success",
            });

            closeRenewModal();
        } catch (error) {
            console.error("Error renewing subscription:", error);
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
                            {subscriptions.length > 0 &&
                                subscriptions.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name} - {sub.validityHours} hours
                                    </option>
                                ))}
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
