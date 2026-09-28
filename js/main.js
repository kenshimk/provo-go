import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Referencias a los elementos que necesito controlar
const formTitle = document.querySelector("h1");
const tabSignin = document.getElementById("tab-signin");
const tabSignup = document.getElementById("tab-signup");
const formSignin = document.getElementById("form-signin");
const formSignup = document.getElementById("form-signup");
const signinMessage = document.getElementById("signin-message");
const signupMessage = document.getElementById("signup-message");

// Traduce los codigos de error de Firebase a mensajes que el usuario entienda
function getErrorMessage(code) {
    switch (code) {
        case "auth/email-already-in-use":
            return "That email is already registered. Try signing in instead.";
        case "auth/invalid-email":
            return "Enter a valid email address.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/invalid-credential":
            return "Wrong email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Wait a moment and try again.";
        case "auth/network-request-failed":
            return "No connection. Check your internet and try again.";
        default:
            return "Something went wrong. Please try again.";
    }
}

// Muestra el mensaje de error en el formulario que corresponda
function showError(element, code) {
    element.textContent = getErrorMessage(code);
    element.classList.remove("hidden");
}

// Oculta el mensaje
function hideMessage(element) {
    element.classList.add("hidden");
}

// Muestra el formulario de login y marca su pestaña
function showLogin() {
    formSignin.classList.remove("hidden");
    formSignup.classList.add("hidden");
    tabSignin.classList.add("tab-active");
    tabSignup.classList.remove("tab-active");
    formTitle.textContent = "Welcome back";
}

// Muestra el formulario de registro y marca su pestaña
function showSignup() {
    formSignup.classList.remove("hidden");
    formSignin.classList.add("hidden");
    tabSignup.classList.add("tab-active");
    tabSignin.classList.remove("tab-active");
    formTitle.textContent = "Create your account";
}

// Cada pestaña llama a su funcion al hacer clic
tabSignin.addEventListener("click", showLogin);
tabSignup.addEventListener("click", showSignup);

// Registro de un usuario nuevo en Firebase Authentication
formSignup.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage(signupMessage);

    const fullName = document.getElementById("fullname").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        // Guardo el perfil en Firestore usando el uid de Authentication como ID
        // del documento, para que las dos cosas queden enlazadas.
        await setDoc(doc(db, "users", credential.user.uid), {
            fullName: fullName,
            phone: phone,
            email: email,
            role: "customer",
            createdAt: serverTimestamp()
        });

        console.log("User created:", credential.user.uid);
        window.location.href = "home.html";
    } catch (error) {
        console.log("Signup error:", error.code);
        showError(signupMessage, error.code);
    }
});

// Inicio de sesion con correo y contraseña
formSignin.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage(signinMessage);

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in:", credential.user.uid);
        window.location.href = "home.html";
    } catch (error) {
        console.log("Login error:", error.code);
        showError(signinMessage, error.code);
    }
});