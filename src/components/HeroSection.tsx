import { useRef } from "react";
import type { Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EightPointStar } from "@/components/IslamicPatterns";
import instructorHero from "@/assets/instructor-hero.jpg.asset.json";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", prefersReduced ? "0%" : "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, prefersReduced ? 1 : 1.05]);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.12, delayChildren: 0.05 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden"
    >
      {/* Subtle Islamic geometric background — matches site language */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Cg stroke='%23000' stroke-width='0.5'%3E%3Cpolygon points='40,10 55,17 60,33 55,48 40,55 25,48 20,33 25,17'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <EightPointStar
        size={44}
        className="absolute top-32 left-[6%] text-primary/10 hidden md:block"
      />
      <EightPointStar
        size={28}
        className="absolute bottom-24 right-[8%] text-primary/10 hidden md:block"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
          {/* Text content — right side in RTL (starts on desktop) */}
          <motion.div
            className="lg:col-span-6 order-2 lg:order-1 text-center lg:text-right"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <GraduationCap size={16} className="text-primary" />
              <span className="text-xs font-bold text-primary">منصة الساعي التعليمية</span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] text-foreground"
            >
              رحلتك في العلم
              <br />
              <span className="text-primary">تبدأ من هنا</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              دروس منظّمة، متابعة مستمرة، واختبارات تفاعلية تقيس تقدّمك خطوة بخطوة — كل ما تحتاجه للتفوّق في مكان واحد.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-3 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="gap-2 text-base font-bold px-8">
                <Link to="/courses">
                  تصفح الكورسات
                  <ArrowLeft size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base font-bold">
                <Link to="/signup">إنشاء حساب</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Instructor image — full asset, unmodified */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
            <motion.div
              className="relative w-full max-w-[420px] lg:max-w-[520px] aspect-square"
              initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: imageY, scale: imageScale }}
            >
              {/* Decorative frame accent using platform primary */}
              <div className="absolute -inset-3 rounded-[2rem] border border-primary/20 hidden md:block" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-primary/30 rounded-2xl hidden md:block" />

              <div className="relative w-full h-full rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-border">
                <img
                  src={instructorHero.url}
                  alt="منصة الساعي - المعلّم"
                  className="w-full h-full object-contain bg-background"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
