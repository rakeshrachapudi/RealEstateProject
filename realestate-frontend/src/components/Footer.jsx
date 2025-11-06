// src/components/Footer.jsx
import React, { useState, useEffect } from "react";
import "./Footer.css";

// Format current time/date/day in IST
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

function Footer() {
  const [currentDateTime, setCurrentDateTime] = useState(
    getCurrentDateTimeIST()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTimeIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content-grid">
        {/* Column 1: About & Support */}
        <div className="footer-col">
          <h4 className="footer-col-title">About PropertyDealz</h4>
          <p className="footer-text">
            Your platform connecting property buyers and sellers exclusively in
            Hyderabad.
          </p>

          <div className="footer-col mt-3">
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links">
              <li>
                <a href="/contact" className="footer-link">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/faq" className="footer-link">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/privacy" className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="footer-link">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 2: Properties in Hyderabad */}
        <div className="footer-col">
          <h4 className="footer-col-title">Properties in Hyderabad</h4>
          <ul className="footer-links">
            <li>
              <a href="/area/Kondapur" className="footer-link">
                Property in Kondapur
              </a>
            </li>
            <li>
              <a href="/area/Gachibowli" className="footer-link">
                Property in Gachibowli
              </a>
            </li>
            <li>
              <a href="/area/Madhapur" className="footer-link">
                Property in Madhapur
              </a>
            </li>
            <li>
              <a href="/area/Jubilee_Hills" className="footer-link">
                Property in Jubilee Hills
              </a>
            </li>
            <li>
              <a href="/area/Banjara_Hills" className="footer-link">
                Property in Banjara Hills
              </a>
            </li>
            <li>
              <a href="/search?city=Hyderabad" className="footer-link">
                View All Locations
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Property Services & Trusted Partners */}
        <div className="footer-col">
          <h4 className="footer-col-title">Property Services</h4>
          <ul className="footer-links">
            <li>
              <a href="/loan" className="footer-link">
                Home Loan Assistance
              </a>
            </li>
            <li>
              <a href="/rental-agreement" className="footer-link">
                Rental Agreement
              </a>
            </li>
            <li>
              <a href="/owner-plans" className="footer-link">
                Seller Plans
              </a>
            </li>
          </ul>

          <h4 className="footer-col-title mt-3">Trusted Partners</h4>
          <ul className="footer-links">
            <li>
              <a href="/partner/furniture" className="footer-link">
                Trusted Furniture Partner
              </a>
            </li>
            <li>
              <a href="/partner/electrical" className="footer-link">
                Trusted Electrical Contractor
              </a>
            </li>
            <li>
              <a href="/home-renovation" className="footer-link">
                Home Interior Experts
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact, Apps & Social */}
        <div className="footer-col">
          <div className="footer-bottom-contact">
            {/* Get In Touch */}
            <div>
              <h4 className="footer-col-title">Get In Touch</h4>
              <div className="footer-contact">
                <p>📞 +91 63098 06984</p>
                <p>📞 +91 89784 54609</p>
                <p>✉️ support@propertydealz.com</p>
                <p>📍 Gachibowli, Hyderabad, 500032</p>
              </div>

              {/* Social Icons */}
              <div className="footer-social-icons">
                <a
                  href="https://www.facebook.com/PropertyDealz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label="Facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8H6v4h3v12h5V12h3.642l.358-4h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.812C10.953 0 10 1.567 10 4.045V8z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/PropertyDealz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label="Twitter"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557a9.94 9.94 0 0 1-2.828.775 4.93 4.93 0 0 0 2.165-2.724 9.86 9.86 0 0 1-3.127 1.195 4.924 4.924 0 0 0-8.39 4.49c-4.093-.205-7.72-2.165-10.148-5.144a4.93 4.93 0 0 0 1.523 6.574 4.9 4.9 0 0 1-2.229-.616v.062a4.927 4.927 0 0 0 3.95 4.827 4.996 4.996 0 0 1-2.224.084 4.936 4.936 0 0 0 4.604 3.417A9.867 9.867 0 0 1 0 19.54 13.94 13.94 0 0 0 7.548 21.9c9.142 0 14.307-7.721 13.995-14.646A9.935 9.935 0 0 0 24 4.557z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/PropertyDealz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732A1.768 1.768 0 1 1 6.5 3.2a1.768 1.768 0 0 1 0 3.532zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765C14.396 7.179 20 6.988 20 12.241V19z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/propertydealz.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.772 1.691 4.91 4.91.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.138 3.212-1.678 4.755-4.91 4.91-1.265.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.779-1.692-4.91-4.91-.058-1.265-.07-1.644-.07-4.85 0-3.204.012-3.584.07-4.849.14-3.227 1.679-4.766 4.91-4.91 1.265-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8.001 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Get Our App */}
            <div>
              <h4 className="footer-col-title">Get Our App</h4>
              <div className="footer-app-buttons">
                <a
                  href="#"
                  className="footer-app-button"
                  aria-label="Google Play"
                >
                  Google Play
                </a>
                <a
                  href="#"
                  className="footer-app-button"
                  aria-label="App Store"
                >
                  App Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Seals */}
      <div className="footer-trust-badges">
        <div className="footer-trust-badge">
          <span className="footer-trust-icon">🔒</span> Secure SSL Connection
        </div>
        <div className="footer-trust-badge">
          <span className="footer-trust-icon">✅</span> Verified Agent Network
        </div>
        <div className="footer-trust-badge">
          <span className="footer-trust-icon">⚖️</span> RERA Compliant Platform
        </div>
      </div>

      <div className="footer-copy">
        &copy; {new Date().getFullYear()} PropertyDealz. All rights reserved. |
        Serving Hyderabad.
        {/* <div className="footer-time">Current Time: {currentDateTime} IST</div> */}
      </div>
    </footer>
  );
}

export default Footer;
