import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Si no hay sesion activa, devuelve al login
onAuthStateChanged(auth, function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    document.body.classList.remove("checking");
});

// Cierra la sesion antes de volver al login
const signoutLink = document.getElementById("signout");

signoutLink.addEventListener("click", async function (event) {
    event.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
});