import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LandingCTA from '@/components/LandingCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiAwaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              No credit card required · 14-day free trial
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Online booking that{' '}
              <span className="text-indigo-300">just works</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl leading-relaxed">
              Give your business a beautiful booking page in minutes. Customers book 24/7,
              you get notified instantly, and no-shows become a thing of the past.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <LandingCTA variant="hero" />
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-6 text-sm text-indigo-200">
              Then just $9/month. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="bg-gray-50 border-y border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          {['Hair Salons', 'Consultants', 'Tutors', 'Therapists', 'Personal Trainers', 'Photographers'].map((biz) => (
            <span key={biz} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {biz}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow your bookings
            </h2>
            <p className="text-lg text-gray-500">
              No more phone tag or back-and-forth emails. Let customers book while you sleep.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔗',
                title: 'Your own booking link',
                desc: 'Get a professional booking page at simple-g.com/yourbusiness — share it anywhere in seconds.',
              },
              {
                icon: '📅',
                title: 'Smart scheduling',
                desc: 'Set your working hours and available services. Simple-G handles the rest — no double bookings, ever.',
              },
              {
                icon: '📧',
                title: 'Automatic emails',
                desc: 'You and your customer both get instant email confirmations. Cancellations are handled automatically too.',
              },
              {
                icon: '📱',
                title: 'Works on any device',
                desc: 'Your booking page looks perfect on phones, tablets, and desktops — no app required for customers.',
              },
              {
                icon: '🗂️',
                title: 'Simple dashboard',
                desc: 'See all upcoming appointments at a glance. Cancel or reschedule in one click.',
              },
              {
                icon: '⚡',
                title: 'Set up in 5 minutes',
                desc: "Add your services, set your hours, and you're live. No technical knowledge needed.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Up and running in minutes</h2>
            <p className="text-lg text-gray-500">Three simple steps and your booking page is live.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Create your account',
                desc: 'Sign up with your email and set up your business profile in under 2 minutes.',
              },
              {
                step: '2',
                title: 'Add your services & hours',
                desc: "List what you offer, how long each takes, and when you're available.",
              },
              {
                step: '3',
                title: 'Share your link',
                desc: 'Paste your booking link in your Instagram bio, website, or just text it to customers.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, honest pricing</h2>
            <p className="text-lg text-gray-500">One plan. Everything included. No surprises.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most popular
              </div>
              <div className="mb-6">
                <p className="text-indigo-200 text-sm font-medium mb-2">Pro Plan</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-6xl font-bold">$9</span>
                  <span className="text-indigo-200 mb-2">/month</span>
                </div>
                <p className="text-indigo-200 text-sm mt-2">Start with a 14-day free trial</p>
              </div>

              <ul className="space-y-3 mb-8 text-left">
                {[
                  'Unlimited bookings',
                  'Your own booking page URL',
                  'Email notifications',
                  'Unlimited services',
                  'Working hours control',
                  'Booking management dashboard',
                  'Customer cancellation emails',
                  'Cancel anytime',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-indigo-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <LandingCTA variant="pricing" />
              <p className="text-indigo-200 text-xs mt-3">No credit card required to start</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to stop playing phone tag?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of small businesses that use Simple-G to fill their calendars effortlessly.
          </p>
          <LandingCTA variant="bottom" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-semibold">Simple-G</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Simple-G. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-gray-300 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
