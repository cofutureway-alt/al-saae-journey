const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="الساعي" className="h-8 w-8 rounded-lg object-contain" />
              <span className="font-bold text-lg">الساعي</span>
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
            <p className="text-sm text-muted-foreground">البريد: info@alsaei.com</p>
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
