// src/components/Footer.jsx

import React, { useState, useEffect } from "react";
import "./Footer.css";

// Function to format the current time, date, and day in Indian Standard Time (IST)
const getCurrentDateTimeIST = () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const styles = {
  footer: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    padding: "clamp(30px, 5vw, 60px) clamp(16px, 4vw, 32px)",
    borderTop: "1px solid #334155",
    fontSize: "clamp(14px, 1.8vw, 16px)",
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: "clamp(24px, 4vw, 48px)",
    maxWidth: "1700px",
    padding: "40px",
    textAlign: "left",
  },
  columnTitle: {
    fontWeight: "700",
    fontSize: "1rem",
    color: "#94a3b8", // Slate-400
    marginBottom: "10px",
    textTransform: "uppercase",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  linkItem: {
    marginBottom: "6px",
  },
  link: {
    color: "#e2e8f0",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  contactInfo: {
    marginTop: "5px",
    lineHeight: "1.5",
  },
  copyright: {
    borderTop: "1px solid #334155",
    paddingTop: "15px",
    marginTop: "20px",
    width: "100%",
    textAlign: "center",
    fontSize: "0.8rem",
  },
  timezone: {
    fontSize: "0.8rem",
    marginTop: "10px",
    color: "#a0a0a0",
  },
  socialIcons: {
    display: "flex",
    gap: "15px",
    marginTop: "10px", // Adjusted margin
  },
  socialIconLink: {
    color: "#e2e8f0",
    fontSize: "1.5rem",
    transition: "color 0.2s ease-in-out",
  },
  appButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  appButton: {
    width: "120px",
    height: "40px",
    backgroundColor: "#333",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "12px",
    textDecoration: "none",
    border: "1px solid #555",
  },
  bottomContactContainer: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Allows two columns to fit
    gap: "30px",
    marginTop: "20px", // Spacing from the main content grid
  },
  // 🎯 NEW STYLES FOR TRUST SEALS
  trustContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "25px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  sealBadge: {
    display: "flex",
    alignItems: "center",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
    backgroundColor: "#0f384f", // Darker blue background
    color: "#5bc0de", // Light blue text/icon color
  },
  sealIcon: {
    marginRight: "6px",
    fontSize: "1.1rem",
  },
};

