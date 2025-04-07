import { API_CONFIG } from "./config.js";

console.log("Popup Steel loaded");

document.addEventListener("DOMContentLoaded", () => {
    const inputElement = document.querySelector<HTMLInputElement>("#searchInput");
    const contentDiv = document.querySelector(".content");
    const closePopupBtn = document.getElementById("closePopup");
    const goBackBtn = document.getElementById("goBack");
    const { OPENAI_API_KEY, ASSISTANT_ID } = API_CONFIG;

    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            window.location.href = "popup.html";
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener("click", () => {
            window.close();
        });
    }

    if (!inputElement || !contentDiv) return;

    // Cargar última búsqueda guardada
    loadLastSearch(inputElement, contentDiv, ASSISTANT_ID, OPENAI_API_KEY);

    // Detectar "Enter" para generar consultas
    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const searchQuery = inputElement.value.trim();
            if (searchQuery) {
                saveSearch(searchQuery);
                fetchBooleanQueries(searchQuery, contentDiv, ASSISTANT_ID, OPENAI_API_KEY);
            } else {
                contentDiv.innerHTML = "<p class='error'>⚠️ Write something before searching.</p>";
            }
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;

        if (target.classList.contains("copy-btn")) {
            const index = Array.from(document.querySelectorAll(".copy-btn")).indexOf(target);
            copyQuery(index);
        }
    });
});

/**
 * Guarda la última búsqueda en localStorage
 */
function saveSearch(searchText: string) {
    chrome.storage.local.set({ lastSearch: searchText });
}

/**
 * Carga la última búsqueda guardada
 */
function loadLastSearch(inputElement: HTMLInputElement, contentDiv: Element, ASSISTANT_ID: string, OPENAI_API_KEY: string) {
    chrome.storage.local.get("lastSearch", (data) => {
        if (data.lastSearch) {
            inputElement.value = data.lastSearch;
            fetchBooleanQueries(data.lastSearch, contentDiv, ASSISTANT_ID, OPENAI_API_KEY);
        }
    });
}

/**
 * Llama a la API de OpenAI para generar consultas booleanas
 */
async function fetchBooleanQueries(keyword: string, contentDiv: Element, ASSISTANT_ID: string, OPENAI_API_KEY: string) {

    contentDiv.innerHTML = `<p class='loading'>⏳ Generating queries...</p>`;

    try {
        // Crea un nuevo hilo
        const threadResponse = await fetch("https://api.openai.com/v1/threads", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            }
        });

        const threadData = await threadResponse.json();

        if (!threadResponse.ok) {
            throw new Error(`Error al crear el hilo: ${threadData.error?.message || "Desconocido"}`);
        }
        const threadId = threadData.id;

        if (!threadResponse.ok) throw new Error("Error al crear el hilo.");

        // Agrega mensaje del usuario al hilo
        await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify({
                role: "user",
                content: `${keyword}`
            })
        });

        // Ejecuta el asistente en el hilo
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2"
            },
            body: JSON.stringify({
                assistant_id: ASSISTANT_ID
            })
        });

        const runData = await runResponse.json();
        const runId = runData.id;

        if (!runResponse.ok) throw new Error("Error al ejecutar el asistente.");

        // Espera a que el asistente genere una respuesta
        let status = "queued";
        while (status === "queued" || status === "in_progress") {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de revisar el estado

            const checkRunResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "OpenAI-Beta": "assistants=v2"
                }
            });

            const checkRunData = await checkRunResponse.json();
            status = checkRunData.status;
        }

        if (status !== "completed") throw new Error("Error en la ejecución del asistente.");

        // Obtiene la respuesta del asistente
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "assistants=v2"
            }
        });

        const messagesData = await messagesResponse.json();
        const responseMessage = messagesData.data[messagesData.data.length - 2]?.content[0]?.text?.value || "⚠️ No se generaron consultas.";

        // Separa las consultas en una lista
        let queries = []

        queries = responseMessage.split("\n").filter((query: string) => query.trim() !== "");

        /*contentDiv.innerHTML = `
            ${queries.map((query: string, index: number) => `
                <div id="query-${index}" class="query-card">
                    <span class="query-text">${query}</span>
                    <button class="copy-btn">📋</button>
                </div>
            `).join('')}
        `;*/

        contentDiv.innerHTML = `
            ${queries.map((query: string, index: number) => {
            const parts = query.split(" - ");
            const queryText = parts[0].trim();
            const description = parts.slice(1).join(" - ").trim();

            return `
                <div id="query-${index}" class="query-card">
                    <div class="query-header">
                        <span class="query-text">${queryText}</span>
                        <button class="copy-btn" data-index="${index}">📋</button>
                        ${description
                    ? `<button class="toggle-btn" data-target="desc-${index}">💡</button>`
                    : ""
                }
                    </div>
                    ${description
                    ? `<div id="desc-${index}" class="query-description" style="display: none;">${description}</div>`
                    : ""
                }
                </div>
                `;
        }).join('')}
        `;

        document.querySelectorAll<HTMLButtonElement>('.toggle-btn').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                if (targetId) {
                    toggleDescription(targetId);
                }
            });
        });

    } catch (error) {
        console.error("Error al conectar con OpenAI:", error);
        contentDiv.innerHTML = `<p class='error'>⚠️ Error connecting.</p>`;
    }
}

/**
* Función que copia la consulta seleccionada al portapapeles
*/
async function copyQuery(index: number) {
    const queryElement = document.getElementById(`query-${index}`);
    if (!queryElement) return;

    let queryText = queryElement.innerText.trim();
    queryText = queryText.replace(/^\d+\.\s*/, ""); // Eliminar el número de la consulta
    queryText = queryText.replace(/📋$/, "").trim(); // Eliminar el botón de copiar

    if (!queryText) {
        console.error("There's no text to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(queryText);
        console.log("Copied query:", queryText);

        const button = document.querySelectorAll(".copy-btn")[index];
        button.innerHTML = "✅";
        button.classList.add("copied");

        setTimeout(() => {
            button.innerHTML = "📋";
            button.classList.remove("copied");
        }, 2000);

    } catch (error) {
        console.error("Error copying:", error);
    }
}

function toggleDescription(id: string): void {
    const descDiv = document.getElementById(id);
    if (descDiv) {
        descDiv.style.display = descDiv.style.display === "none" ? "block" : "none";
    }
}
