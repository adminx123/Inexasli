document.querySelector('#TERMS_MODAL_OPEN').addEventListener('click', ()=> {
    const modal = document.querySelector('#TERMS-modal');
    modal.style.display = 'block';

    const tooltips = document.querySelectorAll(".tooltip");
    tooltips.forEach(tooltip => {
        tooltip.classList.add("show");
    });

    // Close modal on Escape key
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            tooltips.forEach(tooltip => {
                tooltip.classList.remove("show");
            });
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Close modal when clicking outside
    const handleClickOutside = (event) => {
        if (!modal.contains(event.target) && event.target !== document.querySelector('#TERMS_MODAL_OPEN')) {
            modal.style.display = 'none';
            tooltips.forEach(tooltip => {
                tooltip.classList.remove("show");
            });
            document.removeEventListener('click', handleClickOutside);
        }
    };
    document.addEventListener('click', handleClickOutside);
});