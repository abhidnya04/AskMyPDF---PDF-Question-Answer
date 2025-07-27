import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroImage from '@/assets/hero-image.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const HeroSection = () => {

  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setIsLoggedIn(true);
  }, []);

    // New function to handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowModal(false);
    navigate("/pdf-qa"); // redirect after login
  };

  return (
    
    <section id="home" className="pt-24 pb-12 bg-gradient-hero min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Ask Questions,
                <br />
                <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                  Get Answers
                </span>
                <br />
                From Any PDF
              </h1>
              <p className="text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
                Transform your document analysis with AI-powered question answering. 
                Upload any PDF and get instant, accurate answers to your questions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
            <Button
  size="lg"
  className="bg-white text-primary hover:bg-white/90 shadow-elegant group"
  onClick={() => {
    const token = localStorage.getItem("access_token");
if (token) {
  navigate("/pdf-qa");
} else {
  setShowModal(true);
}

  }}
>
  Get Started Free
  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
</Button>

              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-primary hover:bg-white/10 group"
              >
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-primary-foreground/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm">Enterprise Ready</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl opacity-20 scale-105"></div>
              <img 
                src={heroImage} 
                alt="PDF QA Interface Demo" 
                className="relative rounded-2xl shadow-glow border border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
      
      {showModal && (
        <AuthModal
          mode="login"
          onClose={() => setShowModal(false)}
          onLogin={handleLoginSuccess}  // Pass onLogin here!
          googleLoginKey={Math.random()} // optional: force GoogleLogin remount
        />
      )}
    </section>
  );
};

export default HeroSection;