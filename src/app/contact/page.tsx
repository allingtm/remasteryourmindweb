import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact/contact-form";
import { JsonLd } from "@/components/seo/json-ld";
import { getNavCategories } from "@/lib/supabase/queries";
import { generateMetadata as generateSiteMetadata } from "@/lib/seo/metadata";
import { generateLocalBusinessSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/seo/constants";

export const metadata: Metadata = generateSiteMetadata({
  title: "Contact Us",
  description: "Get in touch with Solve With Software. We'd love to hear from you about software development, AI solutions, or digital transformation projects.",
  path: "/contact",
});

export default async function ContactPage() {
  const navCategories = await getNavCategories();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <JsonLd data={localBusinessSchema} id="local-business" />
      <Header categories={navCategories} />
      <main className="min-h-screen py-12">
        <Container className="max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question or want to discuss a project? We&apos;d love to hear from you.
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="md:col-span-2">
              <ContactForm />
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-primary hover:underline"
                >
                  {siteConfig.email}
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a
                  href={`tel:${siteConfig.phone.replace(/-/g, "")}`}
                  className="text-primary hover:underline"
                >
                  {siteConfig.phone}
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Follow Us</h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer categories={navCategories} />
    </>
  );
}
