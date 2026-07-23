import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Package, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface BundleRow {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  status: string;
  is_paid: boolean;
  is_featured: boolean;
  price_piastres: number | null;
  discount_price_piastres: number | null;
  discount_expires_at: string | null;
  bundle_courses: { course_id: string }[];
}

interface CourseOpt {
  id: string;
  title: string;
}

const emptyForm = () => ({
  id: "" as string | null,
  title: "",
  description: "",
  cover_image_url: "",
  status: "draft",
  is_paid: true,
  is_featured: false,
  price_egp: "",
  discount_egp: "",
  discount_expires_at: "",
  course_ids: [] as string[],
});

export default function AdminBundles() {
  const { user } = useAuth();
  const [bundles, setBundles] = useState<BundleRow[]>([]);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: b, error: be }, { data: c }] = await Promise.all([
      (supabase as any)
        .from("bundles")
        .select(
          "id, title, description, cover_image_url, status, is_paid, is_featured, price_piastres, discount_price_piastres, discount_expires_at, bundle_courses(course_id)"
        )
        .order("created_at", { ascending: false }),
      (supabase as any).from("courses").select("id, title").order("title"),
    ]);
    if (be) toast.error("تعذّر تحميل الباقات");
    setBundles((b as BundleRow[]) ?? []);
    setCourses((c as CourseOpt[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (row: BundleRow) => {
    setForm({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      cover_image_url: row.cover_image_url ?? "",
      status: row.status,
      is_paid: row.is_paid,
      is_featured: row.is_featured,
      price_egp: row.price_piastres != null ? String(row.price_piastres / 100) : "",
      discount_egp:
        row.discount_price_piastres != null
          ? String(row.discount_price_piastres / 100)
          : "",
      discount_expires_at: row.discount_expires_at
        ? row.discount_expires_at.slice(0, 16)
        : "",
      course_ids: (row.bundle_courses ?? []).map((x) => x.course_id),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("عنوان الباقة مطلوب");
      return;
    }
    if (form.course_ids.length < 2) {
      toast.error("اختر دورتين على الأقل");
      return;
    }
    const price =
      form.is_paid && form.price_egp
        ? Math.round(parseFloat(form.price_egp) * 100)
        : null;
    const discount =
      form.is_paid && form.discount_egp
        ? Math.round(parseFloat(form.discount_egp) * 100)
        : null;
    if (form.is_paid && (price == null || price <= 0)) {
      toast.error("سعر الباقة غير صالح");
      return;
    }

    setSaving(true);
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      status: form.status,
      is_paid: form.is_paid,
      is_featured: form.is_featured,
      price_piastres: price,
      discount_price_piastres: discount,
      discount_expires_at: form.discount_expires_at
        ? new Date(form.discount_expires_at).toISOString()
        : null,
    };

    let bundleId = form.id;
    if (bundleId) {
      const { error } = await (supabase as any)
        .from("bundles")
        .update(payload)
        .eq("id", bundleId);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      await (supabase as any).from("bundle_courses").delete().eq("bundle_id", bundleId);
    } else {
      payload.created_by = user?.id ?? null;
      const { data, error } = await (supabase as any)
        .from("bundles")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        toast.error(error?.message || "تعذّر إنشاء الباقة");
        setSaving(false);
        return;
      }
      bundleId = data.id;
    }

    const rows = form.course_ids.map((cid, i) => ({
      bundle_id: bundleId,
      course_id: cid,
      position: i,
    }));
    if (rows.length) {
      const { error: bcErr } = await (supabase as any).from("bundle_courses").insert(rows);
      if (bcErr) {
        toast.error(bcErr.message);
        setSaving(false);
        return;
      }
    }

    toast.success(form.id ? "تم تحديث الباقة" : "تم إنشاء الباقة");
    setSaving(false);
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الباقة؟")) return;
    const { error } = await (supabase as any).from("bundles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  const toggleFeatured = async (row: BundleRow) => {
    const { error } = await (supabase as any)
      .from("bundles")
      .update({
        is_featured: !row.is_featured,
        featured_at: !row.is_featured ? new Date().toISOString() : null,
      })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };

  const filteredCourses = useMemo(() => courses, [courses]);

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" /> باقات الدورات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            أنشئ باقات تجمع عدة دورات بسعر واحد مع إمكانية الخصم
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 ml-2" /> باقة جديدة
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">جارٍ التحميل…</div>
      ) : bundles.length === 0 ? (
        <Card className="p-16 text-center text-muted-foreground">
          لا توجد باقات بعد. اضغط "باقة جديدة" لإنشاء أول باقة.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => (
            <Card key={b.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">{b.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-2 items-center flex-wrap">
                    <Badge variant={b.status === "published" ? "default" : "secondary"}>
                      {b.status === "published" ? "منشورة" : "مسودة"}
                    </Badge>
                    <span>{b.bundle_courses?.length ?? 0} دورة</span>
                    {b.is_paid && b.price_piastres != null && (
                      <span className="text-primary font-semibold">
                        {(b.price_piastres / 100).toLocaleString("ar-EG")} ج.م
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFeatured(b)}
                  title="مميز"
                >
                  <Star
                    className={`w-4 h-4 ${b.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`}
                  />
                </Button>
              </div>
              {b.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(b)}>
                  <Pencil className="w-4 h-4 ml-1" /> تعديل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => remove(b.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "تعديل الباقة" : "باقة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>العنوان *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>رابط صورة الغلاف</Label>
              <Input
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشورة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between border rounded-lg px-3">
                <Label className="cursor-pointer">مدفوعة</Label>
                <Switch
                  checked={form.is_paid}
                  onCheckedChange={(v) => setForm({ ...form, is_paid: v })}
                />
              </div>
            </div>

            {form.is_paid && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>السعر (ج.م) *</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price_egp}
                    onChange={(e) => setForm({ ...form, price_egp: e.target.value })}
                  />
                </div>
                <div>
                  <Label>سعر الخصم (ج.م)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.discount_egp}
                    onChange={(e) => setForm({ ...form, discount_egp: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>انتهاء الخصم</Label>
                  <Input
                    type="datetime-local"
                    value={form.discount_expires_at}
                    onChange={(e) =>
                      setForm({ ...form, discount_expires_at: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <Label className="cursor-pointer">عرض في القسم المميز بالصفحة الرئيسية</Label>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
            </div>

            <div>
              <Label>الدورات داخل الباقة * (دورتان على الأقل)</Label>
              <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                {filteredCourses.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    لا توجد دورات
                  </div>
                ) : (
                  filteredCourses.map((c) => {
                    const checked = form.course_ids.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded p-2"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            setForm({
                              ...form,
                              course_ids: v
                                ? [...form.course_ids, c.id]
                                : form.course_ids.filter((x) => x !== c.id),
                            });
                          }}
                        />
                        <span className="text-sm">{c.title}</span>
                      </label>
                    );
                  })
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                محدد: {form.course_ids.length}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "جارٍ الحفظ…" : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
