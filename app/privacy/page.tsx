import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Simple-G' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-indigo-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-indigo-300 hover:text-white text-sm mb-6 inline-block">← Back to Simple-G</Link>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-indigo-200 mt-3">Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">Simple-G (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the appointment booking platform at simple-g.com. This Privacy Policy explains how we collect, use, and protect your information.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Information you provide:</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
            <li><strong>Account information:</strong> Your name, email address, and password when you register.</li>
            <li><strong>Business information:</strong> Your business name and chosen booking page URL.</li>
            <li><strong>Services & availability:</strong> The services and working hours you configure.</li>
            <li><strong>Customer booking data:</strong> Names, email addresses, and phone numbers of customers who book appointments through your page.</li>
          </ul>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Information collected automatically:</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Server logs including IP address and browser type when you access the Service.</li>
            <li>Subscription and billing status (managed through Stripe).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To provide and operate the booking platform.</li>
            <li>To send booking confirmation and cancellation emails to you and your customers.</li>
            <li>To process payments and manage your subscription.</li>
            <li>To send service-related communications (account updates, important notices).</li>
            <li>To improve and maintain the Service.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">We do not sell your data or your customers&apos; data to third parties. We do not use your data for advertising.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Stripe</h3>
              <p className="text-gray-600 text-sm">We use Stripe to process subscription payments. When you subscribe, your payment card details are handled entirely by Stripe — we never see or store them. Stripe&apos;s privacy policy is available at <a href="https://stripe.com/privacy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Resend</h3>
              <p className="text-gray-600 text-sm">We use Resend to send transactional emails (booking confirmations, cancellations, password resets). Email addresses are shared with Resend solely for delivery purposes. Resend&apos;s privacy policy is at <a href="https://resend.com/privacy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">resend.com/privacy</a>.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">Vercel & Neon</h3>
              <p className="text-gray-600 text-sm">Our platform is hosted on Vercel and our database runs on Neon (PostgreSQL). Your data is stored in the United States.</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">We retain your account data for as long as your account is active. If you delete your account, we will permanently delete your data within 30 days. Booking records may be retained for up to 90 days after deletion for legal and accounting purposes.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">6. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">We use a single session cookie to keep you logged in. This cookie is strictly necessary for the Service to function and does not track you across other websites. We do not use advertising or analytics cookies.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Access</strong> the personal data we hold about you.</li>
            <li><strong>Correct</strong> inaccurate data via your Settings page.</li>
            <li><strong>Delete</strong> your account and associated data by contacting us.</li>
            <li><strong>Export</strong> your booking data by contacting us.</li>
            <li><strong>Object</strong> to processing — though this may prevent us from providing the Service.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">8. Security</h2>
          <p className="text-gray-600 leading-relaxed">We take reasonable measures to protect your data, including encrypted connections (HTTPS), hashed passwords, and access controls. No system is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-600 leading-relaxed">Simple-G is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us personal information, please contact us and we will delete it.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you by email of significant changes at least 14 days before they take effect.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contact</h2>
          <p className="text-gray-600 leading-relaxed">Questions or requests regarding your data? Contact us at <a href="mailto:support@simple-g.com" className="text-indigo-600 hover:underline">support@simple-g.com</a>.</p>
        </section>
      </div>

      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-gray-400 flex gap-6 justify-center">
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/" className="hover:text-gray-600">Home</Link>
        </div>
      </footer>
    </div>
  );
}
