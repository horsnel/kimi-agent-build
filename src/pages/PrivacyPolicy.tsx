import { Link } from 'react-router';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-24">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-3">Privacy Policy</h1>
        <p className="text-sm font-mono text-slategray">Last updated: May 1, 2026</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">1. Introduction</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Sigma Capital ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website sigma-capital.pages.dev (the "Service") and any related services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.
          </p>
          <p className="text-offwhite/90 leading-relaxed">
            We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Privacy Policy by your continued use of the Service after the date such revised Privacy Policy is posted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">2. Information We Collect</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            We may collect information about you in a variety of ways. The information we may collect on the Service includes:
          </p>
          <h3 className="text-lg font-display font-medium text-offwhite/80 mb-2">Personal Data</h3>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Personally identifiable information, such as your name, email address, and telephone number, which you voluntarily give to us when making a purchase, signing up for our newsletter, or contacting us. We do not consider demographically based information to be personal data. We may also collect information that you voluntarily provide to us when you join our waitlist, subscribe to our services, or participate in any interactive features of the Service.
          </p>
          <h3 className="text-lg font-display font-medium text-offwhite/80 mb-2">Derivative Data</h3>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service. This data is used for analytics, security, and service improvement purposes only.
          </p>
          <h3 className="text-lg font-display font-medium text-offwhite/80 mb-2">Financial Data</h3>
          <p className="text-offwhite/90 leading-relaxed">
            Financial information related to your use of premium services, such as transaction history and payment method details. We do not store complete credit card numbers on our servers — payment processing is handled by third-party payment processors who are PCI DSS compliant. We retain only the minimum information necessary to manage your subscription and provide customer support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">3. How We Use Your Information</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            We may use the information we collect about you for various purposes, including to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-offwhite/90 leading-relaxed ml-4">
            <li>Provide, operate, and maintain our Service, including delivering market data, analysis, and tools you have requested</li>
            <li>Improve, personalize, and expand our Service based on usage patterns and feedback</li>
            <li>Understand and analyze how you use our Service and develop new products, services, features, and functionality</li>
            <li>Communicate with you, including sending you newsletters, product updates, and marketing communications (you may opt out at any time)</li>
            <li>Process your transactions and send you related information, including purchase confirmations and invoices</li>
            <li>Detect and prevent fraud, technical issues, and other illegal activities</li>
            <li>Comply with legal obligations and enforce our terms of service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">4. Sharing Your Information</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners for the purposes outlined above. We may also share your information in the following situations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-offwhite/90 leading-relaxed ml-4">
            <li><strong>Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service</li>
            <li><strong>Legal Obligations:</strong> We may disclose your information where required by law, subpoena, or other legal process</li>
            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business</li>
            <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">5. Data Security</h2>
          <p className="text-offwhite/90 leading-relaxed">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information. We encourage you to use strong passwords and to never share your login credentials with others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">6. Cookies and Tracking Technologies</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Service to help customize the Service and improve your experience. When you access the Service, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Service. You may also refuse the use of tracking cookies by adjusting your browser settings. For more information, please see our Cookie Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">7. Your Rights</h2>
          <p className="text-offwhite/90 leading-relaxed mb-4">
            Depending on your jurisdiction, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-offwhite/90 leading-relaxed ml-4">
            <li><strong>Access:</strong> The right to request access to the personal data we hold about you</li>
            <li><strong>Rectification:</strong> The right to request correction of inaccurate or incomplete personal data</li>
            <li><strong>Erasure:</strong> The right to request deletion of your personal data, subject to certain legal exceptions</li>
            <li><strong>Portability:</strong> The right to receive your personal data in a structured, commonly used format</li>
            <li><strong>Objection:</strong> The right to object to the processing of your personal data in certain circumstances</li>
            <li><strong>Withdrawal of Consent:</strong> The right to withdraw your consent at any time where we rely on consent to process your personal data</li>
          </ul>
          <p className="text-offwhite/90 leading-relaxed mt-4">
            To exercise any of these rights, please contact us at privacy@sigmacapital.com. We will respond to your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">8. Third-Party Links</h2>
          <p className="text-offwhite/90 leading-relaxed">
            The Service may contain links to third-party websites or services that are not owned or controlled by Sigma Capital. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that Sigma Capital shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">9. Children's Privacy</h2>
          <p className="text-offwhite/90 leading-relaxed">
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from anyone under the age of 13 without verification of parental consent, we will take steps to remove that information from our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-display font-medium text-offwhite mb-3">10. Contact Us</h2>
          <p className="text-offwhite/90 leading-relaxed">
            If you have questions or comments about this Privacy Policy or how we handle your personal information, please contact us at:
          </p>
          <div className="mt-3 p-4 bg-charcoal border border-subtleborder rounded-xl">
            <p className="text-offwhite/90 font-mono text-sm">Sigma Capital</p>
            <p className="text-offwhite/90 font-mono text-sm">Email: privacy@sigmacapital.com</p>
          </div>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-subtleborder">
        <Link to="/" className="text-sm font-mono text-emerald hover:text-offwhite transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
