/**
 * Tooltip utility that can be used globally or for specific containers
 */

// Inject tooltip CSS styles
function injectTooltipStyles() {
  // Check if styles are already injected
  if (document.getElementById('tooltip-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'tooltip-styles';
  style.textContent = `
    /* Tooltip Styles */
    .tooltip {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .tooltip-content {
      visibility: hidden;
      opacity: 0;
      position: absolute;
      background-color: #333;
      color: white;
      text-align: center;
      border-radius: 6px;
      padding: 8px 12px;
      z-index: 1000;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 14px;
      transition: opacity 0.3s, visibility 0.3s;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .tooltip-content::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #333 transparent transparent transparent;
    }

    .tooltip-content.show {
      visibility: visible;
      opacity: 1;
    }

    /* Tooltip1 Styles (for headings) */
    .tooltip1 {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .tooltip1-content {
      visibility: hidden;
      opacity: 0;
      position: absolute;
      background-color: #333;
      color: white;
      text-align: left;
      border-radius: 6px;
      padding: 12px 16px;
      z-index: 1000;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      max-width: 300px;
      width: max-content;
      font-size: 14px;
      line-height: 1.4;
      transition: opacity 0.3s, visibility 0.3s;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-top: 8px;
    }

    .tooltip1-content::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent #333 transparent;
    }

    .tooltip1-content.show {
      visibility: visible;
      opacity: 1;
    }
  `;

  document.head.appendChild(style);
}

// Function to initialize tooltips for a specific container or document
function initializeTooltips(container = document) {
  console.log("[ToolTip] Initializing tooltips for container:", container);
  
  // Check if already initialized to prevent double initialization
  if (container._tooltipInitialized) {
    console.log("[ToolTip] Container already initialized, skipping");
    return { cleanup: function() {} };
  }
  
  // Mark as initialized
  container._tooltipInitialized = true;
  
  // Inject CSS styles first
  injectTooltipStyles();
  
  // Handle both .tooltip and .tooltip1
  const tooltips = container.querySelectorAll(".tooltip, .tooltip1");
  console.log("[ToolTip] Found", tooltips.length, "tooltip elements");

  tooltips.forEach((tooltip) => {
    const content = tooltip.querySelector(".tooltip-content, .tooltip1-content");
    const message = tooltip.getAttribute("data-tooltip");

    if (content && message) {
      content.textContent = message;
      console.log("[ToolTip] Setting up tooltip with message:", message.substring(0, 50) + "...");

      // Clear any existing handlers and add new one
      tooltip.onclick = null;
      tooltip.addEventListener("click", function tooltipClickHandler(e) {
        console.log("[ToolTip] Tooltip clicked:", tooltip);
        
        // Toggle this tooltip content
        const isCurrentlyShown = content.classList.contains("show");
        
        // Hide all tooltip contents first
        tooltips.forEach((otherTooltip) => {
          const otherContent = otherTooltip.querySelector(".tooltip-content, .tooltip1-content");
          if (otherContent) {
            otherContent.classList.remove("show");
            otherContent.style.left = '';
            otherContent.style.transform = '';
          }
        });

        // Show this tooltip content if it wasn't already shown
        if (!isCurrentlyShown) {
          content.classList.add("show");
          
          // Position the content
          setTimeout(() => {
            const contentRect = content.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            if (contentRect.left < 0) {
              content.style.left = '0';
              content.style.transform = 'translateX(0)';
            } else if (contentRect.right > viewportWidth) {
              content.style.left = '100%';
              content.style.transform = 'translateX(-100%)';
            } else {
              content.style.left = '50%';
              content.style.transform = 'translateX(-50%)';
            }
          }, 10);
        }

        e.stopPropagation();
      });
    } else {
      console.warn("[ToolTip] Tooltip missing content or message:", tooltip, "content:", content, "message:", message);
    }
  });

  // Handle .checkboxrow interactive elements
  const interactiveElements = container.querySelectorAll(
    ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox'], .checkboxrow [data-frequency-id]"
  );
  console.log("[ToolTip] Found", interactiveElements.length, "interactive elements in checkboxrows");

  interactiveElements.forEach((element) => {
    // Clear any existing handlers and add new one
    element.onclick = null;
    element.addEventListener("click", function elementClickHandler(e) {
      console.log("[ToolTip] Interactive element clicked:", element);
      
      const row = element.closest(".checkboxrow");
      const tooltip = row ? row.querySelector(".tooltip, .tooltip1") : null;
      const content = tooltip ? tooltip.querySelector(".tooltip-content, .tooltip1-content") : null;

      // Remove active/show from all rows in this container
      container.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const otherTooltip = r.querySelector(".tooltip, .tooltip1");
        if (otherTooltip) {
          const otherContent = otherTooltip.querySelector(".tooltip-content, .tooltip1-content");
          if (otherContent) otherContent.classList.remove("show");
        }
      });

      if (row) {
        row.classList.add("active");
        console.log("[ToolTip] Activated row:", row);
      }

      if (tooltip && content) {
        content.classList.add("show");
        console.log("[ToolTip] Showing tooltip content for row:", content);
        
        // Position the content
        setTimeout(() => {
          const contentRect = content.getBoundingClientRect();
          const viewportWidth = window.innerWidth;

          if (contentRect.left < 0) {
            content.style.left = '0';
            content.style.transform = 'translateX(0)';
          } else if (contentRect.right > viewportWidth) {
            content.style.left = '100%';
            content.style.transform = 'translateX(-100%)';
          } else {
            content.style.left = '50%';
            content.style.transform = 'translateX(-50%)';
          }
        }, 10);
      }

      e.stopPropagation();
    });
  });

  // Remove existing document click handler if already set up for this container
  if (container._tooltipOutsideClickHandler) {
    document.removeEventListener("click", container._tooltipOutsideClickHandler);
  }

  // Close tooltips on outside click
  const outsideClickHandler = function(e) {
    if (!e.target.closest(".tooltip, .tooltip1, .checkboxrow")) {
      tooltips.forEach(tooltip => {
        const content = tooltip.querySelector(".tooltip-content, .tooltip1-content");
        if (content) content.classList.remove("show");
      });
      container.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const tooltip = r.querySelector(".tooltip, .tooltip1");
        if (tooltip) {
          const content = tooltip.querySelector(".tooltip-content, .tooltip1-content");
          if (content) content.classList.remove("show");
        }
      });
    }
  };
  
  document.addEventListener("click", outsideClickHandler);
  
  // Store the handler reference for potential cleanup
  container._tooltipOutsideClickHandler = outsideClickHandler;

  return {
    cleanup: function() {
      document.removeEventListener("click", container._tooltipOutsideClickHandler);
    }
  };
}

// Make the function available globally for both module and non-module loading
window.initializeTooltips = initializeTooltips;
window.injectTooltipStyles = injectTooltipStyles;
console.log("[ToolTip] Script loaded, functions available on window object");

// Export for ES modules (only if module loading is supported)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeTooltips, injectTooltipStyles };
}