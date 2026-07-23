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
import AdminBundles from "./pages/admin/AdminBundles";
import AdminBundleEditor from "./pages/admin/AdminBundleEditor";
import AdminStages from "./pages/admin/AdminStages";
import AdminSubjects from "./pages/admin/AdminSubjects";
import CourseInfoEditor from "./pages/admin/CourseInfoEditor";
import CourseBuilder from "./pages/admin/CourseBuilder";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import CourseContentPage, {
  LegacyLessonRedirect,
  LegacyQuizRedirect,
} from "./pages/CourseContentPage";
import MyCourses from "./pages/student/MyCourses";
import StudentStatistics from "./pages/student/StudentStatistics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVideoPlayerSettings from "./pages/admin/AdminVideoPlayerSettings";
import QuizTake from "./pages/QuizTake";
import AdminQuizAttempts from "./pages/admin/AdminQuizAttempts";
import MyQuizAttempts from "./pages/student/MyQuizAttempts";
import AdminAssignmentSubmissions from "./pages/admin/AdminAssignmentSubmissions";
import MyAssignmentSubmissions from "./pages/student/MyAssignmentSubmissions";
import QuizStatistics from "./pages/admin/QuizStatistics";
import AdminRegistrationForm from "./pages/admin/AdminRegistrationForm";
import MyAccount from "./pages/student/MyAccount";
import MyWallet from "./pages/student/MyWallet";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetail from "./pages/admin/AdminStudentDetail";
import AdminQrSettings from "./pages/admin/AdminQrSettings";
import AdminCards from "./pages/admin/AdminCards";
import AdminWallets from "./pages/admin/AdminWallets";
import AdminPaymentGateways from "./pages/admin/AdminPaymentGateways";
import AdminManualPaymentSettings from "./pages/admin/AdminManualPaymentSettings";
import AdminKashierSettings from "./pages/admin/AdminKashierSettings";
import AdminPaymobSettings from "./pages/admin/AdminPaymobSettings";
import AdminFawaterakSettings from "./pages/admin/AdminFawaterakSettings";
import AdminPaymentRequests from "./pages/admin/AdminPaymentRequests";
import AdminBilling from "./pages/admin/AdminBilling";
import CardBuilder from "./pages/admin/CardBuilder";
import PublicStudentSnapshot from "./pages/PublicStudentSnapshot";
import PaymentKashierReturn from "./pages/PaymentKashierReturn";
import PaymentPaymobReturn from "./pages/PaymentPaymobReturn";
import PaymentFawaterakReturn from "./pages/PaymentFawaterakReturn";
import Bundles from "./pages/Bundles";
import LeaderboardLayout from "./pages/admin/leaderboard/LeaderboardLayout";
import LeaderboardTop from "./pages/admin/leaderboard/LeaderboardTop";
import LeaderboardLevels from "./pages/admin/leaderboard/LeaderboardLevels";
import LeaderboardSettings from "./pages/admin/leaderboard/LeaderboardSettings";
import LeaderboardBadgesPlaceholder from "./pages/admin/leaderboard/LeaderboardBadgesPlaceholder";
import LeaderboardBadges from "./pages/admin/leaderboard/LeaderboardBadges";
import LeaderboardPage from "./pages/Leaderboard";
import MyBadges from "./pages/student/MyBadges";
import MyLevels from "./pages/student/MyLevels";
import BadgeCelebration from "./components/BadgeCelebration";
import MobileBottomNav from "./components/MobileBottomNav";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <BadgeCelebration />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/s/:qrToken" element={<PublicStudentSnapshot />} />
            <Route path="/payment/kashier/return" element={<PaymentKashierReturn />} />
            <Route path="/payment/paymob/return" element={<PaymentPaymobReturn />} />
            <Route path="/payment/fawaterak/return" element={<PaymentFawaterakReturn />} />
            <Route
              path="/courses/:courseId/learn/:contentType/:contentId"
              element={
                <RequireAuth>
                  <CourseContentPage />
                </RequireAuth>
              }
            />
            {/* Legacy redirects for old links */}
            <Route
              path="/courses/:courseId/learn/:lessonId"
              element={
                <RequireAuth>
                  <LegacyLessonRedirect />
                </RequireAuth>
              }
            />
            <Route
              path="/courses/:courseId/quizzes/:quizId"
              element={
                <RequireAuth>
                  <LegacyQuizRedirect />
                </RequireAuth>
              }
            />
            <Route
              path="/quizzes/attempts/:attemptId"
              element={
                <RequireAuth>
                  <QuizTake />
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
              <Route path="quiz-attempts" element={<MyQuizAttempts />} />
              <Route path="assignment-submissions" element={<MyAssignmentSubmissions />} />
              <Route path="account" element={<MyAccount />} />
              <Route path="wallet" element={<MyWallet />} />
              <Route path="badges" element={<MyBadges />} />
              <Route path="levels" element={<MyLevels />} />
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
              <Route path="quiz-attempts" element={<AdminQuizAttempts />} />
              <Route path="assignment-submissions" element={<AdminAssignmentSubmissions />} />
              <Route path="quiz-statistics/:quizId" element={<QuizStatistics />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<AdminStudentDetail />} />

              <Route path="courses" element={<AdminCourses />} />
              <Route path="bundles" element={<AdminBundles />} />
              <Route path="bundles/new" element={<AdminBundleEditor />} />
              <Route path="bundles/:id" element={<AdminBundleEditor />} />
              <Route path="courses/new" element={<CourseInfoEditor />} />
              <Route path="courses/:id/edit" element={<CourseInfoEditor />} />
              <Route path="courses/:id/builder" element={<CourseBuilder />} />
              <Route path="stages" element={<AdminStages />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="settings/video-player" element={<AdminVideoPlayerSettings />} />
              <Route path="settings/registration-form" element={<AdminRegistrationForm />} />
              <Route path="settings/student-qr" element={<AdminQrSettings />} />
              <Route path="cards" element={<AdminCards />} />
              <Route path="wallets" element={<AdminWallets />} />
              <Route path="payment-gateways" element={<AdminPaymentGateways />} />
              <Route path="payment-gateways/manual" element={<AdminManualPaymentSettings />} />
              <Route path="payment-gateways/kashier" element={<AdminKashierSettings />} />
              <Route path="payment-gateways/paymob" element={<AdminPaymobSettings />} />
              <Route path="payment-gateways/fawaterak" element={<AdminFawaterakSettings />} />
              <Route path="payment-requests" element={<AdminPaymentRequests />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="cards/:templateId/edit" element={<CardBuilder />} />
              <Route path="account" element={<MyAccount />} />
              <Route path="leaderboard" element={<LeaderboardLayout />}>
                <Route index element={<LeaderboardTop />} />
                <Route path="badges" element={<LeaderboardBadges />} />
                <Route path="levels" element={<LeaderboardLevels />} />
                <Route path="settings" element={<LeaderboardSettings />} />
              </Route>
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
