// La clase Order representa un pedido listo para guardarse. Toma lo que hay
// en el carrito y le agrega lo que falta: quien pide, a donde va y cuanto
// cuesta en total con el delivery incluido.

export class Order {

    constructor(userId, restaurant, cart, address) {
        this.userId = userId;
        this.restaurantId = restaurant.id;
        this.restaurantName = restaurant.name;
        this.items = cart.items;
        this.subtotal = cart.getTotal();
        this.deliveryFee = restaurant.deliveryFee;
        this.total = this.subtotal + this.deliveryFee;
        this.address = address;

        // Todo pedido nace en el estado "received". Despues el restaurante
        // lo pasa a preparing, on the way y delivered.
        this.status = "received";
    }

    // Arma el objeto tal como se va a guardar en Firestore. La fecha se
    // recibe de afuera porque la pone el servidor, no el navegador.
    toFirestore(timestamp) {
        return {
            userId: this.userId,
            restaurantId: this.restaurantId,
            restaurantName: this.restaurantName,
            items: this.items,
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            total: this.total,
            address: this.address,
            status: this.status,
            createdAt: timestamp
        };
    }
}
