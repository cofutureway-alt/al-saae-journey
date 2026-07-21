import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck, ClipboardList, PlayCircle } from "lucide-react";
import type { ContentItem, ContentItemType } from "@/hooks/use-unit-content-items";

/**
 * A single content item row in the curriculum sidebar.
 * Lessons, quizzes, and assignments render as visual peers — same base
 * card, size, padding, typography, active/completed treatment. The only
 * visual difference between types is the leading icon and a small type
 * label. Adding a new type = extend TYPE_META below (nothing else changes).
 */

const TYPE_META: Record<
  ContentItemType,
  { icon: typeof PlayCircle; label: string }
> = {
  lesson: { icon: PlayCircle, label: "درس" },
  quiz: { icon: ClipboardCheck, label: "اختبار" },
  assignment: { icon: ClipboardList, label: "واجب" },
};

interface Props {
  item: ContentItem;
  isCurrent: boolean;
  onNavigate?: () => void;
}

const ContentSidebarItem = ({ item, isCurrent, onNavigate }: Props) => {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;
  const isDone = item.isCompleted;

  return (
    <Link
      to={item.routePath}
      onClick={onNavigate}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isCurrent
          ? "bg-primary/10 text-foreground"
          : "hover:bg-accent text-foreground/80"
      }`}
    >
      {isCurrent && (
        <motion.span
          layoutId="content-active-indicator"
          className="absolute inset-y-1 right-0 w-1 rounded-full bg-primary"
        />
      )}
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
          isDone
            ? "bg-emerald-500 text-white"
            : isCurrent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {isDone ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Icon className={`w-4 h-4 ${isCurrent ? "" : "opacity-70"}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{item.title}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {meta.label}
          {item.type === "quiz" && item.extra?.durationMinutes != null && (
            <> · {item.extra.durationMinutes} د</>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentSidebarItem;
