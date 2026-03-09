import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import { ContentProvider } from "./contexts/ContentContext";
import HomePage from "./pages/dashboard/Home";
import OverviewPage from "./pages/dashboard/Overview";
import ContentPage from "./pages/dashboard/Content";
import ContentDetailPage from "./pages/dashboard/ContentDetail";
import GenerateContentPage from "./pages/dashboard/GenerateContent";
import PromptsPage from "./pages/dashboard/Prompts";
import AnalysisPage from "./pages/dashboard/Analysis";
import CompetitivePage from "./pages/dashboard/Competitive";
import SimulationPage from "./pages/dashboard/Simulation";
import MonitoringPage from "./pages/dashboard/Monitoring";
import TopicsPage from "./pages/dashboard/Topics";
import AgentPage from "./pages/dashboard/Agent";
import PublishPage from "./pages/dashboard/Publish";
import ProjectsPage from "./pages/dashboard/Projects";
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
          background: "hsl(228 14% 7%)",
          color: "hsl(210 8% 91%)",
          border: "1px solid hsl(213 16% 19%)",
          fontSize: "13px",
        },
        success: { iconTheme: { primary: "#33D17A", secondary: "#fff" } },
        error: { iconTheme: { primary: "#FF5C5C", secondary: "#fff" } },
      }}
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ContentProvider><DashboardLayout /></ContentProvider>}>
          <Route index element={<HomePage />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="content/generate" element={<GenerateContentPage />} />
          <Route path="content/:contentId" element={<ContentDetailPage />} />
          <Route path="prompts" element={<PromptsPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="competitive" element={<CompetitivePage />} />
          <Route path="simulation" element={<SimulationPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="agent" element={<AgentPage />} />
          <Route path="publish" element={<PublishPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
