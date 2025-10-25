import { useState, useRef } from "react";

export default function useImageModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [zoomBox, setZoomBox] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const modalRef = useRef(null);

    const openModal = (src) => {
        setImageSrc(src);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setZoomBox(false);
    };

    const toggleZoomBox = () => {
        setZoomBox(!zoomBox);
    };

    const updateZoomPosition = (e) => {
        if (!modalRef.current) return;
        const rect = modalRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Ограничение передвижения в пределах изображения
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        // Определение позиции увеличенного фона
        const backgroundX = (x / rect.width) * 100;
        const backgroundY = (y / rect.height) * 100;

        setZoomPosition({
            x,
            y,
            backgroundX,
            backgroundY
        });
    };

    return { isOpen, imageSrc, modalRef, openModal, closeModal, zoomBox, zoomPosition, toggleZoomBox, updateZoomPosition };
}
