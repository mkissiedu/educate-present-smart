import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LessonProvider } from "@/contexts/LessonContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TermProvider } from "@/contexts/TermContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperTeacherDashboard from "./pages/SuperTeacherDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";
import LessonEditor from "./pages/LessonEditor";
import CurriculumMap from "./components/CurriculumMap";
import TermPlanner from "./pages/TermPlanner";
import QuestionBank from "./pages/QuestionBank";
import AuthTestPanel from "./components/AuthTestPanel";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SchoolProvider>
          <BrandingProvider>
            <LessonProvider>
              <TermProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/home" element={<Landing />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/super-teacher" element={<SuperTeacherDashboard />} />
                      <Route path="/super-admin" element={<SuperAdminDashboard />} />
                      <Route path="/curriculum" element={<CurriculumMap />} />
                      <Route path="/term-planner" element={<TermPlanner />} />
                      <Route path="/question-bank" element={<QuestionBank />} />
                      <Route path="/editor/:id" element={<LessonEditor />} />
                      <Route path="/auth-test" element={<AuthTestPanel />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>

                  </BrowserRouter>
                </TooltipProvider>
              </TermProvider>
            </LessonProvider>
          </BrandingProvider>
        </SchoolProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;


