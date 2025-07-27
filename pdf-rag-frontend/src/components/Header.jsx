import { useState } from "react";
import { Menu, X, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("access_token")
  );
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Demo", href: "#demo" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PDF QA Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground border border-border cursor-pointer">
                  AB
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    if (window.google?.accounts?.id) {
                      window.google.accounts.id.disableAutoSelect(); // THIS is crucial!
                    }
                    setIsLoggedIn(false);
                    setShowModal(false);
                  }}
                  className="ml-4 bg-red-600 text-white py-1 px-3 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Button
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  onClick={() => setShowModal(true)}
                >
                  Sign In
                </Button>
                {showModal && (
                  <AuthModal
                    mode="signup"
                    onClose={() => setShowModal(false)}
                    onLogin={() => {
                      setIsLoggedIn(true);
                      setShowModal(false);
                    }}
                    googleLoginKey={showModal ? "active" : "inactive"} // Pass a key prop
                  />
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300 w-fit">
                Sign In
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
