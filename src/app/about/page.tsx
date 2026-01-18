import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { getNavCategories } from "@/lib/supabase/queries";
import { generateMetadata as generateSiteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/constants";
import { Heart, Brain, Shield, Sparkles, Award, Users, Target, Zap } from "lucide-react";

export const metadata: Metadata = generateSiteMetadata({
  title: "About Gareth Evans",
  description: "Gareth Evans is a licensed Rapid Transformational Therapy (RTT) practitioner, hypnotherapist, and trauma coach with over 20 years of military experience. Specialising in PTSD, anxiety, and trauma recovery.",
  path: "/about",
});

const services = [
  {
    icon: Brain,
    title: "Rapid Transformational Therapy",
    description: "RTT combines neuroscience with Cognitive Behavioural Therapy and hypnosis to create rapid, lasting change. Results are often experienced after just one session.",
  },
  {
    icon: Heart,
    title: "Hypnotherapy",
    description: "Professional hypnotherapy services to access your subconscious mind and reframe limiting beliefs, habits, and emotional patterns.",
  },
  {
    icon: Shield,
    title: "Trauma Coaching",
    description: "Specialised support for those dealing with PTSD, depression, anxiety, and dissociative disorders. Breaking down overwhelming thoughts into manageable steps.",
  },
  {
    icon: Sparkles,
    title: "Personal Transformation",
    description: "Helping you break free from the past and move forward with clarity, confidence, and purpose. Your journey to lasting change starts here.",
  },
];

const qualifications = [
  {
    icon: Award,
    title: "RTT Practitioner",
    description: "Certified Rapid Transformational Therapy practitioner, trained in this powerful methodology for rapid and lasting change.",
  },
  {
    icon: Award,
    title: "Licensed Hypnotherapist",
    description: "Fully qualified and licensed hypnotherapist with extensive training in therapeutic hypnosis techniques.",
  },
  {
    icon: Award,
    title: "Level 7 Diploma",
    description: "Level 7 Diploma in Specialist Welfare in Occupational Health, providing deep understanding of mental health in professional settings.",
  },
  {
    icon: Award,
    title: "Oxford University",
    description: "Currently pursuing postgraduate studies in Psychodynamics at Oxford University, continuing professional development.",
  },
];

const differentiators = [
  {
    icon: Shield,
    title: "Military Background",
    description: "Over 20 years in the British Army, including 15 years with the Royal Scots Dragoon Guards with deployments to Iraq and Afghanistan.",
  },
  {
    icon: Users,
    title: "Real Understanding",
    description: "Personal experience with PTSD and trauma recovery means genuine empathy and understanding of what you are going through.",
  },
  {
    icon: Target,
    title: "Results-Focused",
    description: "RTT delivers rapid results, often in just one session. No lengthy therapy programmes - just effective, lasting transformation.",
  },
  {
    icon: Zap,
    title: "Proven Methods",
    description: "Combining neuroscience, CBT, and hypnosis for an approach that works with your mind, not against it.",
  },
];

export default async function AboutPage() {
  const navCategories = await getNavCategories();

  return (
    <>
      <Header categories={navCategories} />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <Container className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Gareth Evans
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Rapid Transformational Therapy Practitioner, Hypnotherapist, and Trauma Coach
              dedicated to helping you overcome trauma and reclaim your life.
            </p>
          </Container>
        </section>

        {/* About Section */}
        <section className="py-16">
          <Container className="max-w-4xl">
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <h2 className="text-3xl font-bold mb-6">My Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                I spent over 20 years serving in the British Army, including 15 years with the
                Royal Scots Dragoon Guards. During that time, I completed deployments to both
                Iraq and Afghanistan. These experiences shaped who I am today, but they also
                left their mark.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Like many veterans, I was diagnosed with PTSD. I lost colleagues in combat
                operations, and I understand firsthand the weight that trauma can carry. After
                leaving active service, I spent five years with the Army Welfare Service,
                supporting others through bereavement, anxiety, couples therapy, and anger
                management.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                It was during my own recovery journey that I discovered Rapid Transformational
                Therapy. After trying various approaches, RTT proved to be the most effective
                method I encountered. The results were profound and rapid. That experience
                inspired me to train as an RTT practitioner so I could help others find the
                same relief and transformation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, my mission is clear: to help people break free from trauma, anxiety,
                and the patterns that hold them back. I believe everyone deserves to move
                forward and ask themselves &quot;what&apos;s next?&quot; rather than being trapped by the past.
              </p>
            </div>
          </Container>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-muted/30">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How I Can Help</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                I offer a range of therapeutic services designed to create rapid,
                lasting transformation in your life.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                >
                  <service.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Qualifications Section */}
        <section className="py-16">
          <Container className="max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Qualifications &amp; Training</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional certifications and ongoing education to provide you with
                the highest standard of care.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {qualifications.map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Why Choose Me Section */}
        <section className="py-16 bg-muted/30">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Work With Me</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                What sets my approach apart and why clients trust me with their transformation journey.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {differentiators.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <Container className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Transformation?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Book a free discovery call to discuss how Rapid Transformational Therapy
              can help you overcome what&apos;s holding you back and move forward with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ButtonLink href="/contact" size="lg">
                Book Free Discovery Call
              </ButtonLink>
              <ButtonLink
                href={`mailto:${siteConfig.email}`}
                variant="outline"
                size="lg"
                external
              >
                Email Me
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>
      <Footer categories={navCategories} />
    </>
  );
}
