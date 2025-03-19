document.addEventListener("DOMContentLoaded", function () {
    function loadComponent(url, elementId) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    }

    function loadCSS(url) {
        if (!document.querySelector(`link[href="${url}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
        }
    }

    loadComponent("/header.html", "header-container");
    loadComponent("/footer.html", "footer-container");
    loadCSS("/header-footer.css"); // Подключаем стили для хедера и футера
});