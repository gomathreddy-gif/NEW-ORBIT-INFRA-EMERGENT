import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
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
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Agents from "@/pages/Agents";
import Wishlist from "@/pages/Wishlist";
import Compare from "@/pages/Compare";
import CustomerLogin from "@/pages/CustomerLogin";
import CustomerRegister from "@/pages/CustomerRegister";
import CustomerAccount from "@/pages/CustomerAccount";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProperties from "@/pages/admin/AdminProperties";
import AdminPropertyForm from "@/pages/admin/AdminPropertyForm";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminBlogForm from "@/pages/admin/AdminBlogForm";
import AdminAgents from "@/pages/admin/AdminAgents";
import AdminNewsletter from "@/pages/admin/AdminNewsletter";
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
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;
  return children;
};

const AdminPage = ({ children }) => (
  <ProtectedAdmin><AdminLayout>{children}</AdminLayout></ProtectedAdmin>
);

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <WishlistProvider>
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
              <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
              <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
              <Route path="/agents" element={<PublicLayout><Agents /></PublicLayout>} />
              <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
              <Route path="/compare" element={<PublicLayout><Compare /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><CustomerLogin /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><CustomerRegister /></PublicLayout>} />
              <Route path="/account" element={<PublicLayout><CustomerAccount /></PublicLayout>} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
              <Route path="/admin/properties" element={<AdminPage><AdminProperties /></AdminPage>} />
              <Route path="/admin/properties/new" element={<AdminPage><AdminPropertyForm /></AdminPage>} />
              <Route path="/admin/properties/:id/edit" element={<AdminPage><AdminPropertyForm /></AdminPage>} />
              <Route path="/admin/leads" element={<AdminPage><AdminLeads /></AdminPage>} />
              <Route path="/admin/blog" element={<AdminPage><AdminBlog /></AdminPage>} />
              <Route path="/admin/blog/new" element={<AdminPage><AdminBlogForm /></AdminPage>} />
              <Route path="/admin/blog/:id/edit" element={<AdminPage><AdminBlogForm /></AdminPage>} />
              <Route path="/admin/agents" element={<AdminPage><AdminAgents /></AdminPage>} />
              <Route path="/admin/newsletter" element={<AdminPage><AdminNewsletter /></AdminPage>} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
