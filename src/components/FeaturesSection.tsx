import { BookOpen, ClipboardCheck, Users, Video, Award, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const features = [
  { icon: Video, title: "دروس مباشرة", desc: "حضور دروس مباشرة مع المعلم والتفاعل المستمر" },
  { icon: ClipboardCheck, title: "اختبارات تفاعلية", desc: "اختبارات دورية لقياس مستوى الفهم والاستيعاب" },
  { icon: Users, title: "متابعة مستمرة", desc: "متابعة فردية لكل طالب لضمان التقدم المستمر" },
  { icon: BookOpen, title: "مناهج متنوعة", desc: "مناهج شرعية متعددة تغطي مختلف العلوم" },
  { icon: Award, title: "شهادات إتمام", desc: "شهادات معتمدة عند إتمام كل مستوى بنجاح" },
  { icon: Clock, title: "مرونة في الوقت", desc: "إمكانية مراجعة الدروس المسجلة في أي وقت" },
];

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          مميزات المنصة
        </h2>
        <p className={`text-muted-foreground text-center mb-16 max-w-lg mx-auto transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          نوفر لك بيئة تعليمية متكاملة بأفضل الأدوات والوسائل
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-default ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <f.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
