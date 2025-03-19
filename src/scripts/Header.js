import { useEffect, useState } from "react";
import "../components/static/header-footer.css"; // Подключаем стили

export function Header() {
    const [header, setHeader] = useState("");

    useEffect(() => {
        async function loadHeader() {
            try {
                const response = await fetch("/header.html");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.text();
                setHeader(data);
            } catch (error) {
                console.error("Error loading header:", error);
            }
        }

        loadHeader();
    }, []);

    return <header dangerouslySetInnerHTML={{ __html: header }} />;
}