function Footer() {
  const [currentDateTime, setCurrentDateTime] = useState(
    getCurrentDateTimeIST()
  );

  // Update time every second for high accuracy display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTimeIST());
    }, 1000); // 1 second

    return () => clearInterval(timer);
  }, []);

  return (
    <footer style={styles.footer}>
      <div style={styles.contentGrid}>
        {/* Column 1: About & Support */}
        <div>
          <h4 style={styles.columnTitle}>About PropertyDealz</h4>
          <p style={styles.contactInfo}>
            Your platform connecting property buyers and sellers exclusively in
            Hyderabad.
          </p>
          <div style={{ marginTop: "20px" }}>
            <h4 style={styles.columnTitle}>Support</h4>
            <ul style={styles.linkList}>
              <li style={styles.linkItem}>
                <a href="/contact" style={styles.link}>
                  Contact Us
                </a>
              </li>
              <li style={styles.linkItem}>
                <a href="/faq" style={styles.link}>
                  FAQ
                </a>
              </li>
              <li style={styles.linkItem}>
                <a href="/privacy" style={styles.link}>
                  Privacy Policy
                </a>
              </li>
              <li style={styles.linkItem}>
                <a href="/terms" style={styles.link}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 2: Properties in Hyderabad (Location Focus) */}
        <div>
          <h4 style={styles.columnTitle}>Properties in Hyderabad</h4>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}>
              <a href="/area/Kondapur" style={styles.link}>
                Property in Kondapur
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/area/Gachibowli" style={styles.link}>
                Property in Gachibowli
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/area/Madhapur" style={styles.link}>
                Property in Madhapur
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/area/Jubilee_Hills" style={styles.link}>
                Property in Jubilee Hills
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/area/Banjara_Hills" style={styles.link}>
                Property in Banjara Hills
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/search?city=Hyderabad" style={styles.link}>
                View All Locations
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Property Services & Trusted Partners */}
        <div>
          <h4 style={styles.columnTitle}>Property Services</h4>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}>
              <a href="/loan" style={styles.link}>
                Home Loan Assistance
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/rental-agreement" style={styles.link}>
                Rental Agreement
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/owner-plans" style={styles.link}>
                Seller Plans
              </a>
            </li>
          </ul>
          <h4 style={{ ...styles.columnTitle, marginTop: "20px" }}>
            Trusted Partners
          </h4>
          <ul style={styles.linkList}>
            <li style={styles.linkItem}>
              <a href="/partner/furniture" style={styles.link}>
                Trusted Furniture Partner
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/partner/electrical" style={styles.link}>
                Trusted Electrical Contractor
              </a>
            </li>
            <li style={styles.linkItem}>
              <a href="/home-renovation" style={styles.link}>
                Home Interior Experts
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact, Apps & Social Media - Combined Structure */}
        <div>
          <div style={styles.bottomContactContainer}>
            {/* Get In Touch (Left Section) */}
            <div>
              <h4 style={styles.columnTitle}>Get In Touch</h4>
              <div style={styles.contactInfo}>
                <p>📞 +91 63098 06984</p>
                <p>📞 +91 89784 54609</p>
                <p>✉️ support@propertydealz.com</p>
                <p>📍 Gachibowli, Hyderabad, 500032</p>
              </div>

              {/* Social Media Icons */}
              <div style={styles.socialIcons}>
                <a
                  href="https://www.facebook.com/PropertyDealz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialIconLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.812c-3.235 0-4.188 1.567-4.188 4.045v2.955z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/PropertyDealz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialIconLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.594 0-6.495 2.902-6.495 6.495 0 .504.057.99.167 1.458-5.392-.27-10.197-2.859-13.407-6.791-.555.952-.876 2.05-.876 3.228 0 2.247 1.144 4.224 2.872 5.399-.106-.316-.208-.65-.295-.992-.008.026-.016.052-.023.078 0 2.052 1.464 3.765 3.394 4.152-.357.097-.735.148-1.127.148-.276 0-.543-.026-.803-.076.539 1.684 2.1 2.902 3.962 2.934-1.458 1.141-3.296 1.821-5.29 1.821-.343 0-.682-.02-.99-.058 1.889 1.206 4.108 1.908 6.518 1.908 7.828 0 12.083-6.136 12.083-11.492 0-.175-.004-.349-.012-.522.83-.598 1.556-1.344 2.128-2.195z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/PropertyDealz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialIconLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/propertydealz.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialIconLink}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.772 1.691 4.91 4.91.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.138 3.212-1.678 4.755-4.91 4.91-1.265.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.779-1.692-4.91-4.91-.058-1.265-.07-1.644-.07-4.85 0-3.204.012-3.584.07-4.849.14-3.227 1.679-4.766 4.91-4.91 1.265-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Get Our App (Right Section) */}
            <div>
              <h4 style={styles.columnTitle}>Get Our App</h4>
              <div style={styles.appButtons}>
                <a href="#" style={styles.appButton}>
                  Google Play
                </a>
                <a href="#" style={styles.appButton}>
                  App Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 NEW: Trust Seals and Compliance 🎯 */}
      <div style={styles.trustContainer}>
        <div style={styles.sealBadge}>
          <span style={styles.sealIcon}>🔒</span> Secure SSL Connection
        </div>
        <div style={styles.sealBadge}>
          <span style={styles.sealIcon}>✅</span> Verified Agent Network
        </div>
        <div style={styles.sealBadge}>
          <span style={styles.sealIcon}>⚖️</span> RERA Compliant Platform
        </div>
      </div>

      <div style={styles.copyright}>
        &copy; {new Date().getFullYear()} PropertyDealz. All rights reserved. |
        Serving Hyderabad.
        <div style={styles.timezone}>Current Time: {currentDateTime} IST</div>
      </div>
    </footer>
  );
}

export default Footer;
