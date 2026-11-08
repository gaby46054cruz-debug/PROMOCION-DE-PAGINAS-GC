import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { 
    getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { 
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDih3egk9LegaaiY3hAZvYYA7Omvbx05qk",
  authDomain: "camaras-1d9c8.firebaseapp.com",
  projectId: "camaras-1d9c8",
  storageBucket: "camaras-1d9c8.firebasestorage.app",
  messagingSenderId: "554283714612",
  appId: "1:554283714612:web:47b79c86873d98f2cae261",
  measurementId: "G-FRG9EM4L9Z"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Colecciones en Firestore
const configDocRef = doc(db, "configuracion_portafolio", "general");
const casillasColRef = collection(db, "casillas_portafolio");

// Estado Local
let currentConfig = {
    logoUrl: "https://via.placeholder.com/120/000000/FFD700?text=GC",
    authorName: "Gabriel Cruz",
    heroDesc: "Transformá tu negocio con un sitio web profesional: barberías, turneros, gimnasios, tiendas online y más.",
    mainBtnText: "Pedir mi página",
    mainBtnLink: "https://wa.me/",
    fastLinks: [],
    bgImageUrl: "",
    colors: {
        bg: "#0a0a0a",
        header: "#121212",
        primary: "#d4af37",
        text: "#ffffff",
        cardBg: "#1a1a1a",
        cardBorder: "#d4af37",
        btnBg: "#d4af37",
        btnText: "#000000"
    },
    whatsapp: "",
    promo: {
        active: false,
        text: "",
        imgUrl: ""
    }
};

let currentCards = [];

// Cargar la aplicación al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    setupEventListeners();
    await loadAppData();
    
    // Ocultar pantalla de carga recién cuando Firebase recupera todo
    document.getElementById('loader-screen').classList.add('hidden');
});

// Cargar datos de Firestore
async function loadAppData() {
    try {
        // 1. Cargar Configuración General
        const configSnap = await getDoc(configDocRef);
        if (configSnap.exists()) {
            currentConfig = { ...currentConfig, ...configSnap.data() };
        } else {
            await setDoc(configDocRef, currentConfig);
        }

        // 2. Cargar Casillas
        const cardsSnap = await getDocs(casillasColRef);
        currentCards = [];
        cardsSnap.forEach((docItem) => {
            currentCards.push({ id: docItem.id, ...docItem.data() });
        });

        // Renderizar en la interfaz
        applyStylesAndContent();
        renderCards();
    } catch (error) {
        console.error("Error al cargar datos desde Firebase:", error);
    }
}

// Aplicar Estilos y Contenidos Dinámicos
function applyStylesAndContent() {
    const root = document.documentElement;
    const c = currentConfig.colors || {};

    // Aplicar variables CSS de colores
    if (c.bg) root.style.setProperty('--bg-color', c.bg);
    if (c.header) root.style.setProperty('--header-bg', c.header);
    if (c.primary) root.style.setProperty('--primary-color', c.primary);
    if (c.text) root.style.setProperty('--text-color', c.text);
    if (c.cardBg) root.style.setProperty('--card-bg', c.cardBg);
    if (c.cardBorder) root.style.setProperty('--card-border', c.cardBorder);
    if (c.btnBg) root.style.setProperty('--btn-bg', c.btnBg);
    if (c.btnText) root.style.setProperty('--btn-text', c.btnText);

    // Fondo por Imagen (URL)
    if (currentConfig.bgImageUrl && currentConfig.bgImageUrl.trim() !== '') {
        root.style.setProperty('--bg-image', `url("${currentConfig.bgImageUrl.trim()}")`);
    } else {
        root.style.setProperty('--bg-image', 'none');
    }

    // Encabezado
    document.getElementById('logo-img').src = currentConfig.logoUrl;
    document.getElementById('author-name').textContent = currentConfig.authorName;
    document.getElementById('hero-description').textContent = currentConfig.heroDesc;

    // Botón Principal
    const mainBtn = document.getElementById('btn-pedir-pagina');
    mainBtn.textContent = currentConfig.mainBtnText;
    mainBtn.href = currentConfig.mainBtnLink;

    // Botones Rápidos
    const fastContainer = document.getElementById('fast-buttons-container');
    fastContainer.innerHTML = '';
    (currentConfig.fastLinks || []).forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.className = 'btn-fast';
        a.textContent = link.label;
        fastContainer.appendChild(a);
    });

    // Botón WhatsApp
    const wsBtn = document.getElementById('btn-whatsapp');
    if (currentConfig.whatsapp) {
        wsBtn.href = `https://wa.me/${currentConfig.whatsapp.replace(/[^0-9]/g, '')}`;
        wsBtn.classList.remove('hidden');
    } else {
        wsBtn.classList.add('hidden');
    }

    // Banner Promo
    const promoBanner = document.getElementById('promo-banner');
    if (currentConfig.promo && currentConfig.promo.active) {
        promoBanner.classList.remove('hidden');
        document.getElementById('promo-text').textContent = currentConfig.promo.text;
        const promoImg = document.getElementById('promo-img');
        if (currentConfig.promo.imgUrl) {
            promoImg.src = currentConfig.promo.imgUrl;
            promoImg.classList.remove('hidden');
        } else {
            promoImg.classList.add('hidden');
        }
    } else {
        promoBanner.classList.add('hidden');
    }
}

