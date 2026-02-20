import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Writing from "./pages/Writing";
import BlogPost from "./pages/BlogPost";
import PortfolioPage from "./pages/PortfolioPage";
import NotFound from "./pages/NotFound";
import { EasterEgg } from "./components/EasterEgg";
import { PageTransition } from "./components/PageTransition";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();

  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/writing/:slug" element={<BlogPost />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <EasterEgg />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
