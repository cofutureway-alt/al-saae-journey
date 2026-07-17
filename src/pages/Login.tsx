import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "البريد الإلكتروني غير صالح" }).max(255),
  password: z.string().min(6, { message: "كلمة المرور يجب ألا تقل عن 6 أحرف" }).max(72),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const params = new URLSearchParams(location.search);
  const redirectParam = params.get("redirect");
  const from = redirectParam ?? (location.state as { from?: string } | null)?.from ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0] as keyof typeof errors;
        fieldErrors[key] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        toast.error("بيانات الدخول غير صحيحة");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("تم تسجيل الدخول بنجاح");
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="أهلاً بعودتك إلى منصة الساعي"
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="text-primary font-bold hover:underline">
            أنشئ حساباً جديداً
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-bold">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="pr-10 text-right"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-bold">كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10 pl-10"
              disabled={loading}
              autoComplete="current-password"
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
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                تسجيل الدخول
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

export default Login;
