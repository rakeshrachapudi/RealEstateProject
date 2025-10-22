// src/animations.js

export const injectAnimations = () => {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
      /* Keyframe animations */
      @keyframes float {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg) scale(1);
        }
        25% { 
          transform: translateY(-10px) rotate(2deg) scale(1.05);
        }
        50% { 
          transform: translateY(-20px) rotate(-2deg) scale(1.1);
        }
        75% { 
          transform: translateY(-10px) rotate(1deg) scale(1.05);
        }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }

      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes iconBounce {
        0% {
          transform: translateY(0) scale(1);
        }
        30% {
          transform: translateY(-5px) scale(1.1);
        }
        50% {
          transform: translateY(0) scale(1.05);
        }
        100% {
          transform: translateY(0) scale(1);
        }
      }

      @keyframes iconFloat {
        0%, 100% {
          transform: translateY(0) rotate(0);
        }
        25% {
          transform: translateY(-5px) rotate(5deg);
        }
        75% {
          transform: translateY(5px) rotate(-5deg);
        }
      }

      @keyframes logoFloat {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-3px);
        }
      }

      @keyframes dropdownSlide {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      @keyframes titleReveal {
        from {
          opacity: 0;
          transform: translateY(30px);
          letter-spacing: -1px;
        }
        to {
          opacity: 1;
          transform: translateY(0);
          letter-spacing: 0;
        }
      }

      @keyframes gradientShift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }

      @keyframes searchSlideUp {
        from {
          opacity: 0;
          transform: translateY(60px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes gridFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes buttonFadeIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes sectionReveal {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes tabActivate {
        from {
          transform: scaleX(0);
        }
        to {
          transform: scaleX(1);
        }
      }

      @keyframes emptyStateReveal {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes statsReveal {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes statCardReveal {
        from {
          opacity: 0;
          transform: translateY(30px) rotateX(-30deg);
        }
        to {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
      }

      @keyframes statIconPop {
        0% {
          transform: scale(0) rotate(-180deg);
        }
        50% {
          transform: scale(1.2) rotate(10deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      @keyframes numberCount {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes headerSlide {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes titleFade {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes shakeError {
        0%, 100% {
          transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
          transform: translateX(-5px);
        }
        20%, 40%, 60%, 80% {
          transform: translateX(5px);
        }
      }

      @keyframes countUp {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes gridReveal {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes waveAnimation {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      /* Hover effects with smooth transitions */
      .property-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(0);
      }

      .property-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.12);
      }

      .areaButton {
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .areaButton::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.1);
        transition: width 0.4s ease, height 0.4s ease;
        transform: translate(-50%, -50%);
      }

      .areaButton:hover::before {
        width: 100%;
        height: 100%;
      }

      .areaButton:hover {
        transform: translateY(-4px) scale(1.05);
        border-color: #667eea;
        color: #667eea;
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.25);
        background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
      }

      div[style*="dropdownItem"] {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      div[style*="dropdownItem"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.1), transparent);
        transition: left 0.5s ease;
      }

      div[style*="dropdownItem"]:hover::before {
        left: 100%;
      }

      div[style*="dropdownItem"]:hover {
        background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
        color: #4f46e5;
        transform: translateX(5px);
        padding-left: 20px;
      }

      .userSection {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .userSection:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.25) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      /* Button hover effects */
      button {
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      button::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
      }

      button:hover::after {
        width: 300px;
        height: 300px;
      }

      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      button:active {
        transform: translateY(0);
      }

      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      ::-webkit-scrollbar-track {
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        transition: background 0.3s ease;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      }

      /* Loading skeleton animation */
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      /* Stagger animation for list items */
      .stagger-item {
        opacity: 0;
        animation: fadeInUp 0.5s ease-out forwards;
      }

      .stagger-item:nth-child(1) { animation-delay: 0.1s; }
      .stagger-item:nth-child(2) { animation-delay: 0.2s; }
      .stagger-item:nth-child(3) { animation-delay: 0.3s; }
      .stagger-item:nth-child(4) { animation-delay: 0.4s; }
      .stagger-item:nth-child(5) { animation-delay: 0.5s; }
      .stagger-item:nth-child(6) { animation-delay: 0.6s; }
      .stagger-item:nth-child(7) { animation-delay: 0.7s; }
      .stagger-item:nth-child(8) { animation-delay: 0.8s; }
      .stagger-item:nth-child(9) { animation-delay: 0.9s; }
      .stagger-item:nth-child(10) { animation-delay: 1s; }

      /* Responsive animations */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Mobile specific animations */
      @media (max-width: 768px) {
        @keyframes mobileMenuSlide {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes mobileMenuFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .mobile-menu-item {
          opacity: 0;
          transform: translateX(-20px);
          animation: slideInLeft 0.3s ease-out forwards;
        }

        .mobile-menu-item:nth-child(1) { animation-delay: 0.1s; }
        .mobile-menu-item:nth-child(2) { animation-delay: 0.15s; }
        .mobile-menu-item:nth-child(3) { animation-delay: 0.2s; }
        .mobile-menu-item:nth-child(4) { animation-delay: 0.25s; }
        .mobile-menu-item:nth-child(5) { animation-delay: 0.3s; }
      }

      /* Parallax scrolling effect */
      .parallax {
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Text reveal animation */
      @keyframes textReveal {
        from {
          clip-path: inset(0 100% 0 0);
        }
        to {
          clip-path: inset(0 0 0 0);
        }
      }

      .text-reveal {
        animation: textReveal 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      /* Glow effect */
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
        }
        50% {
          box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
        }
      }

      .glow-effect {
        animation: glow 2s ease-in-out infinite;
      }

      /* Page transitions */
      .page-enter {
        opacity: 0;
        transform: translateY(20px);
      }

      .page-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .page-exit {
        opacity: 1;
        transform: translateY(0);
      }

      .page-exit-active {
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Focus visible styles for accessibility */
      *:focus-visible {
        outline: 2px solid #667eea;
        outline-offset: 2px;
        transition: outline-offset 0.2s ease;
      }

      *:focus-visible:hover {
        outline-offset: 4px;
      }

      /* Performance optimizations */
      .hardware-accelerated {
        transform: translateZ(0);
        will-change: transform;
        backface-visibility: hidden;
      }

      /* Responsive font scaling */
      @media (max-width: 1024px) {
        html {
          font-size: 15px;
        }
      }

      @media (max-width: 768px) {
        html {
          font-size: 14px;
        }
      }

      @media (max-width: 480px) {
        html {
          font-size: 13px;
        }
      }
    `;
  document.head.appendChild(styleSheet);
};
