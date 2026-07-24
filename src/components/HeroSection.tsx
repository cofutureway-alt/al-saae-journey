import { ArrowLeft, BookOpen, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EightPointStar, CrescentStar } from "@/components/IslamicPatterns";

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Islamic geometric background pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Cg stroke='%23000' stroke-width='0.5'%3E%3Cpolygon points='40,10 55,17 60,33 55,48 40,55 25,48 20,33 25,17'/%3E%3Cline x1='40' y1='0' x2='40' y2='10'/%3E%3Cline x1='40' y1='55' x2='40' y2='80'/%3E%3Cline x1='0' y1='33' x2='20' y2='33'/%3E%3Cline x1='60' y1='33' x2='80' y2='33'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }} />

      {/* Floating Islamic ornaments - scattered across hero */}
      <EightPointStar size={55} className="absolute top-28 left-[8%] text-primary/8 animate-float" />
      <EightPointStar size={35} className="absolute top-[60%] left-[3%] text-primary/6 animate-bounce-soft" />
      <CrescentStar size={40} className="absolute top-24 right-[6%] text-primary/8 animate-float" style={{ animationDelay: "1.5s" }} />
      <EightPointStar size={25} className="absolute bottom-28 right-[10%] text-primary/6 animate-pulse-soft" />
      <div className="absolute top-[45%] left-[15%] w-3 h-3 rotate-45 border border-primary/15 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[30%] right-[15%] w-2 h-2 rotate-45 border border-primary/10 animate-bounce-soft" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-6 relative z-10">
        {/* Text content */}
        <div className="flex-1 text-center lg:text-right space-y-8">
          {/* Badge */}
          <div className="opacity-0 animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <BookOpen size={16} className="text-primary" />
            <span className="text-xs font-bold text-primary">منصة تعليمية متكاملة</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.2] text-foreground opacity-0 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            الساعي لشرح
            <br />
            <span className="text-primary">العلوم الشرعية</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 opacity-0 animate-fade-up leading-relaxed" style={{ animationDelay: "0.3s" }}>
            تعلّم العلوم الشرعية بأسلوب عصري مبسّط، مع متابعة مستمرة واختبارات تفاعلية لقياس تقدّمك خطوة بخطوة
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start opacity-0 animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <Button size="lg" className="gap-2 text-base font-bold hover:scale-105 transition-transform px-8">
              ابدأ رحلتك
              <ArrowLeft size={18} />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base font-bold hover:scale-105 transition-transform">
              تعرّف علينا
            </Button>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-6 justify-center lg:justify-start pt-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">+١٢٠٠</div>
                <div className="text-[10px] text-muted-foreground">طالب</div>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">+٣٤٠</div>
                <div className="text-[10px] text-muted-foreground">درس</div>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-foreground">+٨٩٠</div>
                <div className="text-[10px] text-muted-foreground">شهادة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Image - redesigned with Islamic frame */}
        <div className="flex-1 flex justify-center relative opacity-0 animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            {/* Outer rotating Islamic octagon frame */}
            <svg className="absolute -inset-12 w-[calc(100%+6rem)] h-[calc(100%+6rem)] animate-spin-slow" style={{ animationDuration: "40s" }} viewBox="0 0 300 300" fill="none">
              <polygon points="150,10 210,35 265,90 290,150 265,210 210,265 150,290 90,265 35,210 10,150 35,90 90,35" stroke="hsl(var(--primary))" strokeOpacity="0.12" strokeWidth="1" />
              {/* Corner star ornaments */}
              <g transform="translate(150,10)" opacity="0.2"><polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="hsl(var(--primary))" /></g>
              <g transform="translate(290,150)" opacity="0.2"><polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="hsl(var(--primary))" /></g>
              <g transform="translate(150,290)" opacity="0.2"><polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="hsl(var(--primary))" /></g>
              <g transform="translate(10,150)" opacity="0.2"><polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="hsl(var(--primary))" /></g>
            </svg>

            {/* Inner counter-rotating frame */}
            <svg className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] animate-spin-reverse" style={{ animationDuration: "35s" }} viewBox="0 0 200 200" fill="none">
              <polygon points="100,8 142,22 178,58 192,100 178,142 142,178 100,192 58,178 22,142 8,100 22,58 58,22" stroke="hsl(var(--primary))" strokeOpacity="0.08" strokeWidth="0.8" strokeDasharray="8 4" />
            </svg>

            {/* Floating ornaments around image */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <EightPointStar size={24} className="text-primary/30 animate-float" />
            </div>
            <div className="absolute -bottom-4 left-1/4 z-20">
              <CrescentStar size={20} className="text-primary/25 animate-bounce-soft" style={{ animationDelay: "0.8s" }} />
            </div>
            <div className="absolute top-1/4 -right-8 z-20">
              <EightPointStar size={18} className="text-primary/20 animate-float" style={{ animationDelay: "1.5s" }} />
            </div>
            <div className="absolute top-1/3 -left-6 z-20">
              <CrescentStar size={16} className="text-primary/20 animate-pulse-soft" />
            </div>
            <div className="absolute bottom-1/4 -right-5 w-3 h-3 rounded-full bg-primary/20 animate-float z-20" style={{ animationDelay: "2s" }} />
            <div className="absolute top-1/2 -left-8 w-2 h-2 rounded-full bg-primary/15 animate-bounce-soft z-20" style={{ animationDelay: "0.5s" }} />

            {/* Islamic arch frame behind image */}
            <div className="relative w-72 h-80 md:w-80 md:h-[22rem]">
              {/* Arch SVG behind */}
              <svg className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] z-0" viewBox="0 0 200 240" fill="none">
                <path d="M10 240 L10 80 Q10 10 100 10 Q190 10 190 80 L190 240" stroke="hsl(var(--primary))" strokeOpacity="0.15" strokeWidth="1.5" />
                <path d="M25 240 L25 85 Q25 25 100 25 Q175 25 175 85 L175 240" stroke="hsl(var(--primary))" strokeOpacity="0.08" strokeWidth="0.8" />
                {/* Keystone ornament */}
                <g transform="translate(100,12)" opacity="0.2">
                  <polygon points="0,-8 3,-3 8,0 3,3 0,8 -3,3 -8,0 -3,-3" fill="hsl(var(--primary))" />
                </g>
              </svg>

              {/* Teacher image */}
              <div className="relative z-10 w-full h-full rounded-t-[50%] rounded-b-2xl overflow-hidden border-2 border-primary/15 shadow-2xl">
                <img
                  src="/teacher.png"
                  alt="المعلم عبدالرحمن علي"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Islamic divider wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 40" fill="none" className="w-full text-secondary/30" preserveAspectRatio="none">
          <path d="M0 40 Q150 0 300 20 Q450 40 600 20 Q750 0 900 20 Q1050 40 1200 20 L1200 40 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
