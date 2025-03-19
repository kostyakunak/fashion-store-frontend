import { useEffect, useState } from "react";
import "../components/static/header-footer.css"; // Подключаем стили

export function Footer() {
    const [footer, setFooter] = useState("");

    useEffect(() => {
        async function loadFooter() {
            try {
                const response = await fetch("/footer.html");
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.text();
                setFooter(data);
            } catch (error) {
                console.error("Error loading footer:", error);
            }
        }

        loadFooter();
    }, []);

    return <footer dangerouslySetInnerHTML={{ __html: footer }} />;
}