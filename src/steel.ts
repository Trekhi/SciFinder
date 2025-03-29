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
