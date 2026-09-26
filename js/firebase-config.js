// Configuracion del proyecto en Firebase.
// Estos datos son publicos por diseño: van en el navegador y cualquiera puede verlos.
// Lo que protege los datos son las Security Rules y los dominios autorizados.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCZyKILCrW1A5zexD83foDkXJZdi5qBhQ0",
    authDomain: "provo-go.firebaseapp.com",
    projectId: "provo-go",
    storageBucket: "provo-go.firebasestorage.app",
    messagingSenderId: "683569595151",
    appId: "1:683569595151:web:830971643f0610f331347a",
    measurementId: "G-EN0W5SPP6T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);