import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Target,
  Repeat,
  Calendar,
  Loader2,
  Play,
  Eye,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchQuizMeta,
  listMyAttempts,
  startAttempt,
  type QuizAttempt,
  type QuizMeta,
} from "@/lib/quiz-api";
import { useAuth } from "@/contexts/AuthContext";
import AttemptDetailsModal from "@/components/quiz/AttemptDetailsModal";

const fmtDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const QuizDetailsPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState<QuizMeta | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [detailsAttemptId, setDetailsAttemptId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      const [q, a] = await Promise.all([fetchQuizMeta(quizId), listMyAttempts(quizId)]);
      setQuiz(q);
      setAttempts(a);
    } catch (e: any) {
      toast.error(e?.message || "تعذّر تحميل الاختبار");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (!authLoading) load();
  }, [load, authLoading]);

  const finishedCount = useMemo(
    () => attempts.filter((a) => a.status !== "in_progress").length,
    [attempts],
  );
  const inProgress = attempts.find((a) => a.status === "in_progress");

  const startState = useMemo(() => {
    if (!quiz) return { disabled: true, message: "" };
    if (!user) return { disabled: true, message: "يجب تسجيل الدخول للبدء." };
    if (inProgress) return { disabled: false, message: "", resume: true };
    if (quiz.start_at && now < new Date(quiz.start_at).getTime())
      return {
        disabled: true,
        message: `لم يبدأ الاختبار بعد، سيكون متاحاً في ${fmtDateTime(quiz.start_at)}.`,
      };
    if (quiz.end_at && now > new Date(quiz.end_at).getTime())
      return { disabled: true, message: "انتهت الفترة المتاحة لبدء هذا الاختبار." };
    if (finishedCount >= quiz.max_attempts)
      return { disabled: true, message: "لقد استخدمت جميع المحاولات المتاحة لهذا الاختبار." };
    return { disabled: false, message: "" };
  }, [quiz, user, now, finishedCount, inProgress]);

  const handleStart = async () => {
    if (!quiz) return;
    setStarting(true);
    try {
      if (inProgress) {
        navigate(`/quizzes/attempts/${inProgress.id}`);
        return;
      }
      const id = await startAttempt(quiz.id);
      navigate(`/quizzes/attempts/${id}`);
    } catch (e: any) {
      toast.error(e?.message || "تعذّر بدء الاختبار");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="mb-4">
          <Button variant="ghost" asChild size="sm">
            <Link to={`/courses/${courseId}`}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للدورة
            </Link>
          </Button>
        </div>

        {loading || !quiz ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary text-primary-foreground border-0 gap-1">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    اختبار
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold mb-3">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-muted-foreground leading-relaxed">{quiz.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <MetaCard icon={<Clock className="w-4 h-4" />} label="المدة" value={`${quiz.duration_minutes} دقيقة`} />
                  <MetaCard icon={<Target className="w-4 h-4" />} label="النجاح" value={`${quiz.pass_percentage}%`} />
                  <MetaCard
                    icon={<Repeat className="w-4 h-4" />}
                    label="المحاولات"
                    value={`${finishedCount} / ${quiz.max_attempts}`}
                  />
                  {(quiz.start_at || quiz.end_at) ? (
                    <MetaCard
                      icon={<Calendar className="w-4 h-4" />}
                      label="النافذة"
                      value={
                        <div className="text-xs leading-tight">
                          {quiz.start_at && <div>من: {fmtDateTime(quiz.start_at)}</div>}
                          {quiz.end_at && <div>إلى: {fmtDateTime(quiz.end_at)}</div>}
                        </div>
                      }
                    />
                  ) : (
                    <MetaCard icon={<Calendar className="w-4 h-4" />} label="النافذة" value="غير محدودة" />
                  )}
                </div>
              </div>

              {/* Attempt history */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold mb-4">محاولاتك السابقة</h2>
                {attempts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-xl">
                    لم تقم بأي محاولة بعد.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attempts.map((a) => (
                      <AttemptRow
                        key={a.id}
                        attempt={a}
                        onDetails={() => setDetailsAttemptId(a.id)}
                        onResume={() => navigate(`/quizzes/attempts/${a.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Sidebar CTA */}
            <motion.aside
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                {startState.message && (
                  <div className="rounded-lg bg-accent p-3 text-sm">{startState.message}</div>
                )}
                <Button
                  onClick={handleStart}
                  disabled={startState.disabled || starting}
                  size="lg"
                  className="w-full font-bold text-base shadow-lg shadow-primary/20"
                >
                  {starting ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 ml-2" />
                  )}
                  {inProgress ? "متابعة الاختبار" : "بدء الاختبار"}
                </Button>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  عند بدء الاختبار سيتم تخصيص نموذج عشوائي لك وسيبدأ العدّ التنازلي فوراً. لا يمكن إيقاف المؤقت.
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </main>
      <Footer />

      <AttemptDetailsModal
        attemptId={detailsAttemptId}
        open={!!detailsAttemptId}
        onOpenChange={(o) => !o && setDetailsAttemptId(null)}
      />
    </div>
  );
};

const MetaCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="rounded-xl border border-border p-3 bg-accent/30">
    <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mb-1">
      {icon}
      {label}
    </div>
    <div className="font-bold text-sm">{value}</div>
  </div>
);

const AttemptRow = ({
  attempt,
  onDetails,
  onResume,
}: {
  attempt: QuizAttempt;
  onDetails: () => void;
  onResume: () => void;
}) => {
  const statusBadge =
    attempt.status === "in_progress" ? (
      <Badge variant="outline">قيد التقدّم</Badge>
    ) : attempt.status === "needs_review" ? (
      <Badge className="bg-blue-500 text-white border-0">قيد المراجعة</Badge>
    ) : attempt.passed ? (
      <Badge className="bg-emerald-500 text-white border-0">ناجح</Badge>
    ) : (
      <Badge className="bg-red-500 text-white border-0">راسب</Badge>
    );

  return (
    <div className="rounded-xl border border-border p-3 md:p-4 flex flex-wrap items-center gap-3 hover:bg-accent/30 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
        {attempt.attempt_number}
      </div>
      <div className="flex-1 min-w-[140px]">
        <div className="text-sm font-semibold">
          {fmtDateTime(attempt.submitted_at || attempt.started_at)}
        </div>
        <div className="text-xs text-muted-foreground">
          {attempt.percentage != null ? `${attempt.percentage}%` : "—"} · النموذج {attempt.form_number}
        </div>
      </div>
      {statusBadge}
      <MessageSquare
        className={`w-4 h-4 ${attempt.feedback ? "text-primary" : "text-muted-foreground/40"}`}
      />
      {attempt.status === "in_progress" ? (
        <Button size="sm" onClick={onResume}>
          <Play className="w-3.5 h-3.5 ml-1" />
          متابعة
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={onDetails}>
          <Eye className="w-3.5 h-3.5 ml-1" />
          عرض التفاصيل
        </Button>
      )}
    </div>
  );
};

export default QuizDetailsPage;
