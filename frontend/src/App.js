import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Loan from "@/pages/Loan";
import Contact from "@/pages/Contact";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProperties from "@/pages/admin/AdminProperties";
import AdminPropertyForm from "@/pages/admin/AdminPropertyForm";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminLayout from "@/components/AdminLayout";

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <WhatsAppButton />
  </div>
);

const ProtectedAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-navy">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/properties" element={<PublicLayout><Properties /></PublicLayout>} />
            <Route path="/properties/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/loan" element={<PublicLayout><Loan /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdmin>} />
            <Route path="/admin/properties" element={<ProtectedAdmin><AdminLayout><AdminProperties /></AdminLayout></ProtectedAdmin>} />
            <Route path="/admin/properties/new" element={<ProtectedAdmin><AdminLayout><AdminPropertyForm /></AdminLayout></ProtectedAdmin>} />
            <Route path="/admin/properties/:id/edit" element={<ProtectedAdmin><AdminLayout><AdminPropertyForm /></AdminLayout></ProtectedAdmin>} />
            <Route path="/admin/leads" element={<ProtectedAdmin><AdminLayout><AdminLeads /></AdminLayout></ProtectedAdmin>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
