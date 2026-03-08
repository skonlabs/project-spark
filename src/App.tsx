import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import HomePage from "./pages/dashboard/Home";
import ContentDetailPage from "./pages/dashboard/ContentDetail";
import CompetitivePage from "./pages/dashboard/Competitive";
import SettingsPage from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "hsl(222.2 84% 4.9%)",
          color: "hsl(210 40% 98%)",
          border: "1px solid hsl(217.2 32.6% 17.5%)",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="content/:contentId" element={<ContentDetailPage />} />
          <Route path="competitive" element={<CompetitivePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
