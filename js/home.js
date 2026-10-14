import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { Cart } from "./cart.js";

// Guardo los restaurantes aqui para filtrarlos sin volver a consultar
// Firestore cada vez que el usuario toca una categoria.
let allRestaurants = [];
let currentCategory = "All";


// Trae el perfil del usuario para saludarlo por su nombre.
async function getUserProfile(userId) {
    const snapshot = await getDoc(doc(db, "users", userId));

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.data();
}

// Trae todos los restaurantes de Firestore.
async function getRestaurants() {
    const snapshot = await getDocs(collection(db, "restaurants"));
    const restaurants = [];

    snapshot.forEach(function (document) {
        const data = document.data();
        data.id = document.id;
        restaurants.push(data);
    });

    // Muestro primero los que estan abiertos. Number convierte true en 1 y
    // false en 0, asi la resta ordena los abiertos arriba.
    restaurants.sort(function (a, b) {
        return Number(b.isOpen) - Number(a.isOpen);
    });

    return restaurants;
}

// Arma la lista de categorias sin repetir, sacada de los restaurantes.
function getCategories(restaurants) {
    const categories = ["All"];

    restaurants.forEach(function (restaurant) {
        restaurant.categories.forEach(function (category) {
            // Solo la agrego si no estaba ya en la lista.
            if (!categories.includes(category)) {
                categories.push(category);
            }
        });
    });

    return categories;
}

// Dibuja los botones de categoria arriba de la lista.
function renderChips(categories) {
    const container = document.getElementById("chips");
    container.innerHTML = "";

    categories.forEach(function (category) {
        const chip = document.createElement("button");
        chip.className = "chip";
        chip.textContent = category;

        if (category === currentCategory) {
            chip.classList.add("chip-active");
        }

        chip.addEventListener("click", function () {
            currentCategory = category;
            renderChips(categories);
            renderRestaurants(filterRestaurants(allRestaurants, category));
        });

        container.appendChild(chip);
    });
}

// Deja solo los restaurantes de la categoria elegida.
function filterRestaurants(restaurants, category) {
    if (category === "All") {
        return restaurants;
    }

    return restaurants.filter(function (restaurant) {
        return restaurant.categories.includes(category);
    });
}

// Dibuja las tarjetas de restaurante en la pagina.
function renderRestaurants(restaurants) {
    const container = document.getElementById("restaurant-list");
    container.innerHTML = "";

    if (restaurants.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No restaurants in this category yet.";
        container.appendChild(empty);
        return;
    }

    restaurants.forEach(function (restaurant) {
        const card = document.createElement("article");
        card.className = "restaurant-card";

        // La foto es opcional. Si el restaurante no tiene campo image, la
        // tarjeta se dibuja igual pero sin portada.
        if (restaurant.image) {
            const photo = document.createElement("img");
            photo.className = "restaurant-image";
            photo.src = restaurant.image;
            photo.alt = restaurant.name;
            photo.loading = "lazy";
            card.appendChild(photo);
        }

        const body = document.createElement("div");
        body.className = "restaurant-body";

        const title = document.createElement("h3");
        title.textContent = restaurant.name;

        if (!restaurant.isOpen) {
            const badge = document.createElement("span");
            badge.className = "badge-closed";
            badge.textContent = "Closed";
            title.appendChild(badge);
        }

        const info = document.createElement("p");
        info.textContent = restaurant.categories.join(", ") + " · " + restaurant.deliveryTime;

        const fee = document.createElement("p");
        fee.textContent = "Delivery $" + restaurant.deliveryFee;

        body.appendChild(title);
        body.appendChild(info);
        body.appendChild(fee);
        card.appendChild(body);

        // Al tocar la tarjeta, abre el menu de ese restaurante.
        card.addEventListener("click", function () {
            window.location.href = "restaurant.html?id=" + restaurant.id;
        });

        container.appendChild(card);
    });
}


// Si no hay sesion activa, devuelve al login.
onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.body.classList.remove("checking");

    // Muestro cuantas cosas hay en el carrito sin tener que entrar a el.
    const cart = Cart.load();
    document.getElementById("cart-link").textContent = "Cart (" + cart.getCount() + ")";

    try {
        const profile = await getUserProfile(user.uid);

        // Saludo con el primer nombre. split corta el nombre completo por los
        // espacios y me quedo con la primera parte.
        if (profile && profile.fullName) {
            const firstName = profile.fullName.split(" ")[0];
            document.getElementById("greeting").textContent = "Hey " + firstName + ", what are you craving?";
        }

        allRestaurants = await getRestaurants();

        renderChips(getCategories(allRestaurants));
        renderRestaurants(allRestaurants);
    } catch (error) {
        console.log("Error loading home:", error.code);
    }
});

// Cierra la sesion antes de volver al login.
const signoutLink = document.getElementById("signout");

signoutLink.addEventListener("click", async function (event) {
    event.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
});
