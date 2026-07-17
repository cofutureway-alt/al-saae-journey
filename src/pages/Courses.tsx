import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoursesSection from "@/components/CoursesSection";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">الدورات</h1>
          <p className="text-muted-foreground mt-2">
            استكشف جميع الدورات المتاحة على المنصة.
          </p>
        </div>
        <CoursesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
