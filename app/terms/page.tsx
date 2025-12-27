import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Salone SkillsHub ("the Platform"), you accept and agree to be bound by the
                  terms and provision of this agreement. If you do not agree to these Terms of Service, please do not
                  use our Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  Salone SkillsHub is a job marketplace platform that connects job seekers with employers in Sierra
                  Leone. We provide tools and services to facilitate job postings, applications, and employment
                  connections.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">3.1 Account Creation</h3>
                    <p className="text-gray-700 leading-relaxed">
                      To use certain features of the Platform, you must create an account. You agree to provide
                      accurate, current, and complete information during registration and to update such information
                      to keep it accurate, current, and complete.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2 Account Security</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You are responsible for maintaining the confidentiality of your account credentials and for all
                      activities that occur under your account. You agree to notify us immediately of any unauthorized
                      use of your account.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
                <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others, including intellectual property rights</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the Platform for any illegal or unauthorized purpose</li>
                  <li>Interfere with or disrupt the Platform or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Job Postings and Applications</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">5.1 Employer Responsibilities</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Employers are responsible for the accuracy of job postings and for complying with all applicable
                      employment laws. Employers must not discriminate based on race, gender, religion, or other
                      protected characteristics.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">5.2 Job Seeker Responsibilities</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Job seekers are responsible for the accuracy of their profiles and application materials. You
                      represent that all information provided is truthful and that you have the right to use any
                      materials you submit.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Platform and its original content, features, and functionality are owned by Salone SkillsHub
                  and are protected by international copyright, trademark, and other intellectual property laws. You
                  retain ownership of content you post but grant us a license to use, display, and distribute such
                  content on the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you purchase premium features, you agree to pay all fees associated with such services. All
                  fees are non-refundable unless otherwise stated. We reserve the right to change our pricing with
                  notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Platform is provided "as is" and "as available" without warranties of any kind. We do not
                  guarantee:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                  <li>That the Platform will be uninterrupted or error-free</li>
                  <li>The accuracy, completeness, or usefulness of any information on the Platform</li>
                  <li>That job postings or applications will result in employment</li>
                  <li>The quality or suitability of any job or candidate</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, Salone SkillsHub shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                  whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
                  losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and access to the Platform immediately, without prior
                  notice, for conduct that we believe violates these Terms of Service or is harmful to other users,
                  us, or third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with the laws of Sierra
                  Leone, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms of Service at any time. We will notify users of any
                  material changes by posting the new Terms on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Email: legal@saloneskillshub.com
                  <br />
                  Address: Freetown, Sierra Leone
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

