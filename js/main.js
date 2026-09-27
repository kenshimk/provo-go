// Referencias a los elementos que necesito controlar
const tabSignin = document.getElementById("tab-signin");
const tabSignup = document.getElementById("tab-signup");
const formSignin = document.getElementById("form-signin");
const formSignup = document.getElementById("form-signup");

// Muestra el formulario de login y marca su pestaña
function mostrarLogin() {
    formSignin.classList.remove("hidden");
    formSignup.classList.add("hidden");
    tabSignin.classList.add("tab-active");
    tabSignup.classList.remove("tab-active");
}

// Muestra el formulario de registro y marca su pestaña
function mostrarRegistro() {
    formSignup.classList.remove("hidden");
    formSignin.classList.add("hidden");
    tabSignup.classList.add("tab-active");
    tabSignin.classList.remove("tab-active");
}

// Cada pestaña llama a su funcion al hacer clic
tabSignin.addEventListener("click", mostrarLogin);
tabSignup.addEventListener("click", mostrarRegistro);