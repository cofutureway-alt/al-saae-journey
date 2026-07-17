import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import RequireAdmin from "@/components/auth/RequireAdmin";
import RequireAuth from "@/components/auth/RequireAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import StudentLayout from "@/components/student/StudentLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStages from "./pages/admin/AdminStages";
import CourseInfoEditor from "./pages/admin/CourseInfoEditor";
import CourseBuilder from "./pages/admin/CourseBuilder";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import LessonPage from "./pages/LessonPage";
import MyCourses from "./pages/student/MyCourses";
import StudentStatistics from "./pages/student/StudentStatistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route
              path="/courses/:courseId/learn/:lessonId"
              element={
                <RequireAuth>
                  <LessonPage />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <StudentLayout />
                </RequireAuth>
              }
            >
              <Route index element={<MyCourses />} />
              <Route path="statistics" element={<StudentStatistics />} />
            </Route>
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminStatistics />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<CourseInfoEditor />} />
              <Route path="courses/:id/edit" element={<CourseInfoEditor />} />
              <Route path="courses/:id/builder" element={<CourseBuilder />} />
              <Route path="stages" element={<AdminStages />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
