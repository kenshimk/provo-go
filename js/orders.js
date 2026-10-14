import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Un pedido esta activo mientras no haya sido entregado.
const ACTIVE_STATUSES = ["received", "preparing", "on the way"];

// Guardo aqui todos los pedidos para no volver a pedirlos a Firestore
// cada vez que el usuario cambia de pestaña.
let allOrders = [];
let currentTab = "active";


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

// Separa los pedidos segun la pestaña elegida.
function filterOrders(orders, tab) {
    return orders.filter(function (order) {
        // includes devuelve true si el estado esta en la lista de activos.
        const isActive = ACTIVE_STATUSES.includes(order.status);
        return tab === "active" ? isActive : !isActive;
    });
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

// Elige la clase de color segun el estado del pedido.
function statusClass(status) {
    if (status === "delivered") {
        return "status-delivered";
    }
    if (status === "received") {
        return "status-received";
    }
    return "status-preparing";
}

// Dibuja la tarjeta de cada pedido con sus platos y su total.
function renderOrders(orders) {
    const container = document.getElementById("order-list");
    container.innerHTML = "";

    if (orders.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = currentTab === "active"
            ? "You have no active orders right now."
            : "You have no past orders yet.";
        container.appendChild(empty);
        return;
    }

    orders.forEach(function (order) {
        const card = document.createElement("article");
        card.className = "order-card order-card-link";

        const title = document.createElement("h3");
        title.textContent = order.restaurantName;

        const status = document.createElement("span");
        status.className = "badge-status " + statusClass(order.status);
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

        // Al tocar el pedido, abre su pantalla de seguimiento.
        card.addEventListener("click", function () {
            window.location.href = "order-confirmation.html?id=" + order.id;
        });

        container.appendChild(card);
    });
}

// Cambia de pestaña sin volver a consultar la base de datos.
function showTab(tab) {
    currentTab = tab;

    document.getElementById("tab-active").classList.toggle("tab-active", tab === "active");
    document.getElementById("tab-past").classList.toggle("tab-active", tab === "past");

    renderOrders(filterOrders(allOrders, tab));
}


document.getElementById("tab-active").addEventListener("click", function () {
    showTab("active");
});

document.getElementById("tab-past").addEventListener("click", function () {
    showTab("past");
});


// Si no hay sesion activa devuelve al login.
onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.body.classList.remove("checking");

    try {
        allOrders = await getOrders(user.uid);
        showTab("active");
    } catch (error) {
        console.log("Error loading orders:", error.code);
    }
});
