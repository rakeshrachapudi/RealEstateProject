// src/animations.js

export const injectAnimations = () => {
    // Inject animations and hover effects into the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }

      .areaButton:hover {
        transform: translateY(-4px);
        border-color: #667eea;
        color: #667eea;
        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
      }

      div[style*="dropdownItem"]:hover {
        background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
        color: #4f46e5;
      }

      .userSection:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.25) !important;
      }
    `;
    document.head.appendChild(styleSheet);
};