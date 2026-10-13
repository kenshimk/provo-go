// La clase Cart representa el carrito de compras. Guarda los productos que
// el usuario eligio, sabe calcular su propio total y se guarda solo en el
// navegador para que no se pierda al cambiar de pagina.

// Nombre con el que se guarda el carrito en el navegador.
const STORAGE_KEY = "provogo-cart";

export class Cart {

    // El constructor se ejecuta al crear un carrito nuevo.
    constructor(restaurantId, items) {
        // De cual restaurante es el pedido. Un pedido no puede mezclar
        // comida de dos restaurantes distintos.
        this.restaurantId = restaurantId || null;
        this.items = items || [];
    }

    // Agrega un producto al carrito. Si ya estaba, solo sube la cantidad.
    add(product, restaurantId) {
        // Si el carrito ya tiene comida de otro restaurante, lo vacio.
        if (this.restaurantId !== null && this.restaurantId !== restaurantId) {
            this.items = [];
        }

        this.restaurantId = restaurantId;

        // find recorre la lista y devuelve el primer producto que coincida.
        const existing = this.items.find(function (item) {
            return item.id === product.id;
        });

        if (existing) {
            existing.quantity = existing.quantity + 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        this.save();
    }

    // Saca un producto del carrito completo, sin importar la cantidad.
    remove(productId) {
        // filter arma una lista nueva solo con los que cumplen la condicion.
        this.items = this.items.filter(function (item) {
            return item.id !== productId;
        });

        // Si el carrito quedo vacio tambien olvido de que restaurante era.
        if (this.items.length === 0) {
            this.restaurantId = null;
        }

        this.save();
    }

    // Cambia la cantidad de un producto. Si baja a cero, lo saca.
    changeQuantity(productId, quantity) {
        if (quantity < 1) {
            this.remove(productId);
            return;
        }

        const item = this.items.find(function (item) {
            return item.id === productId;
        });

        if (item) {
            item.quantity = quantity;
            this.save();
        }
    }

    // Suma el precio por la cantidad de cada producto.
    getTotal() {
        let total = 0;

        this.items.forEach(function (item) {
            total = total + (item.price * item.quantity);
        });

        return total;
    }

    // Cuantos productos hay en total, contando las cantidades.
    getCount() {
        let count = 0;

        this.items.forEach(function (item) {
            count = count + item.quantity;
        });

        return count;
    }

    // Vacia el carrito. Se usa despues de confirmar un pedido.
    clear() {
        this.items = [];
        this.restaurantId = null;
        this.save();
    }

    // Guarda el carrito en el navegador convertido a texto.
    save() {
        const data = {
            restaurantId: this.restaurantId,
            items: this.items
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Metodo static: pertenece a la clase, no a un carrito en particular.
    // Se usa como Cart.load() para recuperar el carrito guardado.
    static load() {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return new Cart();
        }

        const data = JSON.parse(saved);
        return new Cart(data.restaurantId, data.items);
    }
}
