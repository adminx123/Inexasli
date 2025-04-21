document.addEventListener("DOMContentLoaded", () => {
  // Handle both .tooltip and .tooltip1
  const tooltips = document.querySelectorAll(".tooltip, .tooltip1");

  tooltips.forEach((tooltip) => {
    const content = tooltip.querySelector(".tooltip-content, .tooltip1-content");
    const message = tooltip.getAttribute("data-tooltip");

    if (content && message) {
      content.textContent = message;

      // Click handler for both tooltip types
      tooltip.addEventListener("click", (e) => {
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

  // Handle .checkboxrow interactive elements (from income.js)
  const interactiveElements = document.querySelectorAll(
    ".checkboxrow input[type='number'], .checkboxrow label, .checkboxrow .checkbox-button-group input[type='checkbox']"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("click", (e) => {
      const row = element.closest(".checkboxrow");
      const tooltip = row.querySelector(".tooltip, .tooltip1");
      const content = tooltip ? tooltip.querySelector(".tooltip-content, .tooltip1-content") : null;

      // Remove active/show from all rows
      document.querySelectorAll(".checkboxrow").forEach(r => {
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

  // Close tooltips on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tooltip, .tooltip1, .checkboxrow")) {
      tooltips.forEach(tooltip => tooltip.classList.remove("show"));
      document.querySelectorAll(".checkboxrow").forEach(r => {
        r.classList.remove("active");
        const tooltip = r.querySelector(".tooltip, .tooltip1");
        if (tooltip) tooltip.classList.remove("show");
      });
    }
  });
});