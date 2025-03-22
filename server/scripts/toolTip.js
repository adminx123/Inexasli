document.addEventListener("DOMContentLoaded", () => {
  const tooltips = document.querySelectorAll(".tooltip");

  tooltips.forEach((tooltip) => {
    const content = tooltip.querySelector(".tooltip-content");
    const message = tooltip.getAttribute("data-tooltip");
    const parentRow = tooltip.closest(".checkboxrow"); // Find the parent .checkboxrow

    content.textContent = message;

    // Tooltip show only when parent .checkboxrow is active
    tooltip.addEventListener("click", () => {
      if (parentRow && parentRow.classList.contains("active")) { // Check if active
        tooltip.classList.toggle("show");

        const contentRect = content.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Hide other tooltips
        tooltips.forEach((otherTooltip) => {
          if (otherTooltip !== tooltip) {
            otherTooltip.classList.remove("show");
            const otherContent = otherTooltip.querySelector(".tooltip-content");
            if (otherContent) {
              otherContent.style.left = '';
              otherContent.style.transform = '';
            }
          }
        });

        // Position the tooltip
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
    });

    // Hide tooltip on outside click
    document.addEventListener("click", (e) => {
      if (!tooltip.contains(e.target)) {
        tooltip.classList.remove("show");
      }
    });
  });
});