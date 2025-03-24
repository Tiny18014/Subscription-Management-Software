import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Subscriptions from "./pages/Subscriptions";
import Invoices from "./pages/Invoices";
import AddCustomerPage from "./pages/AddCustomerPage";
import AddSubscriptionPage from "./pages/AddSubscriptionPage";
import AddMassagePage from "./pages/AddMassagePage";
import Massages from "./pages/Massages";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import CustomerPanel from "./pages/EmployeePanel";
import AddCustomerPageEmployee from "./pages/AddCustomerPageEmployee";
import SubscriptionsEmployee from "./pages/SubscriptionsEmployee";
import MassagesEmployee from "./pages/MassagesEmployee";
import InvoicesEmployee from "./pages/InvoicesEmployee";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/" element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="customers" element={<Customers />} />
                <Route path="/add-customer" element={<AddCustomerPage />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="subscriptionsemployee" element={<SubscriptionsEmployee />} />
                <Route path="/add-subscription" element={<AddSubscriptionPage />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoicesemployee" element={<InvoicesEmployee />} />
                <Route path="massages" element={<Massages />} />
                <Route path="/add-massages" element={<AddMassagePage />} />
                <Route path="massagesemployee" element={<MassagesEmployee />} />
                <Route path="/customerdashboard" element={<CustomerPanel />} />
                <Route path="/add-customer-1" element={<AddCustomerPageEmployee />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
