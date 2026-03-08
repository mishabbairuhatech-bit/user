import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui';

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/login">
            <Button variant="ghost" size="sm" prefixIcon={ArrowLeft}>
              Back to Login
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#141414] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Cookie Policy</h1>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What Are Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Cookies are small text files that are stored on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>Essential cookies:</strong> These cookies are necessary for the website to function properly and cannot be switched off.</li>
                <li><strong>Authentication cookies:</strong> We use these to identify you when you log in to our platform.</li>
                <li><strong>Preference cookies:</strong> These cookies remember your settings and preferences, such as language and theme.</li>
                <li><strong>Analytics cookies:</strong> We use these to understand how visitors interact with our website.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Types of Cookies We Use</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 mt-4">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1a1a1a]">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-900 dark:text-white">Cookie Name</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-900 dark:text-white">Purpose</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-900 dark:text-white">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 dark:text-gray-300">
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">access_token</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Authentication</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">1 minute</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">refresh_token</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Session management</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">7 days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">theme</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">User preference</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">cookie_consent_accepted</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Cookie consent</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Persistent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Managing Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Please note that disabling certain cookies may affect the functionality of our website and your user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Updates to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically for the latest information on our cookie practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300">
                If you have any questions about our use of cookies, please contact us at{' '}
                <a href="mailto:support@example.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                  support@example.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