// Renderizar Cuadrícula de Casillas
function renderCards() {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = '';

    currentCards.forEach(card => {
        const cardElem = document.createElement('a');
        cardElem.href = card.link;
        cardElem.target = '_blank';
        cardElem.className = 'card-item';
        cardElem.innerHTML = `
            <img src="${card.img}" alt="${card.title}" class="card-img" onerror="this.src='https://via.placeholder.com/300x180?text=GC+Desarrollo'">
            <div class="card-info">
                <h4>${card.title}</h4>
                <p>${card.desc}</p>
            </div>
        `;
        grid.appendChild(cardElem);
    });
}

// Escuchadores de Eventos del Sistema y Panel Admin
function setupEventListeners() {
    // Abrir modal de Login desde el candado
    document.getElementById('btn-open-login').addEventListener('click', () => {
        if (auth.currentUser) {
            openAdminPanel();
        } else {
            document.getElementById('modal-auth').classList.remove('hidden');
        }
    });

    document.getElementById('close-auth').addEventListener('click', () => {
        document.getElementById('modal-auth').classList.add('hidden');
    });

    // Autenticación de Firebase Auth
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            document.getElementById('modal-auth').classList.add('hidden');
            openAdminPanel();
        } catch (err) {
            alert("Credenciales incorrectas: " + err.message);
        }
    });

    // Detectar estado de usuario autenticado
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            document.getElementById('modal-admin').classList.add('hidden');
        }
    });

    // Cerrar sesión
    document.getElementById('btn-logout').addEventListener('click', () => {
        signOut(auth);
        document.getElementById('modal-admin').classList.add('hidden');
    });

    // Control de pestañas del panel admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Guardar Encabezado
    document.getElementById('save-header-btn').addEventListener('click', async () => {
        currentConfig.logoUrl = document.getElementById('edit-logo-url').value;
        currentConfig.authorName = document.getElementById('edit-author-name').value;
        currentConfig.heroDesc = document.getElementById('edit-hero-desc').value;
        currentConfig.mainBtnText = document.getElementById('edit-main-btn-text').value;
        currentConfig.mainBtnLink = document.getElementById('edit-main-btn-link').value;

        await saveConfigToFirebase();
    });

    // Crear o Editar Casilla (Colección de casillas)
    document.getElementById('form-card').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('card-edit-id').value;

        const cardData = {
            title: document.getElementById('card-title').value,
            desc: document.getElementById('card-desc').value,
            img: document.getElementById('card-img').value,
            link: document.getElementById('card-link').value
        };

        if (editId) {
            // Actualizar casilla existente
            const docRef = doc(db, "casillas_portafolio", editId);
            await updateDoc(docRef, cardData);
            const idx = currentCards.findIndex(c => c.id === editId);
            if (idx !== -1) currentCards[idx] = { id: editId, ...cardData };
            alert("Casilla actualizada con éxito.");
        } else {
            // Crear nueva casilla
            cardData.createdAt = new Date().getTime();
            const docRef = await addDoc(casillasColRef, cardData);
            currentCards.push({ id: docRef.id, ...cardData });
            alert("Casilla creada con éxito.");
        }

        resetCardForm();
        renderCards();
        renderAdminCardsList();
    });

    document.getElementById('card-cancel-btn').addEventListener('click', resetCardForm);

    // Crear o Editar Botón Rápido
    document.getElementById('form-link').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editIdx = parseInt(document.getElementById('link-edit-idx').value);
        const linkData = {
            label: document.getElementById('link-label').value,
            url: document.getElementById('link-url').value
        };

        if (!currentConfig.fastLinks) currentConfig.fastLinks = [];

        if (editIdx >= 0) {
            // Actualizar botón existente
            currentConfig.fastLinks[editIdx] = linkData;
            alert("Botón actualizado con éxito.");
        } else {
            // Crear nuevo botón
            currentConfig.fastLinks.push(linkData);
            alert("Botón agregado con éxito.");
        }

        await saveConfigToFirebase();
        resetLinkForm();
        renderAdminLinksList();
    });

    document.getElementById('link-cancel-btn').addEventListener('click', resetLinkForm);

    // Guardar Estilos e Imagen de Fondo
    document.getElementById('save-styles-btn').addEventListener('click', async () => {
        currentConfig.bgImageUrl = document.getElementById('edit-bg-image-url').value;
        currentConfig.colors = {
            bg: document.getElementById('clr-bg').value,
            header: document.getElementById('clr-header').value,
            primary: document.getElementById('clr-primary').value,
            text: document.getElementById('clr-text').value,
            cardBg: document.getElementById('clr-card-bg').value,
            cardBorder: document.getElementById('clr-card-border').value,
            btnBg: document.getElementById('clr-btn-bg').value,
            btnText: document.getElementById('clr-btn-text').value
        };
        currentConfig.whatsapp = document.getElementById('edit-whatsapp-num').value;

        await saveConfigToFirebase();
    });

    // Guardar Promo
    document.getElementById('save-promo-btn').addEventListener('click', async () => {
        currentConfig.promo = {
            active: document.getElementById('edit-promo-active').checked,
            text: document.getElementById('edit-promo-text').value,
            imgUrl: document.getElementById('edit-promo-img').value
        };

        await saveConfigToFirebase();
    });
}

