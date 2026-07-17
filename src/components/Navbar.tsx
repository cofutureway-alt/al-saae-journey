import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X, LogOut, User as UserIcon, LogIn, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const links = [
    { label: "الرئيسية", href: "/" },
    { label: "المميزات", href: "/#features" },
    { label: "الدورات", href: "/courses" },
    { label: "المتصدرين", href: "/#leaderboard" },
  ];


  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/");
    setOpen(false);
  };

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("") || user?.email?.[0]?.toUpperCase() || "؟";

  const AuthArea = () => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-secondary transition-colors p-1 pl-3">
              <Avatar className="w-9 h-9 border border-border">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-semibold max-w-[120px] truncate">
                {profile?.full_name || "حسابي"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-normal">
              <div className="font-bold">{profile?.full_name || "مستخدم"}</div>
              <div className="text-muted-foreground truncate">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profile?.role === "admin" ? (
              <DropdownMenuItem onClick={() => { navigate("/admin"); setOpen(false); }} className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                لوحة الإدارة
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => { navigate("/dashboard"); setOpen(false); }} className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                لوحتي
              </DropdownMenuItem>
            )}
            <DropdownMenuItem disabled className="gap-2">
              <UserIcon className="w-4 h-4" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="ghost" size="sm" className="gap-1 font-bold">
            <LogIn className="w-4 h-4" />
            دخول
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm" className="font-bold">
            إنشاء حساب
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="شعار الساعي" className="h-14 w-14 rounded-lg object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <AuthArea />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {user && (
            <Avatar className="w-8 h-8 border border-border">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="w-10 h-10 border border-border">
                        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{profile?.full_name || "مستخدم"}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full gap-2">
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full gap-2 font-bold">
                        <LogIn className="w-4 h-4" />
                        تسجيل الدخول
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full font-bold">
                        إنشاء حساب
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
