import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Leo cual pedido mostrar desde la direccion de la pagina.
// Ejemplo: order-confirmation.html?id=jiqil5rC1icRFI9CIlXT
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

// Los cuatro estados por los que pasa un pedido, en orden.
const STEPS = [
    { key: "received", label: "Order received" },
    { key: "preparing", label: "Restaurant is preparing it" },
    { key: "on the way", label: "On the way to you" },
    { key: "delivered", label: "Delivered" }
];


// Trae un pedido por su id de documento.
async function getOrder(id) {
    const snapshot = await getDoc(doc(db, "orders", id));

    if (!snapshot.exists()) {
        return null;
    }

    const data = snapshot.data();
    data.id = snapshot.id;
    return data;
}

// Dibuja la barra de progreso. Marca como completados los pasos hasta el
// estado real que tiene el pedido en la base de datos, no uno inventado.
function renderProgress(status) {
    const container = document.getElementById("progress");
    container.innerHTML = "";

    // findIndex devuelve la posicion del paso que coincide con el estado.
    const currentIndex = STEPS.findIndex(function (step) {
        return step.key === status;
    });

    STEPS.forEach(function (step, index) {
        const row = document.createElement("div");
        row.className = "progress-step";

        if (index < currentIndex) {
            row.classList.add("step-done");
        } else if (index === currentIndex) {
            row.classList.add("step-current");
        }

        const dot = document.createElement("span");
        dot.className = "step-dot";

        const label = document.createElement("span");
        label.textContent = step.label;

        row.appendChild(dot);
        row.appendChild(label);
        container.appendChild(row);
    });
}

// Escribe el detalle del pedido debajo de la barra.
function renderDetail(order) {
    const container = document.getElementById("order-detail");
    container.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = order.restaurantName;

    const address = document.createElement("p");
    address.className = "order-date";
    address.textContent = "Delivering to " + order.address;

    const list = document.createElement("ul");
    list.className = "order-items";

    order.items.forEach(function (item) {
        const line = document.createElement("li");
        line.textContent = item.quantity + " x " + item.name;
        list.appendChild(line);
    });

    const total = document.createElement("p");
    total.className = "order-total";
    total.textContent = "Total $" + order.total;

    container.appendChild(title);
    container.appendChild(address);
    container.appendChild(list);
    container.appendChild(total);
}


// Si no hay sesion activa devuelve al login.
onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Sin id no hay pedido que mostrar.
    if (!orderId) {
        window.location.href = "orders.html";
        return;
    }

    document.body.classList.remove("checking");

    try {
        const order = await getOrder(orderId);

        if (!order) {
            window.location.href = "orders.html";
            return;
        }

        document.getElementById("confirmation-text").textContent =
            "We sent your order to " + order.restaurantName + ". You can follow it here.";

        renderProgress(order.status);
        renderDetail(order);
    } catch (error) {
        console.log("Error loading order:", error.code);
    }
});
