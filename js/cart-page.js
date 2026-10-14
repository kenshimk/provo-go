import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { Cart } from "./cart.js";
import { Order } from "./order.js";

const cart = Cart.load();

// Guardo el restaurante y el usuario aqui para usarlos al confirmar.
let restaurant = null;
let currentUser = null;

const itemsContainer = document.getElementById("cart-items");
const summary = document.getElementById("cart-summary");
const orderForm = document.getElementById("order-form");
const orderMessage = document.getElementById("order-message");


// Dibuja cada producto del carrito con sus botones de cantidad.
function renderCart() {
    itemsContainer.innerHTML = "";

    if (cart.items.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Your cart is empty.";
        itemsContainer.appendChild(empty);

        summary.classList.add("hidden");
        return;
    }

    summary.classList.remove("hidden");

    cart.items.forEach(function (item) {
        const row = document.createElement("article");
        row.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = "$" + item.price + " each";

        const controls = document.createElement("div");
        controls.className = "qty-controls";

        const less = document.createElement("button");
        less.className = "qty-button";
        less.textContent = "-";
        less.addEventListener("click", function () {
            cart.changeQuantity(item.id, item.quantity - 1);
            renderCart();
        });

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const more = document.createElement("button");
        more.className = "qty-button";
        more.textContent = "+";
        more.addEventListener("click", function () {
            cart.changeQuantity(item.id, item.quantity + 1);
            renderCart();
        });

        const remove = document.createElement("button");
        remove.className = "qty-button remove-button";
        remove.textContent = "Remove";
        remove.addEventListener("click", function () {
            cart.remove(item.id);
            renderCart();
        });

        controls.appendChild(less);
        controls.appendChild(quantity);
        controls.appendChild(more);
        controls.appendChild(remove);

        row.appendChild(name);
        row.appendChild(price);
        row.appendChild(controls);

        itemsContainer.appendChild(row);
    });

    renderSummary();
}

// Escribe el subtotal, el delivery y el total.
function renderSummary() {
    const subtotal = cart.getTotal();
    const deliveryFee = restaurant ? restaurant.deliveryFee : 0;

    document.getElementById("subtotal").textContent = "$" + subtotal;
    document.getElementById("delivery-fee").textContent = "$" + deliveryFee;
    document.getElementById("total").textContent = "$" + (subtotal + deliveryFee);
}

// Muestra un mensaje debajo del formulario.
function showMessage(text, isSuccess) {
    orderMessage.textContent = text;
    orderMessage.classList.remove("hidden");

    if (isSuccess) {
        orderMessage.classList.add("message-success");
    } else {
        orderMessage.classList.remove("message-success");
    }
}


// Al confirmar, armo el pedido y lo guardo en Firestore.
orderForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const address = document.getElementById("address").value;
    const button = document.getElementById("place-order");

    // Desactivo el boton para que no se mande el mismo pedido dos veces.
    button.disabled = true;

    try {
        const order = new Order(currentUser.uid, restaurant, cart, address);
        await addDoc(collection(db, "orders"), order.toFirestore(serverTimestamp()));

        cart.clear();
        window.location.href = "orders.html";
    } catch (error) {
        console.log("Order error:", error.code);
        showMessage("Could not place your order. Please try again.", false);
        button.disabled = false;
    }
});


// Si no hay sesion activa devuelve al login.
onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUser = user;
    document.body.classList.remove("checking");

    // Si hay productos, necesito el restaurante para saber el costo de envio.
    if (cart.restaurantId) {
        try {
            const snapshot = await getDoc(doc(db, "restaurants", cart.restaurantId));

            if (snapshot.exists()) {
                restaurant = snapshot.data();
                restaurant.id = snapshot.id;
            }
        } catch (error) {
            console.log("Error loading restaurant:", error.code);
        }
    }

    renderCart();
});
