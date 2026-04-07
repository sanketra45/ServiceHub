import React from "react";
import { Sparkles, Users, Target, ShieldCheck, Zap } from "lucide-react";

export default function AboutUs() {
  const stats = [
    { label: "Happy Customers", value: "10,000+" },
    { label: "Verified Professionals", value: "2,500+" },
    { label: "Cities Covered", value: "15+" },
    { label: "Average Rating", value: "4.8/5" },
  ];

  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "We believe in empowering local professionals and connecting them with people who need reliable services.",
    },
    {
      icon: ShieldCheck,
      title: "Trust & Safety",
      description: "Every professional on our platform is thoroughly vetted to ensure peace of mind for our customers.",
    },
    {
      icon: Target,
      title: "Quality Guaranteed",
      description: "We stand behind the work of our professionals, ensuring top-tier service delivery every time.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-12 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent dark:from-primary-500/5 rounded-3xl -z-10" />
        
        <div className="text-center py-20 px-4 md:px-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold text-sm mb-6 shadow-sm border border-primary-100 dark:border-primary-800/30">
            <Sparkles size={16} />
            <span>Redefining Home Services</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8">
            Built for you.<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Powered by community.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            ServiceHub bridges the gap between skilled professionals and homeowners.
            We're on a mission to make finding reliable help as easy as ordering your favorite coffee.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto -mt-8 mb-20 relative z-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Our Story
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We started ServiceHub with a simple observation: finding trustworthy local professionals was too hard, and talented service providers struggled to find consistent work.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Today, we're proud to support a growing ecosystem of independent workers while giving homeowners the easiest way to book household services. We combine innovative technology with human touch.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-primary-300 rounded-3xl transform rotate-3 scale-105 opacity-20 dark:opacity-30 blur-lg" />
            <div className="relative bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 aspect-square md:aspect-[4/3] flex flex-col justify-center items-center text-center border border-slate-200 dark:border-slate-700 overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542361345-89e58247f2d5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-slate-900/50 group-hover:bg-slate-900/40 transition-colors duration-700" />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-6xl mx-auto pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">This is what drives us forward every single day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                  <val.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{val.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center relative overflow-hidden mb-12">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-b from-primary-500 to-transparent blur-3xl transform rotate-12" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <Zap className="w-12 h-12 text-primary-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to experience the difference?</h2>
              <p className="text-slate-300 text-lg mb-8">Join thousands of customers who have already found their trusted local professionals.</p>
              <button onClick={() => window.location.href = '/browse'} className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-1">
                Browse Services Now
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
