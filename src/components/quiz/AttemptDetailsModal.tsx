import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, Info, MessageSquare } from "lucide-react";
import RichTextRenderer from "@/components/admin/quiz/RichTextRenderer";
import { getAttemptDetails, type AttemptDetailQuestion, type QuizAttempt } from "@/lib/quiz-api";
import { cn } from "@/lib/utils";

const formatDuration = (secs: number) => {
  const s = Math.round(secs);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} ث`;
  return `${m} د ${r} ث`;
};

const typeLabel: Record<string, string> = {
  single_choice: "اختيار من متعدد",
  multiple_choice: "اختيار متعدد",
  true_false: "صح / خطأ",
  fill_blank: "إجابة كتابية",
};

interface Props {
  attemptId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export default function AttemptDetailsModal({ attemptId, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<AttemptDetailQuestion[]>([]);

  useEffect(() => {
    if (!open || !attemptId) return;
    setLoading(true);
    getAttemptDetails(attemptId)
      .then((d) => {
        setAttempt(d.attempt);
        setQuestions(d.questions);
      })
      .catch(() => {
        setAttempt(null);
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, [open, attemptId]);

  const totalTime = questions.reduce((a, q) => a + (q.time_spent_seconds || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-3 border-b">
          <DialogTitle className="text-xl">تفاصيل المحاولة</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : attempt ? (
              <>
                {/* Summary */}
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      المحاولة #{attempt.attempt_number}
                    </Badge>
                    <Badge variant="outline">النموذج {attempt.form_number}</Badge>
                    <StatusBadge attempt={attempt} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <Stat label="النقاط" value={`${attempt.earned_points} / ${attempt.total_points}`} />
                    <Stat label="النسبة" value={attempt.percentage != null ? `${attempt.percentage}%` : "—"} />
                    <Stat label="عدد الأسئلة" value={String(questions.length)} />
                    <Stat label="إجمالي الوقت" value={formatDuration(totalTime)} />
                  </div>
                  {attempt.feedback && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex gap-2">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm whitespace-pre-wrap">{attempt.feedback}</div>
                    </div>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <QuestionReview key={q.id} q={q} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">تعذّر تحميل المحاولة.</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-accent/40 p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-bold text-foreground">{value}</div>
  </div>
);

const StatusBadge = ({ attempt }: { attempt: QuizAttempt }) => {
  if (attempt.status === "needs_review")
    return <Badge className="bg-blue-500 text-white border-0">قيد المراجعة</Badge>;
  if (attempt.status === "in_progress")
    return <Badge variant="outline">قيد التقدّم</Badge>;
  if (attempt.passed)
    return <Badge className="bg-emerald-500 text-white border-0">ناجح</Badge>;
  return <Badge className="bg-red-500 text-white border-0">راسب</Badge>;
};

const QuestionReview = ({ q, index }: { q: AttemptDetailQuestion; index: number }) => {
  const isAuto = q.type !== "fill_blank";
  const orderedOptions = q.option_order
    .map((id) => q.options.find((o) => o.id === id))
    .filter(Boolean) as AttemptDetailQuestion["options"];
  const displayOptions = orderedOptions.length ? orderedOptions : q.options;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <Badge variant="outline" className="text-xs">{typeLabel[q.type]}</Badge>
        <Badge variant="secondary" className="text-xs">{q.points} نقطة</Badge>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {formatDuration(q.time_spent_seconds)}
        </div>
        {isAuto ? (
          q.is_correct ? (
            <Badge className="bg-emerald-500 text-white border-0 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> صحيح
            </Badge>
          ) : (
            <Badge className="bg-red-500 text-white border-0 gap-1">
              <XCircle className="w-3.5 h-3.5" /> خاطئ
            </Badge>
          )
        ) : (
          <Badge className="bg-blue-500 text-white border-0 gap-1">
            <Info className="w-3.5 h-3.5" /> قيد المراجعة
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-3">
        <RichTextRenderer content={q.content} />
        {q.image_url && (
          <img src={q.image_url} alt="" className="max-h-64 rounded-lg border border-border" />
        )}

        {q.type === "fill_blank" ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-border p-3 bg-accent/40">
              <div className="text-xs text-muted-foreground mb-1">إجابتك</div>
              <div className="whitespace-pre-wrap text-sm font-medium">
                {q.fill_blank_text?.trim() ? q.fill_blank_text : <span className="text-muted-foreground">لم تتم الإجابة</span>}
              </div>
            </div>
            {q.model_answer_text && (
              <div className="rounded-lg border border-emerald-500/30 p-3 bg-emerald-500/5">
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">إجابة نموذجية</div>
                <div className="whitespace-pre-wrap text-sm">{q.model_answer_text}</div>
              </div>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {displayOptions.map((o) => {
              const isSelected = q.selected_option_ids.includes(o.id);
              const showCorrect = o.is_correct;
              return (
                <li
                  key={o.id}
                  className={cn(
                    "rounded-lg border p-3 flex items-start gap-3 text-sm",
                    showCorrect
                      ? "border-emerald-500/60 bg-emerald-500/5"
                      : isSelected
                        ? "border-red-500/60 bg-red-500/5"
                        : "border-border bg-background",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      showCorrect
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isSelected
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-border",
                    )}
                  >
                    {showCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : isSelected ? <XCircle className="w-3.5 h-3.5" /> : null}
                  </div>
                  <div className="flex-1">
                    <RichTextRenderer content={o.content} />
                    <div className="mt-1 flex gap-2 text-[11px] text-muted-foreground">
                      {isSelected && <span>اختيارك</span>}
                      {showCorrect && <span>الإجابة الصحيحة</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
