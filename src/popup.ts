console.log("Popup loaded successfully!");

document.addEventListener("DOMContentLoaded", () => {
    const closePopupBtn = document.getElementById("closePopup");
    const loginBtn = document.getElementById("loginBtn");
    const navigateBtn = document.getElementById("navigate");

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

    if (navigateBtn) {
        navigateBtn.addEventListener("click", () => {
            window.location.href = chrome.runtime.getURL("popup/steel.html");
        });
    }
});