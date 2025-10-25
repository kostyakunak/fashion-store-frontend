import { useEffect, useRef } from "react";

export default function ImageRoller() {
    const imagesRowRef = useRef(null);
    const modalRef = useRef(null);
    const modalImgRef = useRef(null);

    useEffect(() => {
        const imagesRow = imagesRowRef.current;
        if (!imagesRow) return;

        const cards = Array.from(imagesRow.getElementsByClassName("card-sizing"));
        const modal = modalRef.current;
        const modalImg = modalImgRef.current;
        const closeModal = document.getElementsByClassName("close")[0];

        function activateCard(index) {
            cards.forEach((card, i) => {
                card.classList.toggle("active", i === index);
                card.classList.toggle("inactive", i !== index);
            });
        }

        activateCard(0);

        cards.forEach((card, index) => {
            card.addEventListener("mouseenter", () => activateCard(index));
            card.addEventListener("click", () => {
                if (!modal || !modalImg) return;
                modal.style.display = "flex";
                modalImg.src = card.getElementsByTagName("img")[0].src;
            });
        });

        if (closeModal) {
            closeModal.addEventListener("click", () => {
                if (modal) modal.style.display = "none";
            });
        }

        window.addEventListener("click", (e) => {
            if (modal && e.target === modal) {
                modal.style.display = "none";
            }
        });

        imagesRow.addEventListener("mouseleave", () => activateCard(0));

        return () => {
            window.removeEventListener("click", (e) => {
                if (modal && e.target === modal) {
                    modal.style.display = "none";
                }
            });
        };
    }, []);

    return { imagesRowRef, modalRef, modalImgRef };
}