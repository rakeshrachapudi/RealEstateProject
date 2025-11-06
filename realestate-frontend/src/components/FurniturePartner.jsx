import React, { useState, useEffect } from "react";
import "./FurniturePartner.css";

const FurniturePartner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const furnitureCategories = [
    {
      id: 1,
      name: "Modular Kitchens",
      description: "Modern kitchen solutions with premium finishes",
      image: "🏠",
      features: ["German Hardware", "15-Year Warranty", "Factory Finish"],
      price: "₹1.5L - ₹4L",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      name: "Wardrobes & Storage",
      description: "Custom wardrobes for maximum space utilization",
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

  // Create extended array for infinite scroll - triple the array for seamless loop
  const extendedCategories = [
    ...furnitureCategories,
    ...furnitureCategories,
    ...furnitureCategories,
  ];

  // Continuous auto-scroll that resets seamlessly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = prev + 1;

        // When we reach the second set of categories, seamlessly reset to first set
        if (nextSlide >= furnitureCategories.length * 2) {
          // Use timeout to reset position without transition
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentSlide(furnitureCategories.length); // Start of second set
            setTimeout(() => setIsTransitioning(true), 50);
          }, 600);
        }

        return nextSlide;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [furnitureCategories.length]);

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
    // Always navigate to the middle set + index for smooth operation
    setCurrentSlide(furnitureCategories.length + index);
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      if (prev <= furnitureCategories.length) {
        // If we're at the beginning of middle set, jump to end of middle set
        return furnitureCategories.length + furnitureCategories.length - 1;
      }
      return prev - 1;
    });
  };

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      const nextSlide = prev + 1;
      if (nextSlide >= furnitureCategories.length * 2) {
        // Reset to start of middle set
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentSlide(furnitureCategories.length);
          setTimeout(() => setIsTransitioning(true), 50);
        }, 600);
      }
      return nextSlide;
    });
  };

  const handleVisitWebsite = () => {
    window.open("https://hivibesinterio.in", "_blank", "noopener,noreferrer");
  };

  const handleCallNow = () => {
    window.open("tel:+919876543210", "_self");
  };

  // Calculate current dot index (always show position within original array)
  const currentDotIndex =
    (currentSlide - furnitureCategories.length + furnitureCategories.length) %
    furnitureCategories.length;

  return (
    <section
      id="furniture-partner-section"
      className={`fp-container ${isVisible ? "fp-visible" : ""}`}
    >
      <div className="fp-header">
        <div className="fp-badge">
          🤝 <span>Furniture Partner</span>
        </div>
        <h2 className="fp-title">Transform Your Home with HiVibes Interiors</h2>
        <p className="fp-subtitle">
          Premium furniture solutions for your dream property
        </p>
      </div>

      <div className="fp-slider-container">
        <div
          className="fp-slider"
          style={{
            transform: `translateX(-${currentSlide * 33.333}%)`,
            transition: isTransitioning
              ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "none",
          }}
        >
          {extendedCategories.map((category, index) => {
            // Determine if this card is in the active center position
            const isActive = index === currentSlide + 1;

            return (
              <div key={`${category.id}-${index}`} className="fp-slide">
                <div
                  className={`fp-card ${isActive ? "fp-card-active" : ""}`}
                  style={{
                    background: isActive ? category.gradient : "white",
                    color: isActive ? "white" : "#1e293b",
                  }}
                >
                  <div className="fp-card-header">
                    <div className="fp-card-icon">{category.image}</div>
                    <h3 className="fp-card-title">{category.name}</h3>
                  </div>

                  <p className="fp-card-description">{category.description}</p>

                  <div className="fp-features">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="fp-feature">
                        <span className="fp-checkmark">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="fp-card-footer">
                    <span className="fp-price">{category.price}</span>
                    <button
                      className="fp-explore-btn"
                      onClick={handleVisitWebsite}
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

      <div className="fp-controls">
        <button className="fp-nav-btn" onClick={handlePrevSlide}>
          ‹
        </button>

        <div className="fp-dots">
          {furnitureCategories.map((_, index) => (
            <div
              key={index}
              className={`fp-dot ${
                currentDotIndex === index ? "fp-dot-active" : ""
              }`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>

        <button className="fp-nav-btn" onClick={handleNextSlide}>
          ›
        </button>
      </div>

      <div className="fp-cta">
        <button className="fp-primary-btn" onClick={handleVisitWebsite}>
          🌐 Visit HiVibes Interiors
        </button>
        <button className="fp-secondary-btn" onClick={handleCallNow}>
          📞 Call Now
        </button>
      </div>
    </section>
  );
};

export default FurniturePartner;
