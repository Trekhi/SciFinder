console.log("Popup Steel");

document.addEventListener("DOMContentLoaded", () => {
    const goBackBtn = document.getElementById("goBack");
    if (goBackBtn) {
        goBackBtn.addEventListener("click", () => {
            window.location.href = "popup.html";
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const closePopupBtn = document.getElementById("closePopup");

    if (closePopupBtn) {
        closePopupBtn.addEventListener("click", () => {
            window.close(); 
        });
    }

});

//OBTENCIÓN DE LA INFORMACIÓN DEL SEARCH PARA ENVIARSELA A CHAT-GPT
document.addEventListener("DOMContentLoaded", () => {
    const inputElement = document.querySelector<HTMLInputElement>(".search-bar input");
    const contentDiv = document.querySelector(".content"); 
  
    if (!inputElement || !contentDiv) return;
  //Al detectar un cambio llenar con esta información
    inputElement.addEventListener("input", () => {
      const inputValue = inputElement.value.trim();
      
      if (inputValue !== "") {
        contentDiv.innerHTML = `<p>Has escrito: <strong>${inputValue}</strong></p>`;
      } else {
        contentDiv.innerHTML = "<p>Por favor, escribe algo.</p>";
      }
    });
  });
  
  