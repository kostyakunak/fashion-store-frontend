document.addEventListener('DOMContentLoaded', () => {
    const imagesRow = document.getElementById('imagesRow');
    const cards = Array.from(imagesRow.getElementsByClassName('card-sizing'));
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.getElementsByClassName('close')[0];

    function activateCard(index) {
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('active');
                card.classList.remove('inactive');
            } else {
                card.classList.add('inactive');
                card.classList.remove('active');
            }
        });
    }

    // Set the default active card
    activateCard(0);

    // Add hover listeners
    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => activateCard(index));
        card.addEventListener('click', () => {
            modal.style.display = 'flex';
            modalImg.src = card.getElementsByTagName('img')[0].src;
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal if clicked outside the image
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Reset to the first card if mouse leaves the row
    imagesRow.addEventListener('mouseleave', () => activateCard(0));
});