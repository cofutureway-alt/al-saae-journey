import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOrderStatus,
  STATUS_LABEL,
  changeBookOrderStatus,
  nextAdminTransitions,
} from "@/lib/book-orders-management-api";

export default function BookOrderStatusDialog({
  order,
  onClose,
  onChanged,
}: {
  order: { id: string; number: string; current: BookOrderStatus } | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [target, setTarget] = useState<BookOrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      const opts = nextAdminTransitions(order.current);
      setTarget(opts[0] ?? "");
      setNotes("");
      setNotify(true);
    }
  }, [order]);

  if (!order) return null;
  const options = nextAdminTransitions(order.current);

  const submit = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await changeBookOrderStatus({
        orderId: order.id,
        newStatus: target as BookOrderStatus,
        notes: notes.trim() || null,
        notifyStudent: notify,
      });
      toast({ title: "تم تحديث حالة الطلب" });
      onChanged();
    } catch (e: any) {
      toast({ title: "تعذّر التحديث", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تغيير حالة الطلب</DialogTitle>
          <DialogDescription>
            الطلب <span className="font-mono">{order.number}</span> — الحالة الحالية:{" "}
            <span className="font-semibold">{STATUS_LABEL[order.current]}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">الحالة الجديدة</label>
            <Select value={target} onValueChange={(v) => setTarget(v as BookOrderStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {options.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              ملاحظات (اختياري)
            </label>
            <Textarea
              rows={3}
              placeholder="مثال: تم تسليم الشحنة لشركة الشحن..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={notify} onCheckedChange={(v) => setNotify(!!v)} />
            <span>إشعار الطالب بالتغيير</span>
          </label>
          <p className="text-xs text-muted-foreground -mt-2">
            سيتم إرسال إشعار للطالب عند تفعيل نظام الإشعارات.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button onClick={submit} disabled={saving || !target}>
            {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
