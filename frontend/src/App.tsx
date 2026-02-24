import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ProfilePage from "./pages/ProfilePage";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import NetworkPage from "./pages/NetworkPage";
import Jobs from "./pages/Jobs";
import JobsPage from "./pages/JobsPage";
import Events from "./pages/Events";
import EventsPage from "./pages/EventsPage";
import CreatePost from "./pages/CreatePost";
import BlogEditor from "./pages/BlogEditor";
import PostDetail from "./pages/PostDetail";
import PostDetailPage from "./pages/PostDetailPage";
import Settings from "./pages/Settings";
import AnalyticsPage from "./pages/AnalyticsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Layout />}>
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/create" element={<BlogEditor />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
