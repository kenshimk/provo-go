import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { Cart } from "./cart.js";

// Leo el id del restaurante desde la direccion de la pagina.
// Ejemplo: restaurant.html?id=conch-shack
const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("id");

// Recupero el carrito guardado en el navegador.
const cart = Cart.load();


// Trae un solo restaurante por su id de documento.
async function getRestaurant(id) {
    const snapshot = await getDoc(doc(db, "restaurants", id));

    if (!snapshot.exists()) {
        return null;
    }

    const data = snapshot.data();
    data.id = snapshot.id;
    return data;
}

// Trae solo los productos cuyo restaurantId coincide con este restaurante.
async function getProducts(id) {
    const q = query(collection(db, "products"), where("restaurantId", "==", id));
    const snapshot = await getDocs(q);
    const products = [];

    snapshot.forEach(function (document) {
        const data = document.data();
        data.id = document.id;
        products.push(data);
    });

    return products;
}

// Escribe el nombre y los datos del restaurante arriba de la pagina.
function renderHeader(restaurant) {
    document.getElementById("restaurant-name").textContent = restaurant.name;

    const info = document.getElementById("restaurant-info");
    info.textContent = restaurant.categories.join(", ")
        + " · " + restaurant.deliveryTime
        + " · Delivery $" + restaurant.deliveryFee;
}

// Dibuja la tarjeta de cada plato con su boton de agregar.
function renderProducts(products) {
    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if (products.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "This restaurant has no items yet.";
        container.appendChild(empty);
        return;
    }

    products.forEach(function (product) {
        const card = document.createElement("article");
        card.className = "product-card";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const description = document.createElement("p");
        description.textContent = product.description;

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = "$" + product.price;

        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(price);

        if (product.available) {
            const button = document.createElement("button");
            button.className = "add-button";
            button.textContent = "Add";

            button.addEventListener("click", function () {
                // Si el carrito tiene comida de otro restaurante, aviso antes
                // de vaciarlo. Un pedido no puede venir de dos cocinas.
                if (cart.restaurantId !== null && cart.restaurantId !== restaurantId) {
                    const ok = confirm("Your cart has items from another restaurant. Adding this will empty it. Continue?");

                    if (!ok) {
                        return;
                    }
                }

                cart.add(product, restaurantId);
                updateCartLink();
            });

            card.appendChild(button);
        } else {
            const soldOut = document.createElement("span");
            soldOut.className = "badge-closed";
            soldOut.textContent = "Not available";
            card.appendChild(soldOut);
        }

        container.appendChild(card);
    });
}

// Actualiza el contador del carrito en la barra de arriba.
function updateCartLink() {
    document.getElementById("cart-link").textContent = "Cart (" + cart.getCount() + ")";
}


// Si no hay sesion activa devuelve al login. Si la hay, carga el menu.
onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Si entraron a esta pagina sin id, no hay nada que mostrar.
    if (!restaurantId) {
        window.location.href = "home.html";
        return;
    }

    document.body.classList.remove("checking");
    updateCartLink();

    try {
        const restaurant = await getRestaurant(restaurantId);

        if (!restaurant) {
            document.getElementById("restaurant-name").textContent = "Restaurant not found";
            return;
        }

        renderHeader(restaurant);

        const products = await getProducts(restaurantId);
        renderProducts(products);
    } catch (error) {
        console.log("Error loading menu:", error.code);
    }
});
