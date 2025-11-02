// FurniturePartner.jsx - Professional Furniture Partner Section with Infinite Scroll
import React, { useState, useEffect } from "react";

const FurniturePartner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Sample furniture categories from HiVibes Interiors
  const furnitureCategories = [
    {
      id: 1,
      name: "Modular Kitchens",
      description: "Modern, functional kitchen solutions with premium finishes",
      image: "🏠",
      features: ["German Hardware", "15-Year Warranty", "Factory Finish"],
      price: "₹1.5L - ₹4L",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      name: "Wardrobes & Storage",
      description: "Custom wardrobes designed for maximum space utilization",
      image: "🚪",
      features: ["Sliding Doors", "LED Lighting", "Soft-Close Hinges"],
      price: "₹80K - ₹2.5L",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      name: "Living Room Solutions",
      description: "Contemporary furniture for elegant living spaces",
      image: "🛋️",
      features: ["Premium Upholstery", "Ergonomic Design", "Stain Resistant"],
      price: "₹50K - ₹3L",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: 4,
      name: "Bedroom Interiors",
      description: "Complete bedroom solutions with modern aesthetics",
      image: "🛏️",
      features: ["Orthopedic Mattress", "Designer Headboards", "Study Units"],
      price: "₹1L - ₹5L",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      id: 5,
      name: "Office Furniture",
      description: "Ergonomic office solutions for home and commercial spaces",
      image: "💼",
      features: ["Height Adjustable", "Cable Management", "Multi-functional"],
      price: "₹25K - ₹1.5L",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
    {
      id: 6,
      name: "Dining Solutions",
      description: "Elegant dining sets for memorable family moments",
      image: "🍽️",
      features: ["Solid Wood", "Extendable Tables", "Comfortable Seating"],
      price: "₹40K - ₹2L",
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    },
  ];

  // Create extended array for infinite scroll

  // Auto-scroll functionality with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        if (nextSlide >= furnitureCategories.length * 2) {
          // Reset to beginning
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentSlide(furnitureCategories.length);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 600);
        }
        return nextSlide;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [furnitureCategories.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("furniture-partner-section");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      if (prev >= furnitureCategories.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  };

  const styles = {
    container: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      borderRadius: "24px",
      padding: "clamp(30px, 5vw, 50px) 0",
      marginBottom: "clamp(20px, 3vw, 40px)",
      position: "relative",
      overflow: "hidden",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow:
        "0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(40px)",
      transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    },
    header: {
      textAlign: "center",
      marginBottom: "clamp(30px, 4vw, 40px)",
      padding: "0 clamp(20px, 4vw, 40px)",
    },
    partnerBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "8px 20px",
      borderRadius: "50px",
      fontSize: "clamp(12px, 1.5vw, 14px)",
      fontWeight: "600",
      marginBottom: "16px",
      animation: isVisible ? "slideInFromTop 0.6s ease-out 0.2s both" : "none",
    },
    mainTitle: {
      fontSize: "clamp(24px, 4vw, 32px)",
      fontWeight: "800",
      color: "#1e293b",
      marginBottom: "12px",
      lineHeight: "1.2",
      animation: isVisible ? "fadeInUp 0.8s ease-out 0.4s both" : "none",
    },
    subtitle: {
      fontSize: "clamp(16px, 2.5vw, 18px)",
      color: "#64748b",
      lineHeight: "1.6",
      maxWidth: "600px",
      margin: "0 auto",
      animation: isVisible ? "fadeInUp 0.8s ease-out 0.6s both" : "none",
    },
    sliderContainer: {
      position: "relative",
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "0 clamp(20px, 4vw, 40px)",
      overflow: "hidden",
    },
    slider: {
      display: "flex",
      transition: isTransitioning
        ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : "none",
      transform: `translateX(-${currentSlide * 33.333}%)`, // NOW SCROLLS 1 CARD AT A TIME
    },

    slideWrapper: {
      flex: "0 0 33.333%",
      padding: "0 clamp(8px, 1.5vw, 12px)",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "clamp(24px, 4vw, 32px)",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      boxShadow:
        "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
      transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      cursor: "pointer",
      border: "1px solid rgba(255, 255, 255, 0.8)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "20px",
    },
    cardIcon: {
      fontSize: "clamp(32px, 5vw, 40px)",
      padding: "12px",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    cardTitle: {
      fontSize: "clamp(18px, 3vw, 22px)",
      fontWeight: "700",
      color: "#1e293b",
      lineHeight: "1.3",
    },
    cardDescription: {
      fontSize: "clamp(14px, 2vw, 16px)",
      color: "#64748b",
      lineHeight: "1.5",
      marginBottom: "20px",
    },
    featuresList: {
      marginBottom: "20px",
    },
    feature: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "clamp(13px, 1.8vw, 14px)",
      color: "#475569",
      marginBottom: "8px",
    },
    checkmark: {
      color: "#10b981",
      fontWeight: "700",
    },
    cardFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto",
      paddingTop: "16px",
      borderTop: "1px solid #f1f5f9",
    },
    price: {
      fontSize: "clamp(16px, 2.5vw, 18px)",
      fontWeight: "700",
      color: "#667eea",
    },
    exploreBtn: {
      background: "transparent",
      border: "2px solid #667eea",
      color: "#667eea",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "clamp(12px, 1.5vw, 14px)",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    controls: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "clamp(16px, 3vw, 24px)",
      marginTop: "clamp(30px, 4vw, 40px)",
    },
    navButton: {
      background: "white",
      border: "2px solid #e2e8f0",
      borderRadius: "50%",
      width: "48px",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "18px",
      color: "#64748b",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
    dots: {
      display: "flex",
      gap: "8px",
    },
    dot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "2px solid transparent",
    },
    ctaSection: {
      textAlign: "center",
      marginTop: "clamp(30px, 4vw, 40px)",
      padding: "0 clamp(20px, 4vw, 40px)",
    },
    ctaButtons: {
      display: "flex",
      gap: "clamp(12px, 2vw, 16px)",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    primaryCta: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "clamp(14px, 2vw, 16px)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    },
    secondaryCta: {
      background: "white",
      color: "#667eea",
      padding: "clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)",
      borderRadius: "12px",
      border: "2px solid #667eea",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "clamp(14px, 2vw, 16px)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.1)",
    },
  };

  // Create extended array for infinite scroll
  const extendedCategories = [
    ...furnitureCategories,
    ...furnitureCategories,
    ...furnitureCategories,
  ];

  // Auto-scroll functionality with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;
        if (nextSlide >= furnitureCategories.length * 2) {
          // Reset to beginning
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentSlide(furnitureCategories.length);
            setTimeout(() => setIsTransitioning(true), 50);
          }, 600);
        }
        return nextSlide;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [furnitureCategories.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("furniture-partner-section");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const handleDotClick = (index) => {
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      if (prev <= 0) {
        return furnitureCategories.length - 1;
      }
      return prev - 1;
    });
  };

  const handleVisitWebsite = () => {
    window.open("https://hivibesinterio.in", "_blank", "noopener,noreferrer");
  };

  const handleCallNow = () => {
    window.open("tel:+919876543210", "_self");
  };

  // Inject keyframe animations
  useEffect(() => {
    const animationStyles = `
      @keyframes slideInFromTop {
        0% {
          opacity: 0;
          transform: translateY(-30px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(30px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <section id="furniture-partner-section" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.partnerBadge}>
          🤝 <span>Furniture Partner</span>
        </div>
        <h2 style={styles.mainTitle}>
          Transform Your New Home with HiVibes Interiors
        </h2>
        <p style={styles.subtitle}>
          Premium furniture solutions for your dream property. From modular
          kitchens to complete home interiors, we bring your vision to life with
          quality and style.
        </p>
      </div>

      {/* Infinite Slider */}
      <div style={styles.sliderContainer}>
        <div style={styles.slider}>
          {extendedCategories.map((category, index) => {
            const actualIndex = index % furnitureCategories.length;
            const centerIndex = currentSlide + 1; // Center visible position
            const isActive = index >= centerIndex && index < centerIndex + 1; // Only center card

            return (
              <div key={`${category.id}-${index}`} style={styles.slideWrapper}>
                <div
                  style={{
                    ...styles.card,
                    background: isActive ? category.gradient : "white",
                    color: isActive ? "white" : "#1e293b",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                    zIndex: isActive ? 10 : 1,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-8px) scale(1.02)";
                    e.target.style.boxShadow =
                      "0 20px 60px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = isActive
                      ? "scale(1.02)"
                      : "scale(1)";
                    e.target.style.boxShadow =
                      "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)";
                  }}
                >
                  {/* Rest of your card content stays exactly the same */}
                  <div style={styles.cardHeader}>
                    <div
                      style={{
                        ...styles.cardIcon,
                        background: isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                      }}
                    >
                      {category.image}
                    </div>
                    <h3
                      style={{
                        ...styles.cardTitle,
                        color: isActive ? "white" : "#1e293b",
                      }}
                    >
                      {category.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      ...styles.cardDescription,
                      color: isActive ? "rgba(255, 255, 255, 0.9)" : "#64748b",
                    }}
                  >
                    {category.description}
                  </p>

                  <div style={styles.featuresList}>
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} style={styles.feature}>
                        <span
                          style={{
                            ...styles.checkmark,
                            color: "#10b981",
                          }}
                        >
                          ✓
                        </span>
                        <span
                          style={{
                            color: isActive
                              ? "rgba(255, 255, 255, 0.9)"
                              : "#475569",
                          }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.cardFooter}>
                    <span
                      style={{
                        ...styles.price,
                        color: isActive ? "white" : "#667eea",
                      }}
                    >
                      {category.price}
                    </span>
                    <button
                      style={{
                        ...styles.exploreBtn,
                        background: isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : "transparent",
                        borderColor: isActive
                          ? "rgba(255, 255, 255, 0.5)"
                          : "#667eea",
                        color: isActive ? "white" : "#667eea",
                      }}
                      onClick={() => handleVisitWebsite()}
                      onMouseEnter={(e) => {
                        e.target.style.background = isActive
                          ? "rgba(255, 255, 255, 0.3)"
                          : "#667eea";
                        e.target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : "transparent";
                        e.target.style.color = isActive ? "white" : "#667eea";
                      }}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          style={styles.navButton}
          onClick={handlePrevSlide}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.color = "#667eea";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.color = "#64748b";
            e.target.style.transform = "scale(1)";
          }}
        >
          ‹
        </button>

        <div style={styles.dots}>
          {furnitureCategories.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                background:
                  Math.floor(currentSlide) % furnitureCategories.length ===
                  index
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#e2e8f0",
              }}
              onClick={() => handleDotClick(index)}
              onMouseEnter={(e) => {
                if (
                  Math.floor(currentSlide) % furnitureCategories.length !==
                  index
                ) {
                  e.target.style.background = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  Math.floor(currentSlide) % furnitureCategories.length !==
                  index
                ) {
                  e.target.style.background = "#e2e8f0";
                }
              }}
            />
          ))}
        </div>

        <button
          style={styles.navButton}
          onClick={handleNextSlide}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#667eea";
            e.target.style.color = "#667eea";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.color = "#64748b";
            e.target.style.transform = "scale(1)";
          }}
        >
          ›
        </button>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <div style={styles.ctaButtons}>
          <button
            style={styles.primaryCta}
            onClick={handleVisitWebsite}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px) scale(1.02)";
              e.target.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.3)";
            }}
          >
            🌐 Visit HiVibes Interiors
          </button>
          <button
            style={styles.secondaryCta}
            onClick={handleCallNow}
            onMouseEnter={(e) => {
              e.target.style.background = "#667eea";
              e.target.style.color = "white";
              e.target.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.color = "#667eea";
              e.target.style.transform = "translateY(0)";
            }}
          >
            📞 Call for Consultation
          </button>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .slider {
            transform: translateX(-${currentSlide * 50}%) !important;
          }
          .slideWrapper {
            flex: 0 0 50% !important;
          }
        }

        @media (max-width: 768px) {
          .slider {
            transform: translateX(-${currentSlide * 100}%) !important;
          }
          .slideWrapper {
            flex: 0 0 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FurniturePartner;
