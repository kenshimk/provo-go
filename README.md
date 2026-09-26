# Provo Go

App de delivery de comida para Providenciales, Islas Turcas y Caicos.

## El problema

No existe el delivery de comida en Providenciales. Para las personas que no tienen vehiculo o se les complica salir a comprar, conseguir comida a tiempo es dificil, y tampoco existe el transporte publico. Provo Go busca resolver eso: que la gente pueda pedir comida comodamente desde su casa o su trabajo, y que los restaurantes pequeños tengan un punto mas fuerte en sus ventas al agregar delivery.

## Estado actual

Pantallas de login y catalogo de restaurantes maquetadas. El login todavia no autentica, solo navega entre paginas. Los restaurantes estan escritos directamente en el HTML.

## Tecnologias

- HTML
- CSS
- Firebase Hosting

Sin frameworks aun. Trabajando en ello.

## Estructura del proyecto

```
provo-go/
├── index.html               Pantalla de login
├── home.html                Catalogo de restaurantes
├── css/
│   └── styles.css           Estilos y paleta de colores
├── js/
│   └── firebase-config.js   Conexion con Firebase
├── assets/                  Logos
├── firebase.json            Configuracion de Firebase Hosting
└── README.md
```

## Como verlo

App publicada: https://provo-go.web.app

Para correrlo localmente:

```
git clone https://github.com/kenshimk/provo-go.git
```

Luego abrir `index.html` en el navegador.

## Roadmap

- Registro y login con Firebase Authentication
- Catalogo de restaurantes desde Firestore
- Carrito de compras
- Flujo de pedido e historial
- Roles de usuario (cliente, restaurante, administrador) con Security Rules

## Autor

Kenmy Rafael De Luna Troncoso
Ingenieria de Software, UAPA