document.addEventListener("DOMContentLoaded", () => {
  const tooltips = document.querySelectorAll(".tooltip1");

  tooltips.forEach((tooltip) => {
    const content = tooltip.querySelector(".tooltip1-content");
    const message = tooltip.getAttribute("data-tooltip");

    content.textContent = message;

    tooltip.addEventListener("click", () => {
      tooltip.classList.toggle("show");

      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      tooltips.forEach((otherTooltip) => {
        if (otherTooltip !== tooltip) {
          otherTooltip.classList.remove("show");
          const otherContent = otherTooltip.querySelector(".tooltip1-content");
          if (otherContent) {
            otherContent.style.left = '';
            otherContent.style.transform = '';
          }
        }
      });

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
    });

    document.addEventListener("click", (e) => {
      if (!tooltip.contains(e.target)) {
        tooltip.classList.remove("show");
      }
    });
  });
});