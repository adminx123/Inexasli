document.addEventListener("DOMContentLoaded", () => {
  const tooltips = document.querySelectorAll(".tooltip");

  tooltips.forEach((tooltip) => {
    const content = tooltip.querySelector(".tooltip-content");
    const message = tooltip.getAttribute("data-tooltip");

    content.textContent = message;

    // tooltip show
    tooltip.addEventListener("click", () => {
      tooltip.classList.toggle("show");

      const contentRect = content.getBoundingClientRect()
      const viewportWidth = window.innerWidth;

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

    // tooltip hide
    document.addEventListener("click", (e) => {
      if (!tooltip.contains(e.target)) {
        tooltip.classList.remove("show");
      }
    });


    



  });
});
