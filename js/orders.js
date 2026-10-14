import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Trae solo los pedidos del usuario que tiene la sesion abierta.
async function getOrders(userId) {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const orders = [];

    snapshot.forEach(function (document) {
        const data = document.data();
        data.id = document.id;
        orders.push(data);
    });

    // Ordeno del mas nuevo al mas viejo aqui en el navegador. Hacerlo en la
    // consulta obligaria a crear un indice en Firestore y para esta cantidad
    // de pedidos no hace falta.
    orders.sort(function (a, b) {
        if (!a.createdAt) {
            return -1;
        }
        if (!b.createdAt) {
            return 1;
        }
        return b.createdAt.seconds - a.createdAt.seconds;
    });

    return orders;
}

// Convierte la fecha de Firestore a algo legible.
function formatDate(timestamp) {
    if (!timestamp) {
        return "Just now";
    }

    return timestamp.toDate().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit"
    });
}

// Dibuja la tarjeta de cada pedido con sus platos y su total.
function renderOrders(orders) {
    const container = document.getElementById("order-list");
    container.innerHTML = "";

    if (orders.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "You have no orders yet.";
        container.appendChild(empty);
        return;
    }

    orders.forEach(function (order) {
        const card = document.createElement("article");
        card.className = "order-card";

        const title = document.createElement("h3");
        title.textContent = order.restaurantName;

        const status = document.createElement("span");
        status.className = "badge-status";
        status.textContent = order.status;
        title.appendChild(status);

        const date = document.createElement("p");
        date.className = "order-date";
        date.textContent = formatDate(order.createdAt);

        const list = document.createElement("ul");
        list.className = "order-items";

        order.items.forEach(function (item) {
            const line = document.createElement("li");
            line.textContent = item.quantity + " x " + item.name;
            list.appendChild(line);
        });

        const address = document.createElement("p");
        address.className = "order-date";
        address.textContent = "To: " + order.address;

        const total = document.createElement("p");
        total.className = "order-total";
        total.textContent = "Total $" + order.total;

        card.appendChild(title);
        card.appendChild(date);
        card.appendChild(list);
        card.appendChild(address);
        card.appendChild(total);

        container.appendChild(card);
    });
}


// Si no hay sesion activa devuelve al login.
onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.body.classList.remove("checking");

    try {
        const orders = await getOrders(user.uid);
        renderOrders(orders);
    } catch (error) {
        console.log("Error loading orders:", error.code);
    }
});
