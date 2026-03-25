export const metadata = {
  title: "Terms of Service — Sykli",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: March 25, 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>
          By using Sykli ("the Service"), operated by Kivat Tapahtumat Oy, you
          agree to these Terms. If you don't agree, don't use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">2. What Sykli Does</h2>
        <p>
          Sykli is a social media management tool that lets you schedule and
          publish posts to connected Facebook Pages and Instagram accounts via
          Meta's official APIs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">3. Your Account</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be 18 or older to use Sykli.</li>
          <li>You are responsible for keeping your credentials secure.</li>
          <li>
            You are responsible for all activity that occurs under your account.
          </li>
          <li>One person, one account. Do not share accounts.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">4. Acceptable Use</h2>
        <p>You agree not to use Sykli to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Publish spam, misleading content, or illegal material.</li>
          <li>
            Violate Meta's Platform Terms or Community Standards.
          </li>
          <li>Attempt to reverse-engineer, scrape, or abuse the Service.</li>
          <li>
            Use the Service in a way that could damage, disable, or impair it.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">5. Your Content</h2>
        <p>
          You own the content you create. By using Sykli you grant us a limited
          license to store and transmit your content solely to provide the
          Service (i.e., publishing to your connected accounts). We do not
          claim ownership of your content.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          6. Third-Party Services (Meta)
        </h2>
        <p>
          Sykli uses Meta's API to publish content. Your use of connected
          Facebook and Instagram accounts is also governed by Meta's own Terms
          of Service and Platform Policies. We are not responsible for changes
          Meta makes to its API or policies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          7. Availability and Uptime
        </h2>
        <p>
          We aim to keep the Service available but make no uptime guarantees.
          Scheduled posts may fail due to API outages, network issues, or
          changes in Meta's platform. We are not liable for missed or failed
          publications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          8. Limitation of Liability
        </h2>
        <p>
          To the maximum extent permitted by law, Kivat Tapahtumat Oy is not
          liable for any indirect, incidental, or consequential damages arising
          from your use of (or inability to use) the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">9. Termination</h2>
        <p>
          We may suspend or terminate accounts that violate these Terms. You
          may delete your account at any time by contacting us at{" "}
          <a href="mailto:nabil@niceevents.fi" className="underline">
            nabil@niceevents.fi
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">10. Governing Law</h2>
        <p>
          These Terms are governed by Finnish law. Disputes shall be resolved
          in the courts of Helsinki, Finland.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">11. Contact</h2>
        <p>
          Kivat Tapahtumat Oy
          <br />
          Svanströminkuja 7 A 12, 00870 Helsinki, Finland
          <br />
          <a href="mailto:nabil@niceevents.fi" className="underline">
            nabil@niceevents.fi
          </a>
        </p>
      </section>
    </main>
  );
}
