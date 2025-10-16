import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="py-20">
      {/* Hero */}
      <Card className="border-0 shadow-sm max-w-5xl mx-auto">
        <CardContent className="p-12">
          <div className="text-center">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              We take your privacy seriously. Our privacy policy explains how we collect, use, and protect your information when using Business Symbiosis.
            </p>
            <p className="text-sm text-gray-500">Effective date: January 1, 2025</p>
          </div>
        </CardContent>
      </Card>

      {/* Policy Body */}
      <Card className="border-gray-200 max-w-5xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">1. Scope</h2>
            <p>
              This Privacy Policy describes how Business Symbiosis (the "Company", "we", "our") collects, uses, discloses, and safeguards personal information when you access or use our website, applications, and related services (collectively, the "Service").
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">2. Data Controller & Contact</h2>
            <p>
              Business Symbiosis is the data controller for personal information processed under this Policy. Contact us at privacy@businesssymbiosis.com or via the Contact page for questions or requests.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">3. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Account Information: name, business details, email, authentication data, and preferences you provide when creating or managing an account.
              </li>
              <li>
                Communications: messages, support requests, and content you submit through forms or the Service.
              </li>
              <li>
                Usage & Device Data: IP address, device identifiers, browser type, pages viewed, referring pages, and interaction patterns collected via cookies, logs, and similar technologies.
              </li>
              <li>
                Transaction Data: limited payment details processed by our payment providers (we do not store full card numbers).
              </li>
              <li>
                Partner Content: information shared or uploaded within partnerships (subject to applicable agreements).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">4. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, maintain, and improve the Service.</li>
              <li>Facilitate discovery, evaluation, and execution of partnerships.</li>
              <li>Communicate about updates, security alerts, and administrative messages.</li>
              <li>Personalize experiences and content recommendations.</li>
              <li>Monitor performance, troubleshoot, and conduct analytics.</li>
              <li>Detect, prevent, and respond to fraud, abuse, and security incidents.</li>
              <li>Comply with legal obligations and enforce our Terms.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">5. Legal Bases for Processing (EEA/UK)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contract: processing to provide the Service you request.</li>
              <li>Consent: where required (e.g., certain cookies, marketing communications).</li>
              <li>Legitimate Interests: to secure, improve, and market the Service in a proportionate manner.</li>
              <li>Legal Obligation: compliance with applicable laws and requests from authorities.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">6. Cookies & Tracking</h2>
            <p>
              We use cookies, web beacons, and similar technologies to authenticate users, remember preferences, analyze traffic, and improve features. You can manage cookies in your browser settings; disabling certain cookies may affect functionality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">7. Analytics & Marketing</h2>
            <p>
              We may use analytics tools to understand usage and improve the Service. We do not sell personal information. Where required, we obtain consent for targeted marketing and provide opt‑out mechanisms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">8. Sharing of Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Service Providers: hosting, analytics, email, customer support, and payment processing under contractual safeguards.</li>
              <li>Partners: information shared within the Service to enable collaboration, consistent with your settings and agreements.</li>
              <li>Legal & Safety: to comply with law, enforce policies, or protect rights, property, or safety.</li>
              <li>Business Transfers: in connection with mergers, acquisitions, financings, or asset sales.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">9. International Transfers</h2>
            <p>
              If we transfer personal information outside your country, we use appropriate safeguards such as Standard Contractual Clauses and technical measures to protect the data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">10. Data Retention</h2>
            <p>
              We retain personal information only as long as necessary for the purposes described herein, to comply with legal obligations, resolve disputes, and enforce agreements. Retention periods vary by data type and context.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">11. Security</h2>
            <p>
              We implement administrative, technical, and physical safeguards designed to protect personal information. No method of transmission or storage is completely secure; we strive to continuously improve our protections.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">12. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access, correction, deletion, and portability of your information, subject to legal limits.</li>
              <li>Restriction or objection to certain processing, including for direct marketing.</li>
              <li>Withdrawal of consent where processing is based on consent.</li>
              <li>EEA/UK: lodge a complaint with your local supervisory authority.</li>
              <li>US (where applicable): rights to know, delete, correct, and opt‑out of certain sharing under state privacy laws; we do not discriminate for exercising these rights.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">13. Children’s Privacy</h2>
            <p>
              The Service is not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child provided information, contact us to delete it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">14. Do Not Track</h2>
            <p>
              We currently do not respond to browser "Do Not Track" signals. You can manage cookies and tracking preferences through your browser and device settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">15. Changes to This Policy</h2>
            <p>
              We may update this Policy to reflect changes in our practices or legal requirements. Material changes will be announced via the Service or email. Continued use after the effective date means you accept the updated Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">16. Contact Us</h2>
            <p>
              For privacy inquiries or requests, contact privacy@businesssymbiosis.com or use the Contact page.
            </p>
          </section>

          <div className="flex gap-4 justify-center pt-4">
            <Button asChild>
              <Link to="/signup">Accept & Sign Up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
