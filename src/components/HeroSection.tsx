import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
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

        {/* Teacher Image with geometric elements */}
        <div className="flex-1 flex justify-center relative opacity-0 animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Rotating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow" />
            {/* Counter-rotating ring */}
            <div className="absolute -inset-4 rounded-full border border-primary/15 animate-spin-reverse" />
            {/* Floating dots */}
            <div className="absolute top-4 -right-6 w-4 h-4 rounded-full bg-primary/40 animate-float" />
            <div className="absolute bottom-8 -left-8 w-3 h-3 rounded-full bg-primary/30 animate-bounce-soft" />
            <div className="absolute top-1/2 -right-10 w-2 h-2 rounded-full bg-primary/50 animate-pulse-soft" />
            {/* Diamond shapes */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 border border-primary/30 animate-float" style={{ animationDelay: "1s" }} />
            <div className="absolute -bottom-2 left-1/4 w-4 h-4 rotate-45 border border-primary/20 animate-bounce-soft" style={{ animationDelay: "0.5s" }} />
            {/* Octagon outline */}
            <svg className="absolute -inset-8 w-[calc(100%+4rem)] h-[calc(100%+4rem)] animate-spin-slow" style={{ animationDuration: "30s" }} viewBox="0 0 200 200" fill="none">
              <polygon points="100,5 145,20 175,55 185,100 175,145 145,180 100,195 55,180 25,145 15,100 25,55 55,20" stroke="hsl(var(--primary))" strokeOpacity="0.12" strokeWidth="1" />
            </svg>
            {/* Teacher image */}
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
