import { 
  Brain, 
  Zap, 
  Shield, 
  FileText, 
  MessageSquare, 
  Search,
  Clock,
  Languages,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms understand context and provide accurate answers from your documents.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get answers in seconds, not minutes. Our optimized processing ensures rapid response times.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security ensures your documents remain private and protected at all times.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FileText,
      title: 'Multi-Format Support',
      description: 'Works with all PDF types including scanned documents, forms, and complex layouts.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: 'Natural Conversations',
      description: 'Ask questions in plain English and get conversational responses that make sense.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find specific information across multiple documents with intelligent semantic search.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Clock,
      title: 'Real-time Processing',
      description: 'Upload and start querying immediately with our real-time document processing engine.',
      gradient: 'from-teal-500 to-green-500'
    },
    {
      icon: Languages,
      title: 'Multi-Language',
      description: 'Support for documents and questions in multiple languages with accurate translations.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track usage patterns and gain insights into your document analysis workflows.',
      gradient: 'from-violet-500 to-indigo-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-foreground">
            Powerful Features for Document Analysis
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to extract insights and answers from your PDF documents with cutting-edge AI technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group hover:shadow-card transition-all duration-300 border border-border/50 bg-gradient-card hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-primary rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Document Workflow?
            </h3>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who trust PDF QA Pro for their document analysis needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors shadow-lg">
                Start Free Trial
              </button>
              <button className="border border-white/20 text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;