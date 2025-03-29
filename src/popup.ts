console.log("Popup cargado");

document.addEventListener("DOMContentLoaded", () => {
    const closePopupBtn = document.getElementById("closePopup");
    const loginBtn = document.getElementById("loginBtn");

    if (closePopupBtn) {
        closePopupBtn.addEventListener("click", () => {
            window.close(); 
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            alert("Redirecting to login..."); 
        });
    }
});
