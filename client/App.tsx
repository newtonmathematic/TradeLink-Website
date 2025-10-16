import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MarketingLayout from "@/components/MarketingLayout";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SafeTooltipProvider from "@/components/SafeTooltipProvider";
import ScrollToTop from "@/components/ScrollToTop";

// Marketing pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StripeSuccess from "./pages/StripeSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Features from "./pages/Features";
import Blog from "./pages/Blog";
import EmailVerified from "./pages/EmailVerified";

// App pages (dashboard and internal pages)
import Dashboard from "./pages/Dashboard";
import Discovery from "./pages/Discovery";
import BusinessProfile from "./pages/BusinessProfile";
import Proposals from "./pages/Proposals";
import ProposalDetail from "./pages/ProposalDetail";
import Verification from "./pages/Verification";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Support from "./pages/Support";
import Messages from "./pages/Messages";
import OpenRequestDetail from "./pages/OpenRequestDetail";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

const App = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeTooltipProvider delayDuration={300}>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Toaster />
              <Sonner />
              <Routes>
                {/* Marketing pages with marketing layout */}
                <Route
                  path="/"
                  element={
                    <MarketingLayout>
                      <Home />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/pricing"
                  element={
                    <MarketingLayout>
                      <Pricing />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <MarketingLayout>
                      <About />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <MarketingLayout>
                      <Contact />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <MarketingLayout>
                      <Terms />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <MarketingLayout>
                      <Privacy />
                    </MarketingLayout>
                  }
                />

                <Route
                  path="/features"
                  element={
                    <MarketingLayout>
                      <Features />
                    </MarketingLayout>
                  }
                />

                <Route
                  path="/blog"
                  element={
                    <MarketingLayout>
                      <Blog />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <MarketingLayout>
                      <Login />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <MarketingLayout>
                      <Signup />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/signup/stripe-success"
                  element={
                    <MarketingLayout>
                      <StripeSuccess />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/email-verified"
                  element={
                    <MarketingLayout>
                      <EmailVerified />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <MarketingLayout>
                      <ForgotPassword />
                    </MarketingLayout>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <MarketingLayout>
                      <ResetPassword />
                    </MarketingLayout>
                  }
                />

                {/* App pages with app layout */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discovery"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Discovery />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Messages />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/business/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <BusinessProfile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/proposals"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Proposals />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/proposals/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProposalDetail />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <OpenRequestDetail />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/verification"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Verification />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AdminUsers />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Settings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <ProtectedRoute allowRestricted={true}>
                      <Layout>
                        <Billing />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Support />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 page */}
                <Route
                  path="*"
                  element={
                    <MarketingLayout>
                      <NotFound />
                    </MarketingLayout>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </SafeTooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Global root instance for HMR support
declare global {
  interface Window {
    __tradelinkRoot?: ReturnType<typeof createRoot>;
  }
}

// Initialize root safely to prevent duplicate createRoot calls
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  // Check if we already have a root instance (for HMR)
  if (window.__tradelinkRoot) {
    try {
      // Just re-render on existing root
      window.__tradelinkRoot.render(<App />);
      return;
    } catch (error) {
      // If render fails, the root might be stale, clear it
      console.warn("Existing root failed to render, creating new one:", error);
      window.__tradelinkRoot = undefined;
    }
  }

  // Create new root and store globally
  try {
    const root = createRoot(rootElement);
    window.__tradelinkRoot = root;
    root.render(<App />);

    // Development logging
    if (import.meta.env.DEV) {
      console.log("✅ React root created successfully");
    }
  } catch (error) {
    console.error("Failed to create React root:", error);
    throw error;
  }
};

// Handle HMR (Hot Module Replacement)
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Re-render on hot reload
    if (window.__tradelinkRoot) {
      window.__tradelinkRoot.render(<App />);
    }
  });
}

// Initialize the app
initializeApp();
