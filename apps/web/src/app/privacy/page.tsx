export const metadata = {
  title: "Privacy Policy — Sykli",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: March 25, 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. Who We Are</h2>
        <p>
          Sykli is a social media management tool operated by Kivat Tapahtumat
          Oy (business ID: FI35175193), Helsinki, Finland. You can reach us at{" "}
          <a href="mailto:nabil@niceevents.fi" className="underline">
            nabil@niceevents.fi
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">2. What Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Account data:</strong> your email address and password
            (hashed) when you register.
          </li>
          <li>
            <strong>Social account tokens:</strong> OAuth access tokens for
            Facebook and Instagram pages you connect. These are stored securely
            and used only to publish content on your behalf.
          </li>
          <li>
            <strong>Content you create:</strong> post drafts, scheduled posts,
            and uploaded media files.
          </li>
          <li>
            <strong>Usage data:</strong> basic logs (timestamps, error traces)
            for debugging purposes.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">3. How We Use Your Data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To authenticate you and keep your session secure.</li>
          <li>
            To publish posts to Facebook and Instagram on your behalf, at the
            times you schedule.
          </li>
          <li>To display analytics pulled from your connected accounts.</li>
          <li>To troubleshoot errors and improve the service.</li>
        </ul>
        <p className="mt-3">
          We do not sell your data. We do not use your content to train AI
          models. We do not share your data with third parties except as
          required by Meta's API (i.e., the content you explicitly choose to
          publish).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          4. Meta Platform Data
        </h2>
        <p>
          When you connect a Facebook Page or Instagram account, we receive
          OAuth tokens from Meta. We use these tokens solely to read page
          information and publish content you create in Sykli. We do not access
          your personal Facebook profile, friends list, messages, or any data
          beyond what is needed for publishing.
        </p>
        <p className="mt-2">
          You can revoke access at any time via Facebook's App Settings:{" "}
          <a
            href="https://www.facebook.com/settings?tab=applications"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            facebook.com/settings → Apps and Websites
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">5. Data Retention</h2>
        <p>
          We keep your data for as long as your account is active. If you
          delete your account, all associated data (tokens, posts, media) is
          permanently deleted within 30 days. To delete your account, email{" "}
          <a href="mailto:nabil@niceevents.fi" className="underline">
            nabil@niceevents.fi
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">6. Security</h2>
        <p>
          OAuth tokens are stored encrypted. Passwords are hashed using
          industry-standard algorithms. We use HTTPS everywhere.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">7. Your Rights (GDPR)</h2>
        <p>
          As an EU resident you have the right to access, correct, or delete
          your personal data. Contact us at{" "}
          <a href="mailto:nabil@niceevents.fi" className="underline">
            nabil@niceevents.fi
          </a>{" "}
          and we will respond within 30 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">8. Changes to This Policy</h2>
        <p>
          We may update this policy. If changes are material, we will notify
          you by email. Continued use of Sykli after changes means you accept
          the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
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
