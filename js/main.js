import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Referencias a los elementos que necesito controlar
const tabSignin = document.getElementById("tab-signin");
const tabSignup = document.getElementById("tab-signup");
const formSignin = document.getElementById("form-signin");
const formSignup = document.getElementById("form-signup");

// Muestra el formulario de login y marca su pestaña
function showLogin() {
    formSignin.classList.remove("hidden");
    formSignup.classList.add("hidden");
    tabSignin.classList.add("tab-active");
    tabSignup.classList.remove("tab-active");
}

// Muestra el formulario de registro y marca su pestaña
function showSignup() {
    formSignup.classList.remove("hidden");
    formSignin.classList.add("hidden");
    tabSignup.classList.add("tab-active");
    tabSignin.classList.remove("tab-active");
}

// Cada pestaña llama a su funcion al hacer clic
tabSignin.addEventListener("click", showLogin);
tabSignup.addEventListener("click", showSignup);

// Registro de un usuario nuevo en Firebase Authentication
formSignup.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created:", credential.user.uid);
        window.location.href = "home.html";
    } catch (error) {
        console.log("Signup error:", error.code);
    }
});

// Inicio de sesion con correo y contraseña
formSignin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in:", credential.user.uid);
        window.location.href = "home.html";
    } catch (error) {
        console.log("Login error:", error.code);
    }
});