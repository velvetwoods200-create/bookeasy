import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Simple-G' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-indigo-300 hover:text-white text-sm mb-6 inline-block">← Back to Simple-G</Link>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-indigo-200 mt-3">Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose prose-gray max-w-none">

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">By creating an account and using Simple-G (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. These terms apply to all users, including business owners who create booking pages and their customers.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">Simple-G is an online appointment booking platform that allows small businesses to create a booking page, manage their services and availability, and receive appointment bookings from their customers. The Service is provided on a subscription basis.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">3. Account Terms</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>You must be at least 18 years old to create an account.</li>
            <li>You must provide accurate and complete information when registering.</li>
            <li>You are responsible for maintaining the security of your account password.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must notify us immediately of any unauthorised use of your account.</li>
            <li>One person or entity may not maintain more than one free account.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">4. Free Trial</h2>
          <p className="text-gray-600 leading-relaxed">New accounts receive a 14-day free trial with full access to all features. No credit card is required to start your trial. At the end of the trial period, your booking page will be paused until you subscribe. We reserve the right to modify the trial period at any time.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">5. Payments and Billing</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>The Service costs <strong>$9 USD per month</strong> after the free trial ends.</li>
            <li>Billing is processed securely through Stripe. We do not store your payment card details.</li>
            <li>Subscriptions renew automatically each month unless cancelled.</li>
            <li>You may cancel your subscription at any time. Your access will continue until the end of the current billing period.</li>
            <li>All prices are in US dollars and are subject to change with 30 days notice.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">6. Refund Policy</h2>
          <p className="text-gray-600 leading-relaxed">We offer a <strong>7-day money-back guarantee</strong> from the date of your first payment. If you are not satisfied, contact us within 7 days for a full refund. After 7 days, payments are non-refundable. Refunds are processed within 5–10 business days.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">7. Acceptable Use</h2>
          <p className="text-gray-600 leading-relaxed mb-3">You agree not to use Simple-G to:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Engage in any illegal activity or solicit others to perform illegal acts.</li>
            <li>Harass, abuse, or harm another person.</li>
            <li>Send spam or unsolicited communications to your customers.</li>
            <li>Impersonate any person or entity.</li>
            <li>Transmit any viruses, malware, or other malicious code.</li>
            <li>Attempt to gain unauthorised access to any part of the Service.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">8. Your Content</h2>
          <p className="text-gray-600 leading-relaxed">You retain ownership of all content you submit to Simple-G (business name, services, customer data). By using the Service, you grant us a limited licence to use this content solely to provide and improve the Service. You are responsible for ensuring you have the right to use and share any content you submit.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">9. Termination</h2>
          <p className="text-gray-600 leading-relaxed">We may suspend or terminate your account at any time if we believe you have violated these terms. You may delete your account at any time by contacting us. Upon termination, your data will be permanently deleted within 30 days.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">Simple-G is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim. Some jurisdictions do not allow these limitations, so they may not apply to you.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">We may update these terms from time to time. We will notify you by email at least 14 days before significant changes take effect. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">12. Contact</h2>
          <p className="text-gray-600 leading-relaxed">Questions about these terms? Contact us at <a href="mailto:support@simple-g.com" className="text-indigo-600 hover:underline">support@simple-g.com</a>.</p>
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
