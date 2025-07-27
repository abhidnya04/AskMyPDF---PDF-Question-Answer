import { Play, Pause, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-foreground">
            See PDF QA Pro in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how easy it is to upload a PDF and start getting answers to your questions instantly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Video Container */}
            <div className="relative bg-gradient-card rounded-2xl shadow-card overflow-hidden border border-border">
              {/* Video Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-12 h-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="border-r border-foreground last:border-r-0"></div>
                    ))}
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 shadow-glow scale-110 group-hover:scale-125 transition-all duration-300"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>

                {/* Demo UI Elements */}
                <div className="absolute top-4 left-4 bg-white/90 rounded-lg px-3 py-2 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Live Demo</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg px-3 py-2 shadow-md">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm font-medium">3:42</span>
                  </div>
                </div>
              </div>

              {/* Video Controls (when playing) */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <div className="flex items-center space-x-4 text-white">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(false)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 bg-white/20 rounded-full h-1">
                      <div className="bg-primary h-1 rounded-full w-1/3 transition-all duration-300"></div>
                    </div>
                    <span className="text-sm">3:42</span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
              ✨ New Feature
            </div>
          </div>

          {/* Video Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-semibold">Upload Any PDF</h3>
              <p className="text-sm text-muted-foreground">Support for all PDF formats and sizes</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">❓</span>
              </div>
              <h3 className="font-semibold">Ask Questions</h3>
              <p className="text-sm text-muted-foreground">Natural language questioning interface</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold">Instant Answers</h3>
              <p className="text-sm text-muted-foreground">AI-powered responses in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;