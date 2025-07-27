import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import VideoSection from '../components/VideoSection';
import FeaturesSection from '../components/FeaturesSection';
import FeedbackForm from '../components/FeedbackForm';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <VideoSection />
        <FeaturesSection />
        <FeedbackForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;