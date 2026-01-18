import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getNavCategories } from "@/lib/supabase/queries";
import { generateMetadata as generateSiteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/constants";

export const metadata: Metadata = generateSiteMetadata({
  title: "Cookie Policy",
  description:
    "Learn about how Solve With Software Ltd uses cookies and similar technologies on our website, and how you can manage your preferences.",
  path: "/cookie-policy",
});

export default async function CookiePolicyPage() {
  const navCategories = await getNavCategories();

  return (
    <>
      <Header categories={navCategories} />
      <main className="min-h-screen py-16 md:py-24">
        <Container className="max-w-4xl">
          <article className="prose prose-lg dark:prose-invert mx-auto">
            <h1>Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: 27 December 2025</p>

            <p>
              This Cookie Policy explains how we use cookies and similar technologies on
              our website. By using our site, you agree to the use of cookies as
              described in this policy.
            </p>

            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile
              device when you visit our website. They allow us to recognize your device
              and remember certain information about your visit. Cookies are widely used
              to make websites work more efficiently and provide a better user
              experience.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              We use cookies for several purposes to improve your experience on our
              website:
            </p>

            <h3>Essential Cookies</h3>
            <p className="text-sm font-medium text-primary">Required</p>
            <p>
              These cookies are necessary for the website to function properly. They
              enable basic features like user authentication and security features.
            </p>
            <p>
              <strong>Examples:</strong>
            </p>
            <ul>
              <li>Session cookies for user authentication</li>
              <li>Security cookies to prevent fraud</li>
              <li>Cookie consent preference storage</li>
            </ul>
            <p>
              <strong>Duration:</strong> Session cookies or up to 1 year
            </p>

            <h3>Functionality Cookies</h3>
            <p>
              These cookies allow us to remember choices you make when you use our
              website, such as your login details, language preferences, or other
              customization options.
            </p>
            <p>
              <strong>Examples:</strong>
            </p>
            <ul>
              <li>Remembering your login status</li>
              <li>Saving your preferences and settings</li>
              <li>Remembering items in your application form</li>
            </ul>
            <p>
              <strong>Duration:</strong> Up to 1 year
            </p>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by
              collecting anonymous information about usage patterns.
            </p>
            <p>
              <strong>Examples:</strong>
            </p>
            <ul>
              <li>Page view tracking</li>
              <li>Page visit statistics</li>
              <li>User interaction analytics</li>
            </ul>
            <p>
              <strong>Duration:</strong> Up to 2 years
            </p>

            <h2>Third-Party Cookies</h2>
            <p>
              Our website uses services from trusted third parties that may set their
              own cookies when you visit our site.
            </p>

            <h3>Google Fonts</h3>
            <p>
              We use Google Fonts to display custom fonts on our website. Google may set
              cookies to optimize font delivery.
            </p>
            <ul>
              <li>
                <strong>Purpose:</strong> Font optimization
              </li>
              <li>
                <strong>Privacy Policy:</strong>{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>

            <h3>Google ReCAPTCHA v3</h3>
            <p className="text-sm font-medium text-primary">Required</p>
            <p>
              We use Google ReCAPTCHA v3 to protect our forms from spam and abuse.
              Google sets cookies to analyze user behavior.
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              <strong>Cannot be disabled:</strong> ReCAPTCHA cookies are essential for
              form security and spam protection.
            </p>
            <ul>
              <li>
                <strong>Category:</strong> Essential (required)
              </li>
              <li>
                <strong>Privacy Policy:</strong>{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>

            <p className="text-muted-foreground italic">
              Note: We do not currently use Google Analytics, Facebook Pixel, or other
              tracking services.
            </p>

            <h2>Your Cookie Choices</h2>
            <p>You have control over how we use cookies on our website:</p>

            <h3>Cookie Consent Banner</h3>
            <p>
              When you first visit our site, you&apos;ll see a cookie consent banner where
              you can choose to accept all cookies, reject non-essential cookies, or
              customize your preferences.
            </p>

            <h3>Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings.
              Note that disabling cookies may affect your experience on our website.
            </p>

            <h2>Cookie Retention</h2>
            <p>Different types of cookies are stored for different periods:</p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Stored for 1-2 years
              </li>
              <li>
                <strong>Consent Cookies:</strong> Remembered for 12 months
              </li>
            </ul>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. When we make
              significant changes, we will notify you by updating the &quot;Last updated&quot;
              date at the top of this policy.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Cookie Policy, please contact us:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              <li>
                Phone: <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
              </li>
              <li>
                Website:{" "}
                <a href="https://remasteryourmind.co.uk">remasteryourmind.co.uk</a>
              </li>
            </ul>
            <p>
              For more information about how we handle your personal data, please see
              our <Link href="/privacy">Privacy Policy</Link>. For our full terms of
              service, please see our <Link href="/terms">Terms & Conditions</Link>.
            </p>
          </article>
        </Container>
      </main>
      <Footer categories={navCategories} />
    </>
  );
}
