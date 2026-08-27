import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import LogoScreen from "./pages/LogoScreen";
import NameScreen from "./pages/NameScreen";
import TaglineScreen from "./pages/TaglineScreen";
import LanguageScreen from "./pages/LanguageScreen";

import Onboarding1 from "./pages/Onboarding1";
import Onboarding2 from "./pages/Onboarding2";
import Onboarding3 from "./pages/Onboarding3";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import RoleSelection from "./pages/RoleSelection";

import DonorSetup from "./pages/DonorSetup";
import VolunteerSetup from "./pages/VolunteerSetup";
import NGOSetup from "./pages/NGOSetup";
import ReceiverSetup from "./pages/ReceiverSetup";

import DonorDashboard from "./pages/DonorDashboard";
import DonateFood from "./pages/DonateFood";
import DonationConfirmation from "./pages/DonationConfirmation";
import ActiveDonations from "./pages/ActiveDonations";
import LiveTracking from "./pages/LiveTracking";
import ReviewRating from "./pages/ReviewRating";
import DonationHistory from "./pages/DonationHistory";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ImpactDashboard from "./pages/ImpactDashboard";
import Gallery from "./pages/Gallery";

import DeliveryModeSelection from "./pages/DeliveryModeSelection";
import ReceiverPickupFlow from "./pages/ReceiverPickupFlow";
import SelfDeliveryFlow from "./pages/SelfDeliveryFlow";

import NGODashboard from "./pages/NGODashboard";
import FoodRequests from "./pages/FoodRequests";
import IncomingDonations from "./pages/IncomingDonations";
import DonationDetails from "./pages/DonationDetails";
import AcceptDonation from "./pages/AcceptDonation";
import AssignVolunteer from "./pages/AssignVolunteer";
import CompletedDeliveries from "./pages/CompletedDeliveries";
import Reports from "./pages/Reports";
import NGOReports from "./pages/NGOReports";
import SharedLiveTracking from "./pages/SharedLiveTracking";
import NGOLiveTracking from "./pages/NGOLiveTracking";
import NGOProfile from "./pages/NGOProfile";
import NGONotifications from "./pages/NGONotifications";
import EditNGOProfile from "./pages/EditNGOProfile";

import VolunteerDashboard from "./pages/VolunteerDashboard";
import PickupRequests from "./pages/PickupRequests";
import AcceptPickup from "./pages/AcceptPickup";
import VolunteerNavigation from "./pages/VolunteerNavigation";
import PickupCompleted from "./pages/PickupCompleted";
import DeliverFood from "./pages/DeliverFood";
import DeliveryCompleted from "./pages/DeliveryCompleted";
import VolunteerImpact from "./pages/VolunteerImpact";
import VolunteerProfile from "./pages/VolunteerProfile";
import EditVolunteerProfile from "./pages/EditVolunteerProfile";
import VolunteerNotifications from "./pages/VolunteerNotifications";

import ReceiverDashboard from "./pages/ReceiverDashboard";
import AvailableFood from "./pages/AvailableFood";
import FoodDetails from "./pages/FoodDetails";
import RequestPickup from "./pages/RequestPickup";
import PickupStatus from "./pages/PickupStatus";
import ReceiverTracking from "./pages/ReceiverTracking";
import ReceiverCompleted from "./pages/ReceiverCompleted";
import ReceiverHistory from "./pages/ReceiverHistory";
import ReceiverProfile from "./pages/ReceiverProfile";
import ReceiverNotifications from "./pages/ReceiverNotifications";
import EditReceiverProfile from "./pages/EditReceiverProfile";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import DonationMonitoring from "./pages/DonationMonitoring";
import AdminDeliveryTracking from "./pages/AdminDeliveryTracking";
import ComplaintsIssues from "./pages/ComplaintsIssues";
import AdminReports from "./pages/AdminReports";
import AdminNotifications from "./pages/AdminNotifications";

import ThankYou from "./pages/ThankYou";
import PlatformPerformance from "./pages/PlatformPerformance";
import SystemInteractions from "./pages/SystemInteractions";

