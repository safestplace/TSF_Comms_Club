import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import {
  Users,
  Award,
  Calendar,
  TrendingUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Globe,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-900">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      {/* Header */}
      <header className="relative z-50 container mx-auto px-6 py-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-4 group">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 p-1 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="TSF Comms Club Logo"
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">TSF Comms Club</span>
              <div className="text-sm text-blue-300 font-medium">Excellence in Communication</div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="text-white/80 hover:text-white transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            Transforming Communication Skills
          </div>

          <h1 className="text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-tight">
            Welcome to the
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Future of Yourself
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            A revolutionary communication skill development platform designed for college students. 
            Master the art of effective communication with our comprehensive member management, 
            meeting coordination, and certification system.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link href="/register" className="group">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                Join as Member
                <Users className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/register" className="group">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                Create a Club
                <Star className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-slate-400">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-slate-400">Clubs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-slate-400">Certificates Issued</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">99%</div>
              <div className="text-slate-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Powerful Features</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to build and manage your communication skills journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Member Management",
                description: "Advanced member tracking with multi-level progression system and role-based permissions.",
                gradient: "from-blue-500 to-cyan-500",
                delay: "0"
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Intelligent meeting coordination with role assignments and automated reminders.",
                gradient: "from-purple-500 to-pink-500",
                delay: "100"
              },
              {
                icon: Award,
                title: "Achievement System",
                description: "4-level progression system with automated certificate generation and recognition.",
                gradient: "from-orange-500 to-red-500",
                delay: "200"
              },
              {
                icon: TrendingUp,
                title: "Live Leaderboards",
                description: "Gamified engagement with real-time rankings and performance analytics.",
                gradient: "from-green-500 to-emerald-500",
                delay: "300"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative h-full flex flex-col"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                     style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:border-white/20 flex-1 flex flex-col">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 lg:p-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">How It Works</h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Your journey to communication excellence in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {[
                {
                  title: "Register & Join",
                  description: "Create your account and request to join existing clubs or create your own. Our intelligent matching system helps you find the perfect community.",
                  icon: Users
                },
                {
                  title: "Participate & Grow",
                  description: "Attend meetings, request leadership roles, complete challenging tasks, and progress through our comprehensive 4-level advancement system.",
                  icon: Zap
                },
                {
                  title: "Achieve & Excel",
                  description: "Get achievements approved by mentors, download professional certificates, and build an impressive portfolio of communication skills.",
                  icon: Award
                }
              ].map((step, index) => (
                <div key={index} className="text-center group relative">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    
                    {/* Progress Arrow (between steps, except after last one) */}
                    {index < 2 && (
                      <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">What Students Say</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of students who have transformed their communication skills
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Computer Science Major",
                content: "TSF Comms Club completely transformed my public speaking abilities. The structured approach and supportive community made all the difference.",
                rating: 5
              },
              {
                name: "Marcus Johnson",
                role: "Business Administration", 
                content: "The meeting coordination features are incredible. I've organized 50+ events and every single one ran smoothly thanks to this platform.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Psychology Student",
                content: "Earning my certificates through this platform has been a game-changer for my resume. Employers love seeing my communication achievements.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Have questions about TSF Comms Club? Our team is here to help you succeed.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none backdrop-blur-sm"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    Send Message
                    <MessageSquare className="w-4 h-4 ml-2" />
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: MessageSquare,
                        title: "Email",
                        value: "hello@tsfcommsclub.com",
                        description: "Send us an email anytime"
                      },
                      {
                        icon: MessageSquare,
                        title: "Phone",
                        value: "+1 (555) 123-4567",
                        description: "Call us during business hours"
                      },
                      {
                        icon: Globe,
                        title: "Address",
                        value: "123 Communication Ave\nCollege Campus, ST 12345",
                        description: "Visit our campus office"
                      }
                    ].map((contact, index) => (
                      <div key={index} className="flex items-start space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <contact.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{contact.title}</p>
                          <p className="text-blue-300 font-medium whitespace-pre-line">{contact.value}</p>
                          <p className="text-slate-400 text-sm">{contact.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-2xl border border-white/10">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Office Hours
                  </h4>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="text-blue-300">9:00 AM - 6:00 PM</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="text-blue-300">10:00 AM - 4:00 PM</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="text-red-300">Closed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            {/* Social Media Icons */}
            <div className="flex justify-center space-x-6 mb-8">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-slate-400 text-lg">
              &copy; 2025 TSF Comms Club. Empowering communication skills for the next generation.
            </p>
            <div className="mt-4 flex justify-center space-x-8 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
