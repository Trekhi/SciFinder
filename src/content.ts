document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.querySelector("input[name='q']") as HTMLInputElement;

    if (searchBox) {
        searchBox.addEventListener("input", () => {
            chrome.storage.local.set({ lastSearch: searchBox.value });
        });

        // Guardar también cuando el usuario presiona Enter
        searchBox.addEventListener("change", () => {
            chrome.storage.local.set({ lastSearch: searchBox.value });
        });
    }
});

document.addEventListener("input", (event) => {
    const target = event.target;

    if (target instanceof HTMLInputElement && target.tagName === "INPUT" && (target.type === "text" || target.type === "search")) {
        const relevantAttributes = ["name", "id", "class", "placeholder", "aria-label", "title"];
        const isSearchField = relevantAttributes.some(attr => 
            target.hasAttribute(attr) && /q|search|query|buscar|find|term|keyword|autor/i.test(target.getAttribute(attr) || "")
        );

        if (isSearchField) {
            const searchText = target.value;
            chrome.runtime.sendMessage({ type: "searchText", text: searchText });
        }
    }
});