// Abrir Panel de Control y Popular Campos
function openAdminPanel() {
    document.getElementById('modal-admin').classList.remove('hidden');

    // Cargar datos en los inputs
    document.getElementById('edit-logo-url').value = currentConfig.logoUrl || '';
    document.getElementById('edit-author-name').value = currentConfig.authorName || '';
    document.getElementById('edit-hero-desc').value = currentConfig.heroDesc || '';
    document.getElementById('edit-main-btn-text').value = currentConfig.mainBtnText || '';
    document.getElementById('edit-main-btn-link').value = currentConfig.mainBtnLink || '';

    // Fondo URL
    document.getElementById('edit-bg-image-url').value = currentConfig.bgImageUrl || '';

    // Colores
    const c = currentConfig.colors || {};
    document.getElementById('clr-bg').value = c.bg || '#0a0a0a';
    document.getElementById('clr-header').value = c.header || '#121212';
    document.getElementById('clr-primary').value = c.primary || '#d4af37';
    document.getElementById('clr-text').value = c.text || '#ffffff';
    document.getElementById('clr-card-bg').value = c.cardBg || '#1a1a1a';
    document.getElementById('clr-card-border').value = c.cardBorder || '#d4af37';
    document.getElementById('clr-btn-bg').value = c.btnBg || '#d4af37';
    document.getElementById('clr-btn-text').value = c.btnText || '#000000';

    document.getElementById('edit-whatsapp-num').value = currentConfig.whatsapp || '';

    // Promo
    const p = currentConfig.promo || {};
    document.getElementById('edit-promo-active').checked = p.active || false;
    document.getElementById('edit-promo-text').value = p.text || '';
    document.getElementById('edit-promo-img').value = p.imgUrl || '';

    renderAdminCardsList();
    renderAdminLinksList();
}

