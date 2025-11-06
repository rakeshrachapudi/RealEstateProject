import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LegalPage.css";

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="lp-container">
      {/* Header */}
      <header className="lp-header">
        <button className="lp-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="lp-header-content">
          <h1 className="lp-title">Legal Information</h1>
          <p className="lp-subtitle">
            PropertyDealz - Your trusted real estate platform
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="lp-nav">
        <button
          className={`lp-tab ${activeTab === "terms" ? "lp-tab-active" : ""}`}
          onClick={() => handleTabChange("terms")}
        >
          Terms of Service
        </button>
        <button
          className={`lp-tab ${activeTab === "privacy" ? "lp-tab-active" : ""}`}
          onClick={() => handleTabChange("privacy")}
        >
          Privacy Policy
        </button>
        <button
          className={`lp-tab ${
            activeTab === "disclaimer" ? "lp-tab-active" : ""
          }`}
          onClick={() => handleTabChange("disclaimer")}
        >
          Disclaimer
        </button>
        <button
          className={`lp-tab ${activeTab === "cookies" ? "lp-tab-active" : ""}`}
          onClick={() => handleTabChange("cookies")}
        >
          Cookie Policy
        </button>
      </nav>

      {/* Content */}
      <main className="lp-content">
        {/* Terms of Service */}
        {activeTab === "terms" && (
          <div className="lp-section">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Terms of Service</h2>
              <p className="lp-section-subtitle">
                Last updated: November 6, 2025
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">1. Acceptance of Terms</h3>
              <p className="lp-article-text">
                By accessing and using PropertyDealz ("the Platform"), you
                accept and agree to be bound by the terms and provision of this
                agreement. These Terms of Service apply to all users of the
                platform, including buyers, sellers, agents, and visitors.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">2. Platform Services</h3>
              <p className="lp-article-text">
                PropertyDealz provides a digital platform for real estate
                transactions, including:
              </p>
              <ul className="lp-article-list">
                <li>Property listings and search functionality</li>
                <li>Connection between buyers, sellers, and agents</li>
                <li>
                  Document generation tools for rental and sale agreements
                </li>
                <li>Property management and tracking services</li>
                <li>Communication tools for real estate transactions</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">3. User Responsibilities</h3>
              <p className="lp-article-text">
                Users of PropertyDealz agree to:
              </p>
              <ul className="lp-article-list">
                <li>
                  Provide accurate and truthful information in all listings and
                  communications
                </li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect the rights and privacy of other users</li>
                <li>
                  Use the platform only for legitimate real estate purposes
                </li>
                <li>
                  Maintain the security and confidentiality of their account
                  credentials
                </li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">4. Prohibited Activities</h3>
              <p className="lp-article-text">
                The following activities are strictly prohibited on
                PropertyDealz:
              </p>
              <ul className="lp-article-list">
                <li>
                  Posting false, misleading, or fraudulent property listings
                </li>
                <li>
                  Harassment or inappropriate communication with other users
                </li>
                <li>
                  Attempting to circumvent platform fees or payment systems
                </li>
                <li>Using automated systems to scrape or collect data</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">5. Limitation of Liability</h3>
              <p className="lp-article-text">
                PropertyDealz operates as a platform connecting parties and is
                not directly involved in real estate transactions. We are not
                liable for disputes between users, property defects, or
                transaction failures. Users engage in transactions at their own
                risk.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">6. Modification of Terms</h3>
              <p className="lp-article-text">
                PropertyDealz reserves the right to modify these terms at any
                time. Users will be notified of significant changes, and
                continued use of the platform constitutes acceptance of modified
                terms.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">7. Contact Information</h3>
              <p className="lp-article-text">
                For questions regarding these terms, please contact us at:
              </p>
              <div className="lp-contact-info">
                <p>
                  <strong>Email:</strong> legal@propertydealz.in
                </p>
                <p>
                  <strong>Phone:</strong> +91 40 1234 5678
                </p>
                <p>
                  <strong>Address:</strong> PropertyDealz Legal Dept.,
                  Hyderabad, Telangana, India
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {activeTab === "privacy" && (
          <div className="lp-section">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Privacy Policy</h2>
              <p className="lp-section-subtitle">
                Last updated: November 6, 2025
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">1. Information We Collect</h3>
              <p className="lp-article-text">
                PropertyDealz collects information to provide better services to
                our users:
              </p>
              <ul className="lp-article-list">
                <li>
                  <strong>Personal Information:</strong> Name, email address,
                  phone number, and address
                </li>
                <li>
                  <strong>Property Information:</strong> Details about
                  properties you list or inquire about
                </li>
                <li>
                  <strong>Usage Data:</strong> How you interact with our
                  platform
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, IP address,
                  and device identifiers
                </li>
                <li>
                  <strong>Location Data:</strong> With your permission, to show
                  relevant properties
                </li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">
                2. How We Use Your Information
              </h3>
              <p className="lp-article-text">
                We use collected information to:
              </p>
              <ul className="lp-article-list">
                <li>Facilitate real estate transactions and connections</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our platform and develop new features</li>
                <li>Send relevant notifications and updates</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">3. Information Sharing</h3>
              <p className="lp-article-text">
                PropertyDealz does not sell personal information. We may share
                information:
              </p>
              <ul className="lp-article-list">
                <li>With other users when necessary for transactions</li>
                <li>
                  With service providers who assist in platform operations
                </li>
                <li>When required by law or to protect our rights</li>
                <li>With your explicit consent</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">4. Data Security</h3>
              <p className="lp-article-text">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no internet transmission is
                completely secure.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">5. Your Rights</h3>
              <p className="lp-article-text">You have the right to:</p>
              <ul className="lp-article-list">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Object to certain data processing activities</li>
                <li>Receive a copy of your data in portable format</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">6. Data Retention</h3>
              <p className="lp-article-text">
                We retain personal information only as long as necessary for the
                purposes outlined in this policy or as required by law. Account
                information is typically retained for 3 years after account
                closure.
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {activeTab === "disclaimer" && (
          <div className="lp-section">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Disclaimer</h2>
              <p className="lp-section-subtitle">
                Important legal disclaimers and limitations
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">1. Platform Nature</h3>
              <p className="lp-article-text">
                PropertyDealz operates as an intermediary platform connecting
                buyers, sellers, and real estate professionals. We do not own,
                sell, or directly manage any properties listed on the platform.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">2. Information Accuracy</h3>
              <p className="lp-article-text">
                While we strive to ensure accuracy, PropertyDealz makes no
                warranties regarding the completeness, accuracy, or reliability
                of property listings, prices, or user-generated content. Users
                should independently verify all information.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">3. Investment Advice</h3>
              <p className="lp-article-text">
                PropertyDealz does not provide investment, legal, or financial
                advice. All real estate decisions should be made after
                consulting with qualified professionals and conducting due
                diligence.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">4. Third-Party Content</h3>
              <p className="lp-article-text">
                Our platform may contain links to third-party websites or
                services. PropertyDealz is not responsible for the content,
                privacy practices, or reliability of external sites.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">5. Legal Document Generation</h3>
              <p className="lp-article-text">
                Our agreement generation tools provide templates for common real
                estate documents. These should be reviewed by legal
                professionals before execution. PropertyDealz is not responsible
                for the legal validity or enforcement of generated documents.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">6. Market Fluctuations</h3>
              <p className="lp-article-text">
                Real estate markets are subject to fluctuations. Past
                performance or listings do not guarantee future results.
                Property values may increase or decrease based on market
                conditions.
              </p>
            </div>
          </div>
        )}

        {/* Cookie Policy */}
        {activeTab === "cookies" && (
          <div className="lp-section">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Cookie Policy</h2>
              <p className="lp-section-subtitle">
                How we use cookies and similar technologies
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">1. What Are Cookies</h3>
              <p className="lp-article-text">
                Cookies are small text files stored on your device when you
                visit our website. They help us provide better services by
                remembering your preferences and improving your experience.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">2. Types of Cookies We Use</h3>
              <div className="lp-cookie-types">
                <div className="lp-cookie-type">
                  <h4 className="lp-cookie-type-title">Essential Cookies</h4>
                  <p className="lp-cookie-type-desc">
                    Required for platform functionality, including login
                    sessions and security features.
                  </p>
                </div>
                <div className="lp-cookie-type">
                  <h4 className="lp-cookie-type-title">Analytics Cookies</h4>
                  <p className="lp-cookie-type-desc">
                    Help us understand how users interact with our platform to
                    improve services.
                  </p>
                </div>
                <div className="lp-cookie-type">
                  <h4 className="lp-cookie-type-title">Preference Cookies</h4>
                  <p className="lp-cookie-type-desc">
                    Remember your settings and preferences for a personalized
                    experience.
                  </p>
                </div>
                <div className="lp-cookie-type">
                  <h4 className="lp-cookie-type-title">Marketing Cookies</h4>
                  <p className="lp-cookie-type-desc">
                    Used to deliver relevant advertisements and measure campaign
                    effectiveness.
                  </p>
                </div>
              </div>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">3. Managing Cookies</h3>
              <p className="lp-article-text">
                You can control cookie settings through your browser:
              </p>
              <ul className="lp-article-list">
                <li>View and delete existing cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close the browser</li>
                <li>Receive notifications when cookies are set</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">
                4. Impact of Disabling Cookies
              </h3>
              <p className="lp-article-text">
                Disabling cookies may affect platform functionality:
              </p>
              <ul className="lp-article-list">
                <li>You may need to re-enter login information frequently</li>
                <li>Personalized features may not work properly</li>
                <li>Some platform features may become unavailable</li>
                <li>Your preferences may not be saved between sessions</li>
              </ul>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">5. Third-Party Cookies</h3>
              <p className="lp-article-text">
                Our platform may use third-party services that set their own
                cookies, including Google Analytics, social media widgets, and
                advertising networks. These are governed by their respective
                privacy policies.
              </p>
            </div>

            <div className="lp-article">
              <h3 className="lp-article-title">6. Updates to Cookie Policy</h3>
              <p className="lp-article-text">
                We may update this Cookie Policy to reflect changes in our
                practices or for legal reasons. Significant changes will be
                communicated through our platform.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="lp-footer">
        <button className="lp-scroll-top" onClick={scrollToTop}>
          ↑ Back to Top
        </button>
        <div className="lp-footer-content">
          <p className="lp-footer-text">
            © 2025 PropertyDealz. All rights reserved. |
            <span className="lp-footer-link">
              {" "}
              Contact: legal@propertydealz.in
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
