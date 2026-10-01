# Provo Go

App de delivery de comida para Providenciales, Islas Turcas y Caicos.

## El problema

No existe el delivery de comida en Providenciales. Para las personas que
no tienen vehiculo o se les complica salir a comprar, conseguir comida a
tiempo es dificil, y tampoco existe el transporte publico. Provo Go busca
resolver eso: que la gente pueda pedir comida comodamente desde su casa o
su trabajo, y que los restaurantes pequeños tengan un punto mas fuerte en
sus ventas al agregar delivery.

## Estado actual

Funcionando:

- Registro y login con Firebase Authentication, con mensajes de error
  legibles en vez de los codigos de Firebase
- El perfil del usuario (nombre, telefono, correo, rol) se guarda en
  Firestore usando el uid de Authentication como ID del documento
- Catalogo de restaurantes leido desde Firestore, no escrito en el HTML
- Guard en el home que redirige al login si no hay sesion iniciada
- Security Rules publicadas: cada usuario solo lee su propio perfil, y
  nadie puede asignarse un rol distinto de "customer" desde el navegador
- Publicado en Firebase Hosting

Pendiente: menu por restaurante, carrito, flujo de pedido e historial.

## Tecnologias

- HTML
- CSS
- JavaScript (modulos ES)
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

Sin frameworks. La idea es entender bien las bases antes de agregar
herramientas encima.

## Estructura del proyecto

```
provo-go/
├── index.html               Login y registro
├── home.html                Catalogo de restaurantes
├── 404.html                 Pagina de error
├── css/
│   └── styles.css           Estilos y paleta de colores
├── js/
│   ├── firebase-config.js   Conexion con Firebase
│   ├── main.js              Logica del login y registro
│   └── home.js              Logica del catalogo
├── assets/                  Logos
├── firebase.json            Configuracion de Firebase Hosting
├── firestore.rules          Reglas de seguridad de la base de datos
├── .gitignore
├── DECISIONS.md             Registro de decisiones del proyecto
└── README.md
```

## Modelo de datos

**restaurants**: nombre, categorias, direccion, tiempo de entrega, costo
de delivery y si esta abierto.

**products**: nombre, descripcion, precio, categoria, disponibilidad y un
campo `restaurantId` que lo enlaza con su restaurante.

**users**: nombre completo, telefono, correo, rol y fecha de creacion. El
ID del documento es el uid de Firebase Authentication.

## Como verlo

App publicada: https://provo-go.web.app

Para correrlo localmente:

```
git clone https://github.com/kenshimk/provo-go.git
```

El proyecto usa modulos ES, asi que no funciona abriendo el archivo
directamente con doble clic. Hay que servirlo desde un servidor local
(por ejemplo la extension Live Server de VS Code).

## Roadmap

- [x] Registro y login con Firebase Authentication
- [x] Perfiles de usuario en Firestore
- [x] Catalogo de restaurantes desde Firestore
- [x] Security Rules con control de acceso por rol
- [ ] Menu de cada restaurante
- [ ] Carrito de compras
- [ ] Flujo de pedido
- [ ] Historial y estados del pedido

## Autor

Kenmy Rafael De Luna Troncoso
Ingenieria de Software, UAPA
