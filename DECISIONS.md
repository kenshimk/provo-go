# Decisiones del proyecto

Registro de qué hice en cada sesión y por qué. Sirve como base para el
informe técnico final.

---

## 25 de septiembre 2026

### Reescribir el proyecto desde cero

Tenía una primera versión generada con IA, pero no entendía el código y no
iba a poder defenderlo. La borré y empecé de nuevo escribiendo yo cada
línea. Avanzo más lento pero puedo explicar todo lo que hay en el repo.

### HTML, CSS y JavaScript sin frameworks

Descarté React, Angular y similares. Quiero entender cómo funciona la web
por debajo antes de usar herramientas que lo abstraen. Para el tamaño de
este proyecto un framework agrega complejidad sin dar ventaja.

### Firebase en vez de SQL

El profesor dejó libre el tipo de base de datos. Escogí Firebase porque
Authentication ya resuelve el encriptado de contraseñas y el manejo de
sesiones. Con SQL puro tendría que implementar eso yo, y no tengo el
tiempo ni el conocimiento todavía. Firestore además es gratis en el plan
Spark para el volumen de este proyecto.

### Una sola hoja de estilos para todo el sitio

`css/styles.css` lo comparten las dos páginas. Los colores de marca están
definidos una sola vez arriba del archivo. Si cambio el turquesa, cambia
en todo el sitio.

### Etiquetas semánticas

Usé `header`, `main` y `article` en vez de `div` genéricos. Describen qué
es cada sección, y los lectores de pantalla y buscadores lo aprovechan.

### Responsive desde el inicio

Una app de delivery se usa desde el celular, no desde una laptop. Por eso
el `meta viewport`, anchos en porcentaje en vez de píxeles fijos, y
`box-sizing: border-box` para que el padding no desborde los elementos.

### Interfaz en inglés, comentarios en español

El mercado es Providenciales, donde se habla inglés. Todo el código va en
inglés (variables, funciones, strings, nombres de archivos) y solo los
comentarios en español, porque el profesor los lee.

### Nombres de archivo en minúscula

`Index.html` con mayúscula funcionaba en Windows pero daba 404 en Firebase
Hosting, que corre sobre Linux y sí distingue mayúsculas. Desde ese error,
todos los nombres de archivo van en minúscula.

### Qué queda fuera del repositorio

El `.gitignore` excluye `.env` y archivos de configuración local. Las
claves privadas nunca se suben a un repositorio público.

---

## 27 de septiembre 2026

### Las pestañas se manejan con clases, no con estilos en línea

El JavaScript no cambia colores ni posiciones. Solo pone y quita clases
(`hidden`, `tab-active`) y el CSS decide cómo se ve cada una. Mantiene
separado el comportamiento de la presentación.

### La configuración de Firebase en su propio archivo

`js/firebase-config.js` tiene solo la conexión. `js/main.js` tiene la
lógica. Si mañana cambio algo de la app no arriesgo romper la conexión, y
la configuración queda en un solo lugar identificable.

### El apiKey de Firebase es público a propósito

La configuración web de Firebase va en el navegador y cualquiera puede
verla. No es una clave secreta. Lo que protege los datos son las Security
Rules de Firestore y la lista de dominios autorizados en Authentication,
que solo permite `localhost`, `provo-go.web.app` y
`provo-go.firebaseapp.com`.

### async, await y try/catch en las llamadas a Firebase

Crear un usuario implica una petición a los servidores de Google, que
tarda. `await` espera la respuesta antes de seguir. El `try/catch` maneja
los fallos (correo repetido, contraseña corta, sin internet) sin romper la
página.

### preventDefault en los formularios

Sin esa línea el navegador recarga la página al enviar el formulario y el
código nunca termina de ejecutarse. Además evita que los datos viajen por
la barra de direcciones.

### Los errores de Firebase se traducen antes de mostrarlos

Firebase devuelve códigos como `auth/email-already-in-use`. El usuario no
entiende eso. Escribí una función que los convierte a mensajes en inglés
claro, con un caso por defecto para los códigos que no cubrí.

### Mensaje genérico para credenciales inválidas

Para contraseña incorrecta y para correo inexistente muestro el mismo
mensaje: "Wrong email or password". Si dijera cuál de los dos falló,
cualquiera podría probar correos para averiguar quién está registrado en
la app. Eso se llama enumeración de usuarios.

### textContent en vez de innerHTML

`innerHTML` interpreta etiquetas HTML y permite inyectar código. Uso
`textContent`, que solo escribe texto. Aquí los mensajes son míos y no hay
riesgo, pero es el hábito correcto para cuando el contenido venga de datos
externos.

### El guard del home no es seguridad real

`onAuthStateChanged` redirige al login si no hay sesión, pero es
JavaScript corriendo en el navegador del usuario y se puede desactivar.
Sirve para la experiencia de uso, no para proteger datos. La protección
real son las Security Rules de Firestore, que corren en los servidores de
Google y no se pueden burlar desde el navegador.

### visibility hidden mientras se verifica la sesión

El HTML se pinta antes de que Firebase confirme si hay sesión, y se
alcanzaba a ver el contenido del home un instante. Escondo el contenido
con una clase `checking` que el JavaScript quita cuando la verificación
termina. Usé `visibility` y no `display: none` para que no haya salto de
layout al aparecer.

### Modelo de datos de Firestore

Dos colecciones: `restaurants` y `products`.

Los precios se guardan como número, no como texto. Un `"$4"` no se puede
sumar ni ordenar. El símbolo de dólar es presentación y se agrega al
mostrar.

Cada producto lleva un campo `restaurantId` para saber a qué restaurante
pertenece. Es el equivalente a una llave foránea en SQL. Firestore también
permite subcolecciones dentro del documento del restaurante, pero el campo
es más simple de consultar y permite buscar platos entre todos los
restaurantes a la vez.

El `deliveryTime` sí va como texto porque es un rango aproximado para
mostrar, no un número con el que vaya a calcular.

---

## Pendientes y decisiones abiertas

- El nombre y el teléfono del registro todavía no se guardan en ningún
  lado. Firebase Authentication solo maneja credenciales. Van a Firestore.
- La programación orientada a objetos entra en la semana 3, con las clases
  Product, Cart y Order. Ahí tiene sentido porque son cosas con estado y
  comportamiento propio. Meterla antes sería forzarla.
- Preguntar al profesor qué diagramas quiere en el informe.

---

## Visión del producto completo

Lo que sigue es el alcance del producto si continúa después del curso.
No está en el alcance de la entrega final.

### Restaurantes

- Logo y banner de portada
- Descripción breve del negocio
- Categorías múltiples, no una sola (Pizza Pizza también es famoso
  por su pollo frito)
- Rating y reviews de clientes
- Rango de precios
- Distancia desde el cliente
- Horarios especiales
- Pedido mínimo
- Pickup además de delivery
- Promociones
- Platos populares
- Menús distintos según la hora, como McDonald's

### Productos

- Foto del plato
- Calorías
- Tags
- Tiempo de preparación
- Disponibilidad por horario
- Modifier groups: agregar o quitar queso, bacon, tamaño, salsa.
  Unos obligatorios (el tamaño de una pizza) y otros opcionales
  (los toppings)
- Instrucciones especiales por producto y por orden completa, con
  límite de caracteres. Importante para personas alérgicas

### Delivery

- Disponibilidad por zona
- Fee variable
- Tiempo estimado
- Distancia y distancia máxima
- Pedido mínimo
- Delivery gratis a partir de cierto monto
- Fee por orden pequeña
- Service fee

### Checkout

Pendiente de definir.