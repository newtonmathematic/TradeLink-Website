import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="py-20">
      {/* Hero */}
      <Card className="border-0 shadow-sm max-w-5xl mx-auto">
        <CardContent className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Our comprehensive terms of service that govern the use of the Business Symbiosis platform. These terms ensure fair and secure partnerships for all users.
            </p>
            <p className="text-sm text-gray-500">Effective date: January 1, 2025</p>
          </div>
        </CardContent>
      </Card>

      {/* Terms body */}
      <Card className="border-gray-200 max-w-5xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Agreement Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Business Symbiosis (the "Service"), you agree to be bound by these Terms & Conditions (the "Terms"). If you do not agree, do not use the Service. If you use the Service on behalf of an organization, you represent that you have authority to bind that organization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least 18 years old and legally able to enter into contracts.</li>
              <li>Use of the Service must comply with applicable laws and regulations in your jurisdiction.</li>
              <li>We may refuse, suspend, or terminate accounts that do not meet eligibility criteria.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">3. Account Registration & Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate, current, and complete information during registration and keep it updated.</li>
              <li>You are responsible for safeguarding credentials and all activity under your account.</li>
              <li>Notify us immediately of any unauthorized access or suspected security breach.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">4. Subscriptions, Billing & Taxes</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Paid plans are billed in advance on a subscription basis. Fees are non‑refundable except where required by law.</li>
              <li>You authorize us (and our payment processors) to charge the payment method on file for recurring fees and applicable taxes.</li>
              <li>Downgrades take effect at the end of the current billing cycle unless stated otherwise.</li>
              <li>We may change prices with reasonable prior notice; continued use after notice constitutes acceptance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">5. Use of the Service</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>The Service facilitates discovery, evaluation, and execution of business partnerships between users.</li>
              <li>We do not become a party to agreements you enter with other users; you are solely responsible for your obligations to third parties.</li>
              <li>You must comply with all applicable export controls, sanctions, and anti‑corruption laws.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">6. Partner Agreements</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All commercial terms between partners (scope, pricing, commissions, delivery, SLAs) are negotiated and documented by the parties.</li>
              <li>The Service may provide tooling (templates, trackers, analytics) but does not guarantee outcomes.</li>
              <li>Each party is responsible for its own compliance, performance, taxes, and reporting.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">7. Data Privacy & Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We process personal data per our Privacy Policy. By using the Service, you consent to such processing.</li>
              <li>Do not upload sensitive personal data or regulated data unless a written data processing agreement authorizes it.</li>
              <li>You must implement reasonable security measures for data you export or process outside the Service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">8. Confidential Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>"Confidential Information" is non‑public information disclosed by a party that is marked confidential or should reasonably be understood as confidential.</li>
              <li>The receiving party will use it only for the intended purpose and protect it with reasonable care.</li>
              <li>Exclusions: information that is public, already known, independently developed, or rightfully received from a third party.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">9. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We and our licensors own the Service and all related IP. No rights are granted except as explicitly stated in these Terms.</li>
              <li>You retain ownership of your content. You grant us a non‑exclusive, worldwide, royalty‑free license to host, display, and process your content solely to provide the Service.</li>
              <li>Feedback may be used to improve the Service without obligation or attribution.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">10. Acceptable Use</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>No illegal, harmful, infringing, deceptive, or discriminatory activity.</li>
              <li>No reverse engineering, scraping, or bypassing of technical controls.</li>
              <li>No uploading of malware or interfering with the integrity or performance of the Service.</li>
              <li>No unsolicited advertising or spam.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">11. Third‑Party Services</h2>
            <p>
              The Service may integrate with third‑party products. Your use of third‑party services is governed by their terms and privacy policies. We are not responsible for third‑party acts or omissions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">12. Communications</h2>
            <p>
              You agree to receive essential communications regarding your account and the Service. You can manage marketing preferences via provided controls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">13. Warranties & Disclaimers</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>The Service is provided "as is" and "as available" without warranties of any kind, express or implied.</li>
              <li>We do not warrant that the Service will be uninterrupted, error‑free, or meet your specific requirements.</li>
              <li>To the fullest extent permitted by law, we disclaim implied warranties of merchantability, fitness for a particular purpose, and non‑infringement.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">14. Limitation of Liability</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or exemplary damages.</li>
              <li>Our aggregate liability arising out of or relating to the Service is limited to the greater of (a) fees paid by you in the 12 months preceding the claim or (b) $100.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">15. Indemnification</h2>
            <p>
              You will defend, indemnify, and hold harmless Business Symbiosis, its affiliates, and personnel from claims, damages, and costs arising from your use of the Service or breach of these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">16. Suspension & Termination</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We may suspend or terminate access for actual or suspected violations of these Terms or risk to the Service.</li>
              <li>You may terminate at any time by canceling your subscription; obligations accrued prior to termination survive.</li>
              <li>Upon termination, your right to use the Service ceases; certain data retention and deletion timelines may apply as described in our Privacy Policy.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">17. Governing Law & Venue</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict‑of‑law principles. Exclusive jurisdiction and venue lie in the state or federal courts located in Delaware, except where arbitration applies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">18. Dispute Resolution; Arbitration</h2>
            <p>
              Any dispute arising out of or relating to these Terms or the Service will be resolved by binding arbitration administered by JAMS under its rules. You waive the right to a jury trial and to participate in a class action. Either party may seek injunctive relief in court for misuse of IP or confidentiality breaches.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">19. Changes to the Service or Terms</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We may modify the Service or these Terms. Material changes will be notified via the Service or email.</li>
              <li>Continued use after changes become effective constitutes acceptance of the updated Terms.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">20. Contact</h2>
            <p>
              Questions about these Terms can be sent to legal@businesssymbiosis.com. For support, visit the Contact page.
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
