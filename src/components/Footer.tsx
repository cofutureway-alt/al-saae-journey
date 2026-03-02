import { IslamicDivider, EightPointStar } from "@/components/IslamicPatterns";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border relative overflow-hidden">
      {/* Subtle corner ornament */}
      <EightPointStar size={80} className="absolute -bottom-6 -left-6 text-primary/[0.03]" />
      <EightPointStar size={60} className="absolute -top-4 -right-4 text-primary/[0.03]" />

      <div className="container mx-auto px-4 relative z-10">
        <IslamicDivider className="mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center">
              <img src="/logo.png" alt="الساعي" className="h-14 w-14 rounded-lg object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">منصة تعليمية متكاملة لشرح العلوم الشرعية</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm">روابط سريعة</h4>
            <div className="flex flex-col gap-2">
              <a href="#hero" className="text-sm text-muted-foreground hover:text-foreground transition-colors">الرئيسية</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">المميزات</a>
              <a href="#leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">المتصدرين</a>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm">تواصل معنا</h4>
            <div className="flex items-center gap-4">
              <a
                href="https://www.youtube.com/@elsa3i"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
              <a
                href="https://www.facebook.com/Elsa3i.shr3i"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="https://t.me/elsa3i"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Telegram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          جميع الحقوق محفوظة لمنصة الساعي {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
