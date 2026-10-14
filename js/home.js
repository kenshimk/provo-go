import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { Cart } from "./cart.js";


// Trae todos los restaurantes de Firestore
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

// Dibuja las tarjetas de restaurante en la pagina
function renderRestaurants(restaurants) {
    const container = document.getElementById("restaurant-list");
    container.innerHTML = "";

    restaurants.forEach(function (restaurant) {
        const card = document.createElement("article");
        card.className = "restaurant-card";

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

        card.appendChild(title);
        card.appendChild(info);
        card.appendChild(fee);

        // Al tocar la tarjeta, abre el menu de ese restaurante.
        card.addEventListener("click", function () {
            window.location.href = "restaurant.html?id=" + restaurant.id;
        });

        container.appendChild(card);
    });
}


// Si no hay sesion activa, devuelve al login
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
        const restaurants = await getRestaurants();
        renderRestaurants(restaurants);
    } catch (error) {
        console.log("Error loading restaurants:", error.code);
    }
});

// Cierra la sesion antes de volver al login
const signoutLink = document.getElementById("signout");

signoutLink.addEventListener("click", async function (event) {
    event.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
});
