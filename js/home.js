import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Trae todos los restaurantes de Firestore
async function getRestaurants() {
    const snapshot = await getDocs(collection(db, "restaurants"));
    const restaurants = [];

    snapshot.forEach(function (document) {
        const data = document.data();
        data.id = document.id;
        restaurants.push(data);
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