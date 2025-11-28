import React from 'react';
import { BookOpen, Users, GraduationCap, TrendingUp, MessageCircle, Award, CheckCircle, Star, ArrowRight, Play, Clock, MapPin, Shield, ShoppingBag, Compass, FileText, Sparkles, Zap, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-900" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Edusiastic</span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#discover" className="text-gray-700 hover:text-blue-900 font-medium transition">Discover</a>
              <a href="#library" className="text-gray-700 hover:text-blue-900 font-medium transition">Library</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-900 font-medium transition">How It Works</a>
              <a href="#teachers" className="text-gray-700 hover:text-blue-900 font-medium transition">For Teachers</a>
              <a href="#blog" className="text-gray-700 hover:text-blue-900 font-medium transition">Blog</a>
            </div>

              <div className="flex items-center space-x-3">
  <a href="/login">
    <button className="px-6 py-2 text-blue-900 font-semibold hover:bg-blue-50 rounded-lg transition">
      Login
    </button>
  </a>
  <a href="/register">
    <button className="px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105">
      Get Started
    </button>
  </a>
</div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full animate-pulse">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-800">Africa's Leading Educational Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
              Connect with Expert Teachers,
              <br />
              <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-yellow-600 bg-clip-text text-transparent mt-2 block">
                Learn Without Limits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of African students learning from verified teachers through online classes, home tutoring, and premium educational resources.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button className="group px-10 py-5 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2 text-lg">
                <span>Start Learning Free</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </button>
              <button className="group px-10 py-5 bg-white border-2 border-yellow-600 text-yellow-700 font-bold rounded-xl shadow-lg hover:bg-yellow-50 transition flex items-center space-x-2 text-lg">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-1">15K+</div>
                <div className="text-sm text-gray-600 font-medium">Active Students</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent mb-1">800+</div>
                <div className="text-sm text-gray-600 font-medium">Expert Teachers</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-1">12</div>
                <div className="text-sm text-gray-600 font-medium">African Countries</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition transform hover:scale-105">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent mb-1">99%</div>
                <div className="text-sm text-gray-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section id="discover" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-blue-50 rounded-full">
              <Compass className="h-5 w-5 text-blue-900" />
              <span className="text-sm font-semibold text-blue-900">Discover Section</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Knowledge That Matches Your Interests
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read insightful posts from expert teachers, discover new perspectives, and connect with educators who share your passion for learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {[
              {
                category: "Mathematics",
                title: "Mastering Calculus: Tips from Top African Educators",
                author: "Dr. Chukwu Emmanuel",
                image: "📐",
                readTime: "5 min read",
                likes: 234
              },
              {
                category: "Science",
                title: "Chemistry Experiments You Can Do at Home",
                author: "Prof. Amina Bakare",
                image: "🧪",
                readTime: "8 min read",
                likes: 189
              },
              {
                category: "Literature",
                title: "Understanding African Literature: A Modern Perspective",
                author: "Dr. Kwame Osei",
                image: "📚",
                readTime: "6 min read",
                likes: 312
              }
            ].map((post, index) => (
              <div key={index} className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-blue-900 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-yellow-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-yellow-600 mb-2 uppercase tracking-wide">{post.category}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-900 transition">{post.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{post.author}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{post.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-500">
                      <Heart className="h-4 w-4 fill-red-500" />
                      <span className="text-sm font-semibold">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              Explore All Posts
            </button>
          </div>
        </div>
      </section>

      {/* Library Section */}
      <section id="library" className="py-24 bg-gradient-to-br from-yellow-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-yellow-50 rounded-full">
              <ShoppingBag className="h-5 w-5 text-yellow-700" />
              <span className="text-sm font-semibold text-yellow-700">Digital Library</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Premium Learning Resources at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse and purchase high-quality study materials, textbooks, past questions, and exclusive content created by expert teachers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {[
              {
                title: "WAEC Past Questions (2010-2024)",
                author: "Edusiastic Team",
                price: "₦2,500",
                rating: 4.9,
                sales: 1234,
                type: "PDF Bundle"
              },
              {
                title: "Advanced Physics Notes for JAMB",
                author: "Dr. Okonkwo",
                price: "₦1,800",
                rating: 4.8,
                sales: 892,
                type: "Study Guide"
              },
              {
                title: "Complete Mathematics Workbook",
                author: "Prof. Mensah",
                price: "₦3,200",
                rating: 5.0,
                sales: 2156,
                type: "eBook"
              },
              {
                title: "English Language Mastery Course",
                author: "Mrs. Adeyemi",
                price: "₦2,000",
                rating: 4.7,
                sales: 756,
                type: "Video Course"
              }
            ].map((product, index) => (
              <div key={index} className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-yellow-600 hover:shadow-2xl transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="h-20 w-20 text-white/20 absolute" />
                  <div className="text-white text-center z-10">
                    <div className="text-sm font-bold mb-1 bg-yellow-600 px-3 py-1 rounded-full inline-block">{product.type}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-900 transition line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">by {product.author}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.sales})</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">{product.price}</div>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              Browse Full Library
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Learning Journey in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-600">Simple, fast, and designed for your success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: "1",
                title: "Create Your Free Account",
                description: "Sign up in 30 seconds as a student, parent, or teacher. No credit card required to get started!",
                icon: Users,
                color: "from-blue-900 to-blue-700"
              },
              {
                number: "2",
                title: "Discover & Connect",
                description: "Browse thousands of verified teachers, explore the library, read posts, and find your perfect learning match.",
                icon: Compass,
                color: "from-yellow-600 to-yellow-500"
              },
              {
                number: "3",
                title: "Start Your Success Story",
                description: "Subscribe to classes, purchase premium resources, chat with teachers, and achieve your academic dreams!",
                icon: Zap,
                color: "from-blue-900 to-blue-700"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition border-2 border-gray-100 hover:border-blue-900">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg`}>
                    {step.number}
                  </div>
                  <step.icon className="h-12 w-12 text-yellow-600 mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-blue-900 to-yellow-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-blue-50 rounded-full">
              <FileText className="h-5 w-5 text-blue-900" />
              <span className="text-sm font-semibold text-blue-900">Latest from Our Blog</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Insights, Tips & Educational Trends
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest in African education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "The Future of Online Learning in Africa: Trends for 2025",
                excerpt: "Discover how technology is reshaping education across the African continent...",
                date: "Oct 12, 2024",
                category: "Trends",
                readTime: "10 min"
              },
              {
                title: "5 Study Techniques That Actually Work for WAEC Success",
                excerpt: "Evidence-based strategies to boost your exam performance and retain information...",
                date: "Oct 10, 2024",
                category: "Study Tips",
                readTime: "7 min"
              },
              {
                title: "How to Choose the Right Teacher for Your Learning Style",
                excerpt: "A comprehensive guide to finding educators who match your unique needs...",
                date: "Oct 8, 2024",
                category: "Guide",
                readTime: "6 min"
              }
            ].map((post, index) => (
              <div key={index} className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-blue-900 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="h-56 bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white text-blue-900 px-3 py-1 rounded-full text-xs font-bold">{post.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-900 transition">{post.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <button className="text-blue-900 font-bold flex items-center space-x-2 group-hover:translate-x-2 transition">
                    <span>Read More</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
              View All Articles
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Success Stories from Across Africa
            </h2>
            <p className="text-xl text-gray-600">Real students, real results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Chioma Adeleke",
                location: "Lagos, Nigeria",
                role: "WAEC Graduate",
                text: "Edusiastic transformed my grades from C's to straight A's! The teachers are patient, knowledgeable, and truly care about my success.",
                rating: 5,
                avatar: "CA"
              },
              {
                name: "Kwame Mensah",
                location: "Accra, Ghana",
                role: "University Student",
                text: "The library section is a goldmine! I found all my past questions and study materials in one place. Saved me so much money!",
                rating: 5,
                avatar: "KM"
              },
              {
                name: "Amina Hassan",
                location: "Nairobi, Kenya",
                role: "Parent",
                text: "As a parent, I love tracking my daughter's progress. The platform is secure, transparent, and the teachers are exceptional!",
                rating: 5,
                avatar: "AH"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition hover:border-blue-900">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Join over 15,000 African students already achieving their dreams with expert teachers
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-12 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-yellow-500/50 transition transform hover:scale-105 text-lg">
              Start Learning Free
            </button>
            <button className="px-12 py-5 bg-white text-blue-900 font-bold rounded-xl shadow-xl hover:bg-gray-50 transition text-lg">
              Explore Library
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <GraduationCap className="h-8 w-8 text-yellow-500" />
                <span className="text-2xl font-bold text-white">Edusiastic</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Empowering African students through technology-driven education. Connect with expert teachers, access premium resources, and unlock your full potential.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition cursor-pointer">
                  <span className="text-white text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition cursor-pointer">
                  <span className="text-white text-sm">𝕏</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition cursor-pointer">
                  <span className="text-white text-sm">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#discover" className="hover:text-white transition">Discover</a></li>
                <li><a href="#library" className="hover:text-white transition">Library</a></li>
                <li><a href="#" className="hover:text-white transition">Find Teachers</a></li>
                <li><a href="#" className="hover:text-white transition">Online Classes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">For Teachers</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition">Become a Teacher</a></li>
                <li><a href="#" className="hover:text-white transition">Teacher Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition">Upload Resources</a></li>
                <li><a href="#" className="hover:text-white transition">Earnings</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3">
                <li><a href="#blog" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-center md:text-left mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Edusiastic. All rights reserved. Made with ❤️ in Nigeria by RDI Hub
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}