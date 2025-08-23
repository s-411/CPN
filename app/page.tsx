import { Calculator, Chart, Trophy, Sparkles, Ban, Users, Star, Play } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0E1013] text-[#E9EEF5] overflow-x-hidden">
      {/* Decorative Spotlights */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[600px] h-[400px] opacity-16"
          style={{
            background: 'radial-gradient(600px 400px at 75% 10%, rgba(216,255,85,0.16) 0%, rgba(255,210,106,0.10) 30%, rgba(0,0,0,0) 70%)'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] opacity-12"
          style={{
            background: 'radial-gradient(700px 420px at 50% 50%, rgba(216,255,85,0.12) 0%, rgba(0,0,0,0) 70%)'
          }}
        />
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[700px] h-[420px] opacity-10"
          style={{
            background: 'radial-gradient(700px 420px at 50% 20%, rgba(255,210,106,0.10) 0%, rgba(0,0,0,0) 70%)'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 h-16 backdrop-blur-md bg-[#0E1013]/80 border-b border-white/6">
        <div className="max-w-[1120px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D8FF55] to-[#FFD26A] flex items-center justify-center">
              <span className="text-[#0E1013] text-sm font-extrabold">CPN</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-[#A9B4C2] hover:text-[#E9EEF5] transition-colors">Features</a>
            <a href="#faq" className="text-[#A9B4C2] hover:text-[#E9EEF5] transition-colors">FAQ</a>
            <a 
              href="#cta-top" 
              className="px-6 py-3 bg-gradient-to-r from-[#D8FF55] to-[#FFD26A] text-[#0E1013] font-semibold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#D8FF55]/20 to-[#FFD26A]/20 rounded-full border border-[#D8FF55]/30">
                <span className="text-[#D8FF55] text-sm font-medium tracking-[0.14em] uppercase">CPN</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Cost per Nut
                </h1>
                <div className="text-lg lg:text-xl text-[#A9B4C2] space-y-2">
                  <p>Track how much each girl costs you to bust a nut.</p>
                  <p>Simple. Savage. Data-driven.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#cta-top"
                  className="px-8 py-4 bg-gradient-to-r from-[#D8FF55] to-[#FFD26A] text-[#0E1013] font-semibold rounded-full hover:scale-105 transition-transform shadow-lg text-center"
                >
                  Get Early Access
                </a>
                <a 
                  href="#demo"
                  className="px-8 py-4 bg-transparent border border-white/12 text-[#E9EEF5] rounded-full hover:bg-white/5 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Watch Demo
                </a>
              </div>
            </div>
            
            {/* Media */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#15181E] to-[#1B2027] rounded-[22px] p-6 shadow-2xl border border-white/6">
                <div className="aspect-[19.5/9] bg-gradient-to-br from-[#D8FF55]/10 to-[#FFD26A]/10 rounded-[18px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D8FF55]/5 to-transparent" />
                  <Play size={48} className="text-[#D8FF55] opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "It straightened me out. I finally know my CPN.", author: "Chris M.", meta: "Serial dater" },
              { quote: "CPN put my ego on a $/nut curve. Game changer.", author: "Riley T.", meta: "Wingman of the Year" },
              { quote: "I spend less and close more. The data doesn't lie.", author: "Anon", meta: "Quiet assassin" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#15181E]/50 backdrop-blur-sm rounded-[18px] p-6 border border-white/6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#FFD766] text-[#FFD766]" />
                  ))}
                </div>
                <p className="text-[#E9EEF5] mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-[#E9EEF5]">{testimonial.author}</p>
                  <p className="text-sm text-[#A9B4C2]">{testimonial.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Lead */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Discover Your CPN</h2>
          <p className="text-lg text-[#A9B4C2] mb-2">
            Calculate your cost-per-nut efficiency across your entire dating history or dial it in per girl.
          </p>
          <p className="text-sm text-[#A9B4C2]">All data stays on your device by default.</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                title: "Girl Management System",
                text: "Add girls with notes and tags. Track status (dating, FWB, situationship), key dates, and private fields. One-tap updates during a date with discreet mode."
              },
              {
                icon: Calculator,
                title: "Auto Calculations",
                text: "CPN tallies everything: dates, drinks, dinners, gifts, rideshares, travel, subscriptions, and time value. Handles currencies and splits automatically."
              },
              {
                icon: Chart,
                title: "Visual Analytics",
                text: "Beautiful dashboards with trend lines, leaderboards, and cost-to-close ratios. Filter by time, location, and girl. Export to CSV."
              },
              {
                icon: Trophy,
                title: "Compete With Your Wingmen",
                text: "Create private leaderboards to benchmark your CPN. Share anonymized stats with your group chat."
              },
              {
                icon: Sparkles,
                title: "Flex Your Success",
                text: "Generate tasteful share cards that showcase milestones without revealing identities. Pixelated faces & redactions by default."
              },
              {
                icon: Ban,
                title: "End Simping",
                text: "Set budgets and hard limits. Get nudges when you're about to blow your CPN with low-ROI moves."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-[#15181E]/50 backdrop-blur-sm rounded-[18px] p-8 border border-white/6 hover:border-[#D8FF55]/30 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#D8FF55]/20 to-[#FFD26A]/20 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon size={24} className="text-[#D8FF55]" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#E9EEF5]">{feature.title}</h3>
                <p className="text-[#A9B4C2] leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Top */}
      <section id="cta-top" className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="relative">
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 rounded-[22px] opacity-60"
              style={{
                background: 'radial-gradient(60% 60% at 50% 50%, rgba(216,255,85,0.18) 0%, rgba(255,210,106,0.10) 45%, rgba(0,0,0,0) 100%)'
              }}
            />
            
            <div className="relative bg-gradient-to-br from-[#15181E]/80 to-[#1B2027]/80 backdrop-blur-xl rounded-[22px] p-12 border border-white/10 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">Discover Your CPN</h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 text-left max-w-4xl mx-auto">
                {[
                  "Private by default",
                  "Fast one-tap logging",
                  "Auto currency handling",
                  "Wingman leaderboards",
                  "Serious analytics with zero fluff"
                ].map((bullet, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#D8FF55] rounded-full flex-shrink-0" />
                    <span className="text-sm text-[#E9EEF5]">{bullet}</span>
                  </div>
                ))}
              </div>
              
              <a 
                href="/sign-up"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#D8FF55] to-[#FFD26A] text-[#0E1013] font-semibold rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                Get Early Access
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mid Testimonials */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { quote: "I was hemorrhaging 💸. CPN flipped a switch—dates now have ROI.", author: "Marcus V.", meta: "Finance bro" },
              { quote: "Three months in: my CPN dropped 60%. Data > delusion.", author: "J.", meta: "Anonymous" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#15181E]/50 backdrop-blur-sm rounded-[18px] p-8 border border-white/6">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#FFD766] text-[#FFD766]" />
                  ))}
                </div>
                <p className="text-lg text-[#E9EEF5] mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-[#E9EEF5]">{testimonial.author}</p>
                  <p className="text-sm text-[#A9B4C2]">{testimonial.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">FAQ</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "What is Cost per Nut (CPN)?",
                a: "A simple metric: total spend divided by total successful outcomes. The app helps log costs and time so you see reality, not vibes."
              },
              {
                q: "Why should I track this?",
                a: "To stop overspending, optimize your dating strategy, and benchmark your results with friends—privately and objectively."
              },
              {
                q: "How is CPN calculated?",
                a: "CPN = (Money costs + optional time value) ÷ confirmed closes. You can include or exclude categories and set your hourly rate."
              },
              {
                q: "Is this creepy or unsafe?",
                a: "Data is private on your device unless you choose to sync. We never store names or identifying info in share cards."
              },
              {
                q: "Is CPN only about dates?",
                a: "No. Use it for relationships, situationships, or any long-term scenario—configure categories however you like."
              },
              {
                q: "Do I track gifts and trips?",
                a: "Yes—toggle categories like gifts, travel, rideshares, subscriptions, and more. The app rolls it all into your CPN."
              }
            ].map((faq, index) => (
              <details key={index} className="group bg-[#15181E]/50 backdrop-blur-sm rounded-[18px] border border-white/6">
                <summary className="p-6 cursor-pointer flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#E9EEF5] pr-4">{faq.q}</h3>
                  <div className="text-[#D8FF55] text-2xl group-open:rotate-45 transition-transform">+</div>
                </summary>
                <div className="px-6 pb-6 text-[#A9B4C2] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div 
            className="rounded-[22px] p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(216,255,85,0.10) 0%, rgba(255,210,106,0.10) 100%)'
            }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Discover Your CPN</h2>
            <p className="text-lg text-[#A9B4C2] mb-8">
              Calculate your real-world efficiency with ruthless accuracy. No fluff. No cope.
            </p>
            <a 
              href="/sign-up"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#D8FF55] to-[#FFD26A] text-[#0E1013] font-semibold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/6">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D8FF55] to-[#FFD26A] flex items-center justify-center">
              <span className="text-[#0E1013] text-sm font-extrabold">CPN</span>
            </div>
            <span className="text-sm text-[#A9B4C2]">© 2025 CPN. All rights reserved.</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[#A9B4C2] hover:text-[#E9EEF5] transition-colors">Privacy</a>
            <a href="#" className="text-sm text-[#A9B4C2] hover:text-[#E9EEF5] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}