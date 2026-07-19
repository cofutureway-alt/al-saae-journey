import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { isValidEgPhone, normalizeEgPhone, syntheticAuthEmail } from "@/lib/phone";

const schema = z
  .object({
    full_name: z.string().trim().min(2, { message: "الاسم يجب ألا يقل عن حرفين" }).max(80),
    phone: z.string().refine(isValidEgPhone, {
      message: "أدخل رقم هاتف مصري صحيح (مثال: 01012345678)",
    }),
    guardian_phone: z.string().refine(isValidEgPhone, {
      message: "أدخل رقم ولي الأمر بصيغة مصرية صحيحة",
    }),
    email: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || z.string().email().safeParse(v).success, {
        message: "البريد الإلكتروني غير صالح",
      }),
    password: z.string().min(6, { message: "كلمة المرور يجب ألا تقل عن 6 أحرف" }).max(72),
  })
  .refine((v) => normalizeEgPhone(v.phone) !== normalizeEgPhone(v.guardian_phone), {
    path: ["guardian_phone"],
    message: "رقم ولي الأمر يجب أن يختلف عن رقم الطالب",
  });

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect") ?? "/dashboard";
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [guardian, setGuardian] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({
      full_name: fullName,
      phone,
      guardian_phone: guardian,
      email,
      password,
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }

    const canonicalPhone = normalizeEgPhone(parsed.data.phone);
    const canonicalGuardian = normalizeEgPhone(parsed.data.guardian_phone);
    const realEmail = parsed.data.email?.trim().toLowerCase() || "";
    const authEmail = realEmail || syntheticAuthEmail(canonicalPhone);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          phone_number: canonicalPhone,
          guardian_phone: canonicalGuardian,
          real_email: realEmail || null,
        },
      },
    });

    if (error) {
      setLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        toast.error("هذا الحساب مسجّل بالفعل");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Auto-confirm is on; sign in immediately using the same auth email.
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: parsed.data.password,
    });
    setLoading(false);

    if (signInErr) {
      toast.success("تم إنشاء حسابك، يرجى تسجيل الدخول");
      navigate("/login", { replace: true });
      return;
    }

    toast.success("تم إنشاء حسابك بنجاح، أهلاً بك في الساعي");
    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="ابدأ رحلتك في تعلّم العلوم الشرعية"
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            سجّل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="full_name"
          label="الاسم الكامل"
          icon={User}
          value={fullName}
          onChange={setFullName}
          placeholder="محمد عبدالله"
          disabled={loading}
          error={errors.full_name}
          autoComplete="name"
        />

        <Field
          id="phone"
          label="رقم الهاتف (الطالب)"
          icon={Phone}
          value={phone}
          onChange={setPhone}
          placeholder="01012345678"
          disabled={loading}
          error={errors.phone}
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
        />

        <Field
          id="guardian_phone"
          label="رقم هاتف ولي الأمر"
          icon={ShieldCheck}
          value={guardian}
          onChange={setGuardian}
          placeholder="01098765432"
          disabled={loading}
          error={errors.guardian_phone}
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
        />

        <Field
          id="email"
          label="البريد الإلكتروني (اختياري)"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
          disabled={loading}
          error={errors.email}
          dir="ltr"
          type="email"
          autoComplete="email"
        />

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-bold">كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="pr-10 pl-10"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <motion.div whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button type="submit" className="w-full gap-2 font-bold" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ إنشاء الحساب...
              </>
            ) : (
              <>
                إنشاء الحساب
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

interface FieldProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  dir?: "ltr" | "rtl";
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}

const Field = ({
  id, label, icon: Icon, value, onChange, placeholder, disabled, error, dir, type = "text", inputMode, autoComplete,
}: FieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-bold">{label}</Label>
    <div className="relative">
      <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        id={id}
        type={type}
        dir={dir}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pr-10 ${dir === "ltr" ? "text-right" : ""}`}
        disabled={disabled}
        autoComplete={autoComplete}
      />
    </div>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default Signup;
