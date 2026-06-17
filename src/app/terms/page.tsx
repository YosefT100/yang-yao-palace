import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-palace-cream px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Link href="/" className="font-serif text-2xl font-bold text-palace-red">
            YANG YAO PALACE
          </Link>
          <p className="mt-1 text-sm text-palace-dark/50">Chinese Language Academy</p>
        </div>

        <div className="card space-y-10">
          {/* Terms of Service */}
          <section>
            <h1 className="font-serif text-2xl font-bold text-palace-dark">Terms of Service</h1>
            <div className="mt-1 h-0.5 w-12 bg-palace-gold" />
            <p className="mt-4 text-sm text-palace-dark/50">Last updated: June 2026</p>

            <h2 className="mt-6 font-semibold text-palace-dark">1. Service Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              Yang Yao Palace provides online Mandarin Chinese language courses taught by native
              Chinese teachers. Courses are delivered via live video sessions in small groups or
              one-on-one, following the official HSK curriculum from HSK 1 to HSK 6.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">2. Enrollment & Payment</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              Full course fees are charged at the time of enrollment. Payment is processed securely
              via Stripe. Prices are listed in USD and are subject to change without notice for
              future enrollments.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">3. Refund Policy</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              No refunds are issued once a course has started. If a course has not yet begun,
              a full refund may be requested within 7 days of purchase by contacting us at{" "}
              <a href="mailto:contact@yangyaopalace.com" className="text-palace-red hover:underline">
                contact@yangyaopalace.com
              </a>
              .
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">4. Intellectual Property</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              All content on this site — including course materials, curriculum, videos, and design
              — is © 2026 Yang Yao Palace. All rights reserved. Unauthorized reproduction or
              distribution of any content is strictly prohibited.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">5. Governing Law</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              These Terms are governed by the laws of the State of Israel. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of Israel.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">6. Contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              For any questions regarding these Terms, please contact us at{" "}
              <a href="mailto:contact@yangyaopalace.com" className="text-palace-red hover:underline">
                contact@yangyaopalace.com
              </a>
              .
            </p>
          </section>

          <div className="border-t border-gray-100" />

          {/* Privacy Policy */}
          <section>
            <h1 id="privacy" className="font-serif text-2xl font-bold text-palace-dark">Privacy Policy</h1>
            <div className="mt-1 h-0.5 w-12 bg-palace-gold" />
            <p className="mt-4 text-sm text-palace-dark/50">Last updated: June 2026</p>

            <h2 className="mt-6 font-semibold text-palace-dark">1. Data We Collect</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              We collect your name, email address, and payment information (processed by Stripe —
              we do not store card details). We also collect usage data such as login activity and
              course progress.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">2. How We Use Your Data</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              Your data is used to manage your account, deliver course content, process payments,
              and communicate with you about your enrollment. We do not sell your data to third
              parties.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">3. Data Storage</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              Account data is stored securely via Supabase. Payment data is handled by Stripe in
              accordance with PCI-DSS standards.
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">4. GDPR</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              If you are located in the European Economic Area, you have the right to access,
              correct, or delete your personal data at any time. To exercise these rights, contact
              us at{" "}
              <a href="mailto:contact@yangyaopalace.com" className="text-palace-red hover:underline">
                contact@yangyaopalace.com
              </a>
              .
            </p>

            <h2 className="mt-6 font-semibold text-palace-dark">5. Cookies</h2>
            <p className="mt-2 text-sm leading-relaxed text-palace-dark/70">
              We use essential cookies for authentication and locale preferences. No third-party
              advertising cookies are used.
            </p>
          </section>
        </div>

        <p className="mt-8 text-center text-sm text-palace-dark/40">
          <Link href="/" className="hover:underline">← Back to homepage</Link>
        </p>
      </div>
    </main>
  );
}
