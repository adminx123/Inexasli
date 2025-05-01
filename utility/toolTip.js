/**
 * Tooltip utility that can be used globally or for specific containers
 */

// Function to initialize tooltips for a specific container or document
function initializeTooltips(container = document) {
  // Handle both .tooltip and .tooltip1
  const tooltips = container.querySelectorAll(".tooltip, .tooltip1");

  tooltips.forEach((tooltip) => {
    const content = tooltip.querySelector(".tooltip-content, .tooltip1-content");
    const message = tooltip.getAttribute("data-tooltip");

    if (content && message) {
      content.textContent = message;

      // Remove existing event listener if any
      const oldClickHandler = tooltip.onclick;
      if (oldClickHandler) {
        tooltip.removeEventListener("click", oldClickHandler);
      }

      // Click handler for both tooltip types
      tooltip.addEventListener("click", function tooltipClickHandler(e) {
        tooltip.classList.toggle("show");
        const contentRect = content.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Hide other tooltips
        tooltips.forEach((otherTooltip) => {
          if (otherTooltip !== tooltip) {
            otherTooltip.classList.remove("show");
            const otherContent = otherTooltip.querySelector(".tooltip-content, .tooltip1-content");
            if (otherContent) {
              otherContent.style.left = '';
              otherContent.style.transform = '';
            }
          }
        });

        // Position content
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

        e.stopPropagation();
      });
    }
  });

  // Handle .checkboxrow interactive elements
  const interactiveElements = container.querySelectorAll(
    ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox'], .checkboxrow [data-frequency-id]"
  );

  interactiveElements.forEach((element) => {
    // Remove existing event listener if any
    const oldClickHandler = element.onclick;
    if (oldClickHandler) {
      element.removeEventListener("click", oldClickHandler);
    }

    element.addEventListener("click", function elementClickHandler(e) {
      const row = element.closest(".checkboxrow");
      const tooltip = row.querySelector(".tooltip, .tooltip1");
      const content = tooltip ? tooltip.querySelector(".tooltip-content, .tooltip1-content") : null;

      // Remove active/show from all rows in this container
      container.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const otherTooltip = r.querySelector(".tooltip, .tooltip1");
        if (otherTooltip) otherTooltip.classList.remove("show");
      });

      if (row) row.classList.add("active");

      if (tooltip && content) {
        tooltip.classList.add("show");
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
      tooltips.forEach(tooltip => tooltip.classList.remove("show"));
      container.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const tooltip = r.querySelector(".tooltip, .tooltip1");
        if (tooltip) tooltip.classList.remove("show");
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

// Initialize tooltips globally on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initializeTooltips(document);
});

// Make the function available globally
window.initializeTooltips = initializeTooltips;