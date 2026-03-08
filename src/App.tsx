import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import OverviewPage from "./pages/dashboard/Overview";
import AnalysisPage from "./pages/dashboard/Analysis";
import SimulationPage from "./pages/dashboard/Simulation";
import CompetitivePage from "./pages/dashboard/Competitive";
import TopicsPage from "./pages/dashboard/Topics";
import ContentPage from "./pages/dashboard/Content";
import MonitoringPage from "./pages/dashboard/Monitoring";
import GenerateContentPage from "./pages/dashboard/GenerateContent";
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
          <Route index element={<OverviewPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="simulation" element={<SimulationPage />} />
          <Route path="competitive" element={<CompetitivePage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="content/generate" element={<GenerateContentPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