// Resetear Formulario de Casilla
function resetCardForm() {
    document.getElementById('form-card').reset();
    document.getElementById('card-edit-id').value = '';
    document.getElementById('card-form-title').textContent = 'Agregar Nueva Casilla (Trabajo/Demo)';
    document.getElementById('card-submit-btn').textContent = 'Crear Casilla';
    document.getElementById('card-cancel-btn').classList.add('hidden');
}

// Resetear Formulario de Botón Rápido
function resetLinkForm() {
    document.getElementById('form-link').reset();
    document.getElementById('link-edit-idx').value = '-1';
    document.getElementById('link-form-title').textContent = 'Agregar Botón de Enlace';
    document.getElementById('link-submit-btn').textContent = 'Agregar Botón';
    document.getElementById('link-cancel-btn').classList.add('hidden');
}

// Renderizar Lista de Casillas con opción de Editar y Eliminar
function renderAdminCardsList() {
    const container = document.getElementById('admin-cards-list');
    container.innerHTML = '';

    currentCards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <span><strong>${card.title}</strong></span>
            <div class="item-actions">
                <button class="btn-edit btn-edit-card">Editar</button>
                <button class="btn-delete btn-delete-card">Eliminar</button>
            </div>
        `;

        // Botón Editar Casilla
        item.querySelector('.btn-edit-card').addEventListener('click', () => {
            document.getElementById('card-edit-id').value = card.id;
            document.getElementById('card-title').value = card.title;
            document.getElementById('card-desc').value = card.desc;
            document.getElementById('card-img').value = card.img;
            document.getElementById('card-link').value = card.link;

            document.getElementById('card-form-title').textContent = 'Editar Casilla';
            document.getElementById('card-submit-btn').textContent = 'Guardar Cambios';
            document.getElementById('card-cancel-btn').classList.remove('hidden');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Botón Eliminar Casilla
        item.querySelector('.btn-delete-card').addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de eliminar la casilla "${card.title}"?`)) {
                await deleteDoc(doc(db, "casillas_portafolio", card.id));
                currentCards = currentCards.filter(c => c.id !== card.id);
                renderCards();
                renderAdminCardsList();
            }
        });

        container.appendChild(item);
    });
}

// Renderizar Lista de Botones Rápidos con opción de Editar y Eliminar
function renderAdminLinksList() {
    const container = document.getElementById('admin-links-list');
    container.innerHTML = '';

    (currentConfig.fastLinks || []).forEach((link, idx) => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <span>${link.label}</span>
            <div class="item-actions">
                <button class="btn-edit btn-edit-link">Editar</button>
                <button class="btn-delete btn-delete-link">Eliminar</button>
            </div>
        `;

        // Botón Editar Link
        item.querySelector('.btn-edit-link').addEventListener('click', () => {
            document.getElementById('link-edit-idx').value = idx;
            document.getElementById('link-label').value = link.label;
            document.getElementById('link-url').value = link.url;

            document.getElementById('link-form-title').textContent = 'Editar Botón';
            document.getElementById('link-submit-btn').textContent = 'Guardar Cambios';
            document.getElementById('link-cancel-btn').classList.remove('hidden');
        });

        // Botón Eliminar Link
        item.querySelector('.btn-delete-link').addEventListener('click', async () => {
            if (confirm(`¿Eliminar el botón "${link.label}"?`)) {
                currentConfig.fastLinks.splice(idx, 1);
                await saveConfigToFirebase();
                renderAdminLinksList();
            }
        });

        container.appendChild(item);
    });
}

// Guardar cambios de configuración en Firestore y actualizar vista
async function saveConfigToFirebase() {
    try {
        await setDoc(configDocRef, currentConfig);
        applyStylesAndContent();
        alert("Configuración actualizada correctamente.");
    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        alert("Error al guardar cambios.");
    }
}