function ProtectedRoute({ children, allowedRoles }) {
  const { token, role, sessionMode, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f5f5", color: "#2e7d32", fontSize: "20px" }}>
        Loading FoodBridge...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (role || "").toUpperCase();
  const isAdminSession = sessionMode === "admin" || userRole === "ADMIN" || currentUser?.isAdmin;
  const isAllowed = allowedRoles && (allowedRoles.includes(userRole) || (allowedRoles.includes("ADMIN") && isAdminSession));

  if (allowedRoles && !isAllowed) {
    const roleRoutes = {
      DONOR: "/donor/dashboard",
      NGO: "/ngo/dashboard",
      VOLUNTEER: "/volunteer/dashboard",
      RECEIVER: "/receiver/dashboard",
      ADMIN: "/admin/dashboard",
    };
    const targetRedirect = isAdminSession ? "/admin/dashboard" : (roleRoutes[userRole] || "/login");
    return <Navigate to={targetRedirect} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* App Start */}
            <Route path="/" element={<LogoScreen />} />
            <Route path="/name" element={<NameScreen />} />
            <Route path="/tagline" element={<TaglineScreen />} />
            <Route path="/language" element={<LanguageScreen />} />

            {/* Onboarding */}
            <Route path="/onboarding1" element={<Onboarding1 />} />
            <Route path="/onboarding2" element={<Onboarding2 />} />
            <Route path="/onboarding3" element={<Onboarding3 />} />

            {/* Authentication Flow */}
            <Route path="/login" element={<Login />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/roles" element={<RoleSelection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot" element={<Navigate to="/forgot-password" replace />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/adminlogin" element={<Navigate to="/admin-login" replace />} />
            <Route path="/otp" element={<Navigate to="/forgot-password" replace />} />
            <Route path="/reset" element={<Navigate to="/forgot-password" replace />} />

            {/* Role Setup */}
            <Route path="/donorsetup" element={<DonorSetup />} />
            <Route path="/volunteersetup" element={<VolunteerSetup />} />
            <Route path="/ngosetup" element={<NGOSetup />} />
            <Route path="/receiversetup" element={<ReceiverSetup />} />

            {/* Donor Module & Dashboard */}
            <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={["DONOR"]}><DonorDashboard /></ProtectedRoute>} />
            <Route path="/donor" element={<ProtectedRoute allowedRoles={["DONOR"]}><DonorDashboard /></ProtectedRoute>} />
            <Route path="/donatefood" element={<ProtectedRoute allowedRoles={["DONOR"]}><DonateFood /></ProtectedRoute>} />
            <Route path="/deliverymode" element={<ProtectedRoute allowedRoles={["DONOR"]}><DeliveryModeSelection /></ProtectedRoute>} />
            <Route path="/confirmation" element={<ProtectedRoute allowedRoles={["DONOR"]}><DonationConfirmation /></ProtectedRoute>} />
            <Route path="/activedonations" element={<ProtectedRoute allowedRoles={["DONOR"]}><ActiveDonations /></ProtectedRoute>} />
            <Route path="/livetracking" element={<ProtectedRoute allowedRoles={["DONOR"]}><LiveTracking /></ProtectedRoute>} />
            <Route path="/review" element={<ProtectedRoute allowedRoles={["DONOR"]}><ReviewRating /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute allowedRoles={["DONOR"]}><DonationHistory /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={["DONOR"]}><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["DONOR"]}><Profile /></ProtectedRoute>} />
            <Route path="/editprofile" element={<ProtectedRoute allowedRoles={["DONOR"]}><EditProfile /></ProtectedRoute>} />
            <Route path="/impact" element={<ProtectedRoute allowedRoles={["DONOR"]}><ImpactDashboard /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute allowedRoles={["DONOR"]}><Gallery /></ProtectedRoute>} />

            {/* Extra Delivery Mode Flows */}
            <Route path="/receiverpickupflow" element={<ReceiverPickupFlow />} />
            <Route path="/selfdeliveryflow" element={<SelfDeliveryFlow />} />

            {/* NGO Module & Dashboard */}
            <Route path="/ngo/dashboard" element={<ProtectedRoute allowedRoles={["NGO"]}><NGODashboard /></ProtectedRoute>} />
            <Route path="/ngo" element={<ProtectedRoute allowedRoles={["NGO"]}><NGODashboard /></ProtectedRoute>} />
            <Route path="/foodrequests" element={<ProtectedRoute allowedRoles={["NGO"]}><FoodRequests /></ProtectedRoute>} />
            <Route path="/incomingdonations" element={<ProtectedRoute allowedRoles={["NGO"]}><IncomingDonations /></ProtectedRoute>} />
            <Route path="/donationdetails" element={<ProtectedRoute allowedRoles={["NGO"]}><DonationDetails /></ProtectedRoute>} />
            <Route path="/acceptdonation" element={<ProtectedRoute allowedRoles={["NGO"]}><AcceptDonation /></ProtectedRoute>} />
            <Route path="/assignvolunteer" element={<ProtectedRoute allowedRoles={["NGO"]}><AssignVolunteer /></ProtectedRoute>} />
            <Route path="/completeddeliveries" element={<ProtectedRoute allowedRoles={["NGO"]}><CompletedDeliveries /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={["NGO"]}><Reports /></ProtectedRoute>} />
            <Route path="/ngoreports" element={<ProtectedRoute allowedRoles={["NGO"]}><NGOReports /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute allowedRoles={["NGO"]}><SharedLiveTracking /></ProtectedRoute>} />
            <Route path="/ngotracking" element={<ProtectedRoute allowedRoles={["NGO"]}><NGOLiveTracking /></ProtectedRoute>} />
            <Route path="/ngoprofile" element={<ProtectedRoute allowedRoles={["NGO"]}><NGOProfile /></ProtectedRoute>} />
            <Route path="/ngonotifications" element={<ProtectedRoute allowedRoles={["NGO"]}><NGONotifications /></ProtectedRoute>} />
            <Route path="/editngoprofile" element={<ProtectedRoute allowedRoles={["NGO"]}><EditNGOProfile /></ProtectedRoute>} />

            {/* Volunteer Module & Dashboard */}
            <Route path="/volunteer/dashboard" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><VolunteerDashboard /></ProtectedRoute>} />
            <Route path="/volunteer" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><VolunteerDashboard /></ProtectedRoute>} />
            <Route path="/pickuprequests" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><PickupRequests /></ProtectedRoute>} />
            <Route path="/acceptpickup" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><AcceptPickup /></ProtectedRoute>} />
            <Route path="/volunteernavigation" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><VolunteerNavigation /></ProtectedRoute>} />
            <Route path="/pickupcompleted" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><PickupCompleted /></ProtectedRoute>} />
            <Route path="/deliverfood" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><DeliverFood /></ProtectedRoute>} />
            <Route path="/deliverycompleted" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><DeliveryCompleted /></ProtectedRoute>} />
            <Route path="/volunteerimpact" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><VolunteerImpact /></ProtectedRoute>} />
            <Route path="/volunteerprofile" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><VolunteerProfile /></ProtectedRoute>} />
            <Route path="/editvolunteerprofile" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><EditVolunteerProfile /></ProtectedRoute>} />
            <Route path="/volunteernotifications" element={<ProtectedRoute allowedRoles={["VOLUNTEER"]}><VolunteerNotifications /></ProtectedRoute>} />

            {/* Receiver Module & Dashboard */}
            <Route path="/receiver/dashboard" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverDashboard /></ProtectedRoute>} />
            <Route path="/receiver" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverDashboard /></ProtectedRoute>} />
            <Route path="/availablefood" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><AvailableFood /></ProtectedRoute>} />
            <Route path="/fooddetails" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><FoodDetails /></ProtectedRoute>} />
            <Route path="/requestpickup" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><RequestPickup /></ProtectedRoute>} />
            <Route path="/pickupstatus" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><PickupStatus /></ProtectedRoute>} />
            <Route path="/receivertracking" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverTracking /></ProtectedRoute>} />
            <Route path="/receivercompleted" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverCompleted /></ProtectedRoute>} />
            <Route path="/receiverhistory" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverHistory /></ProtectedRoute>} />
            <Route path="/receiverprofile" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverProfile /></ProtectedRoute>} />
            <Route path="/receivernotifications" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><ReceiverNotifications /></ProtectedRoute>} />
            <Route path="/editreceiverprofile" element={<ProtectedRoute allowedRoles={["RECEIVER"]}><EditReceiverProfile /></ProtectedRoute>} />

            {/* Admin Module & Dashboard */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/usermanagement" element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserManagement /></ProtectedRoute>} />
            <Route path="/donationmonitoring" element={<ProtectedRoute allowedRoles={["ADMIN"]}><DonationMonitoring /></ProtectedRoute>} />
            <Route path="/admindeliverytracking" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDeliveryTracking /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ComplaintsIssues /></ProtectedRoute>} />
            <Route path="/adminreports" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminReports /></ProtectedRoute>} />
            <Route path="/adminnotifications" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminNotifications /></ProtectedRoute>} />

            <Route path="/performance" element={<PlatformPerformance />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/flow" element={<SystemInteractions />} />
            <Route path="/interactions" element={<SystemInteractions />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
