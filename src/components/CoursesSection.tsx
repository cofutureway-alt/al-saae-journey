import { BookOpen, Clock, Users, ArrowLeft, Star, Layers, Feather, BookMarked, Moon as MoonIcon, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { IslamicDivider, EightPointStar } from "@/components/IslamicPatterns";

const courses = [
  {
    title: "أحكام التجويد",
    desc: "تعلّم أحكام تلاوة القرآن الكريم من النون الساكنة والتنوين إلى المدود والوقف",
    icon: BookOpen,
    lessons: 42,
    students: 380,
    level: "مبتدئ",
    duration: "١٢ ساعة",
    color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "الفقه الإسلامي",
    desc: "دراسة أبواب الفقه من الطهارة والصلاة إلى المعاملات والأحوال الشخصية",
    icon: Layers,
    lessons: 56,
    students: 290,
    level: "متوسط",
    duration: "١٨ ساعة",
    color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "العقيدة الإسلامية",
    desc: "أصول الإيمان وأركانه، توحيد الألوهية والربوبية والأسماء والصفات",
    icon: Heart,
    lessons: 34,
    students: 420,
    level: "مبتدئ",
    duration: "١٠ ساعات",
    color: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "السيرة النبوية",
    desc: "رحلة شاملة في حياة النبي محمد صلى الله عليه وسلم من المولد إلى الوفاة",
    icon: Feather,
    lessons: 48,
    students: 350,
    level: "مبتدئ",
    duration: "١٥ ساعة",
    color: "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    title: "تفسير القرآن",
    desc: "فهم معاني آيات القرآن الكريم وأسباب النزول والأحكام المستنبطة",
    icon: BookMarked,
    lessons: 60,
    students: 310,
    level: "متقدم",
    duration: "٢٠ ساعة",
    color: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "الحديث النبوي",
    desc: "دراسة الأحاديث النبوية الشريفة وعلوم المصطلح والجرح والتعديل",
    icon: MoonIcon,
    lessons: 38,
    students: 260,
    level: "متوسط",
    duration: "١٤ ساعة",
    color: "from-cyan-500/10 to-sky-500/10 dark:from-cyan-500/20 dark:to-sky-500/20",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
];

const getLevelBadge = (level: string) => {
  const styles: Record<string, string> = {
    "مبتدئ": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    "متوسط": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    "متقدم": "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  };
  return styles[level] || "";
};

const CoursesSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="courses" className="py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Cg stroke='%23000' stroke-width='0.4'%3E%3Cpolygon points='40,10 55,17 60,33 55,48 40,55 25,48 20,33 25,17'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }} />

      {/* Corner ornaments */}
      <EightPointStar size={70} className="absolute top-12 left-12 text-primary/5 animate-spin-slow" />
      <EightPointStar size={50} className="absolute bottom-12 right-12 text-primary/5 animate-spin-slow" style={{ animationDirection: "reverse" }} />
      <EightPointStar size={30} className="absolute top-1/3 right-[5%] text-primary/5 animate-float" />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <IslamicDivider className="mb-8" />
        
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          الدورات المتاحة
        </h2>
        <p className={`text-muted-foreground text-center mb-16 max-w-lg mx-auto transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          رحلة علمية شاملة في مختلف العلوم الشرعية مع أفضل المعلمين
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <Card
              key={course.title}
              className={`group hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-default relative overflow-hidden border-0 shadow-md ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              {/* Gradient top band */}
              <div className={`h-1.5 bg-gradient-to-l ${course.color}`} />
              
              {/* Card corner ornament */}
              <div className="absolute top-4 left-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <EightPointStar size={40} className="text-primary" />
              </div>

              <CardContent className="p-6 relative z-10">
                {/* Header: Icon + Level badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${course.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <course.icon size={26} className={course.iconColor} />
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${getLevelBadge(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold mb-2 text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">{course.desc}</p>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 border-t border-border pt-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>{course.lessons} درس</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} />
                    <span>{course.students} طالب</span>
                  </div>
                </div>

                {/* Rating + CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] text-muted-foreground mr-1">4.8</span>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    سجّل الآن
                    <ArrowLeft size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View all button */}
        <div className={`text-center mt-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "900ms" }}>
          <Button size="lg" variant="outline" className="gap-2 font-bold hover:scale-105 transition-transform">
            عرض جميع الدورات
            <ArrowLeft size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
