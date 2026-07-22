import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FeaturedCoursesSection from "@/components/FeaturedCoursesSection";
import CoursesSection from "@/components/CoursesSection";
import BundlesSection from "@/components/BundlesSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <FeaturedCoursesSection />
      <CoursesSection />
      <BundlesSection />
      <LeaderboardSection />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default Index;
