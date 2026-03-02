import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IslamicPattern, EightPointStar, CrescentStar } from "@/components/IslamicPatterns";

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Islamic pattern background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Cg stroke='currentColor' stroke-width='0.5'%3E%3Cpolygon points='40,10 55,17 60,33 55,48 40,55 25,48 20,33 25,17'/%3E%3Cline x1='0' y1='0' x2='25' y2='17'/%3E%3Cline x1='80' y1='0' x2='55' y2='17'/%3E%3Cline x1='0' y1='80' x2='25' y2='48'/%3E%3Cline x1='80' y1='80' x2='55' y2='48'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }} />

      {/* Floating Islamic ornaments */}
      <EightPointStar size={50} className="absolute top-24 left-[10%] text-primary/10 animate-float" />
      <EightPointStar size={30} className="absolute bottom-32 left-[5%] text-primary/8 animate-bounce-soft" />
      <CrescentStar size={45} className="absolute top-32 right-[8%] text-primary/10 animate-float" style={{ animationDelay: "1.5s" }} />
      <EightPointStar size={25} className="absolute bottom-20 right-[12%] text-primary/8 animate-pulse-soft" />

      <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
        {/* Text */}
        <div className="flex-1 text-center lg:text-right space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground opacity-0 animate-fade-up">
            الساعي لشرح العلوم الشرعية
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            منصة تعليمية متكاملة لتعلّم العلوم الشرعية بأسلوب عصري، مع متابعة مستمرة واختبارات تفاعلية لقياس مستواك
          </p>
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" className="gap-2 text-base font-bold hover:scale-105 transition-transform">
              ابدأ الآن
              <ArrowLeft size={18} />
            </Button>
          </div>
        </div>

        {/* Teacher Image with Islamic geometric elements */}
        <div className="flex-1 flex justify-center relative opacity-0 animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Rotating Islamic octagon ring */}
            <svg className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] animate-spin-slow" viewBox="0 0 200 200" fill="none">
              <polygon points="100,8 142,22 178,58 192,100 178,142 142,178 100,192 58,178 22,142 8,100 22,58 58,22" stroke="hsl(var(--primary))" strokeOpacity="0.15" strokeWidth="1" />
            </svg>
            {/* Counter-rotating octagon */}
            <svg className="absolute -inset-10 w-[calc(100%+5rem)] h-[calc(100%+5rem)] animate-spin-reverse" style={{ animationDuration: "30s" }} viewBox="0 0 200 200" fill="none">
              <polygon points="100,5 145,20 175,55 195,100 175,145 145,180 100,195 55,180 25,145 5,100 25,55 55,20" stroke="hsl(var(--primary))" strokeOpacity="0.1" strokeWidth="0.8" />
            </svg>
            {/* Rotating eight-pointed star frame */}
            <div className="absolute -inset-4 animate-spin-slow" style={{ animationDuration: "35s" }}>
              <EightPointStar size={undefined} className="w-full h-full text-primary/10" />
            </div>
            {/* Floating Islamic ornaments around the image */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: "0.5s" }}>
              <EightPointStar size={20} className="text-primary/30" />
            </div>
            <div className="absolute -bottom-4 left-1/4 animate-bounce-soft" style={{ animationDelay: "1s" }}>
              <CrescentStar size={22} className="text-primary/25" />
            </div>
            <div className="absolute top-1/4 -right-8 animate-float" style={{ animationDelay: "2s" }}>
              <EightPointStar size={16} className="text-primary/20" />
            </div>
            <div className="absolute top-1/3 -left-8 animate-pulse-soft">
              <CrescentStar size={18} className="text-primary/20" />
            </div>
            {/* Floating dots */}
            <div className="absolute top-4 -right-6 w-3 h-3 rounded-full bg-primary/30 animate-float" />
            <div className="absolute bottom-8 -left-6 w-2 h-2 rounded-full bg-primary/20 animate-bounce-soft" />
            {/* Diamond shapes */}
            <div className="absolute -top-2 right-1/4 w-4 h-4 rotate-45 border border-primary/25 animate-float" style={{ animationDelay: "1s" }} />
            {/* Teacher image with Islamic arch-shaped border */}
            <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
              <img src="/teacher.png" alt="المعلم عبدالرحمن علي" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
