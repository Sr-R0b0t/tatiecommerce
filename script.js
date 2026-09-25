//banco de dados
import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   TATI. — SCRIPT.JS
   =========================================================
   Organização:
   01. Configuração
   02. Ícones
   03. Catálogo
   04. WhatsApp
   05. Abas
   06. Produtos
   07. Carrossel mobile
   08. Menu mobile
   09. Inicialização
========================================================= */


/* =========================================================
   01. CONFIGURAÇÃO
========================================================= */

const CONFIG = {
    whatsappNumber: "5511941527940", // <-- TROCAR pelo número real
    storeName: "tati. e-commerce"
};


/* =========================================================
   02. ÍCONES
========================================================= */

const ICONS = {

    flower: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="32" cy="32" r="6"/>
      <path d="M32 26c0-8-6-12-10-10s-2 12 6 16"/>
      <path d="M38 26c0-8 6-12 10-10s2 12-6 16"/>
      <path d="M26 38c-8 0-12 6-10 10s12 2 16-6"/>
      <path d="M38 38c8 0 12 6 10 10s-12 2-16-6"/>
    </svg>
  `,

    giftbox: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="12" y="26" width="40" height="28" rx="2"/>
      <path d="M12 36h40"/>
      <path d="M32 26v28"/>
      <path d="M32 26c-4-8-16-6-13 2 2 5 9 6 13 6 4 0 11-1 13-6 3-8-9-10-13-2Z"/>
    </svg>
  `,

    mug: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M14 22h28v20a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V22Z"/>
      <path d="M42 26h4a6 6 0 0 1 0 12h-4"/>
      <path d="M20 16c0-3 3-3 3-6M28 16c0-3 3-3 3-6"/>
    </svg>
  `,

    frame: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="12" y="10" width="40" height="44" rx="2"/>
      <rect x="20" y="18" width="24" height="28" rx="1"/>
      <path d="M32 46l-6-8h12l-6 8Z"/>
    </svg>
  `,

    candle: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M32 14c3 4 3 6 0 9-3-3-3-5 0-9Z"/>
      <rect x="22" y="24" width="20" height="30" rx="3"/>
      <path d="M22 34h20"/>
    </svg>
  `,

    ornament: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="32" cy="36" r="16"/>
      <path d="M28 20h8l-2-6h-4Z"/>
      <path d="M32 20v-6"/>
    </svg>
  `,

    bookmark: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 10h28v44l-14-10-14 10Z"/>
    </svg>
  `,

    keychain: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="20" cy="20" r="8"/>
      <path d="M26 26l22 22"/>
      <path d="M42 42l6-6M44 50l6-6"/>
    </svg>
  `,

    card: `
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="10" y="14" width="44" height="36" rx="3"/>
      <path d="M10 14l22 18 22-18"/>
    </svg>
  `
};


/* =========================================================
   03. CATÁLOGO
========================================================= */

const OCCASIONS = [
    {
        id: "todos",
        label: "Todos"
    },

    {
        id: "maes",
        label: "Dia das Mães"
    },

    {
        id: "pais",
        label: "Dia dos Pais"
    },

    {
        id: "professor",
        label: "Dia do Professor"
    },

    {
        id: "natal",
        label: "Natal"
    },

    {
        id: "aniversario",
        label: "Aniversário"
    }
];


let ocasioesAtuais =
    OCCASIONS;


async function carregarOcasioesDoFirestore() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "ocasioes")
            );


        const ocasioesFirebase =
            snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(
                    (item) => item.active !== false
                )
                .sort(
                    (a, b) =>
                        Number(a.order ?? 0) -
                        Number(b.order ?? 0)
                );


        return [
            {
                id: "todos",
                label: "Todos"
            },
            ...ocasioesFirebase
        ];


    } catch (erro) {

        console.error(
            "Erro ao carregar ocasiões do Firestore:",
            erro
        );

        return OCCASIONS;

    }

}



let PRODUCTS = [];

async function carregarProdutos() {
    try {
        const snapshot = await getDocs(
            collection(db, "produtos")
        );

        PRODUCTS = snapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter((product) => product.active !== false)
            .sort((a, b) => {
                const ordemA = Number(a.order ?? 0);
                const ordemB = Number(b.order ?? 0);

                if (ordemA !== ordemB) {
                    return ordemA - ordemB;
                }

                return String(a.name ?? "").localeCompare(
                    String(b.name ?? ""),
                    "pt-BR"
                );
            })
            .map((product) => ({
                ...product,
                price: formatPrice(product.price)
            }));

        renderProducts();

        console.log(
            "Produtos carregados do Firestore:",
            PRODUCTS.length
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar produtos do Firestore:",
            erro
        );

        PRODUCTS = [];
        renderProducts();
    }
}

function formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return String(value ?? "");
    }

    return number.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


let activeOccasion = "todos";


/* =========================================================
   04. WHATSAPP
========================================================= */

function whatsappLink(productName = "") {

    const message = productName
        ? `Olá! Tenho interesse no produto "${productName}" da ${CONFIG.storeName}. Pode me passar mais informações?`
        : `Olá! Vim pelo site da ${CONFIG.storeName} e gostaria de saber mais sobre os presentes disponíveis.`;

    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}


function openWhatsapp(productName = "") {

    window.open(
        whatsappLink(productName),
        "_blank",
        "noopener,noreferrer"
    );
}



function escaparHTML(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



/* =========================================================
   05. ABAS
========================================================= */
function renderTabs(ocasioes = ocasioesAtuais) {

    const tabsEl =
        document.getElementById("tabs");


    if (!tabsEl) {
        return;
    }


    tabsEl.innerHTML =
        ocasioes
            .map((occasion) => {

                const active =
                    occasion.id === activeOccasion;


                return `
                    <button
                        type="button"
                        class="tab ${active ? "active" : ""}"
                        data-id="${escaparHTML(occasion.id)}"
                        aria-pressed="${active}"
                    >
                        ${escaparHTML(occasion.label)}
                    </button>
                `;

            })
            .join("");


    tabsEl
        .querySelectorAll(".tab")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    activeOccasion =
                        button.dataset.id;


                    renderTabs(
                        ocasioesAtuais
                    );


                    renderProducts();

                }
            );

        });

}


/* =========================================================
   06. PRODUTOS
========================================================= */

function getFilteredProducts() {

    if (activeOccasion === "todos") {
        return PRODUCTS;
    }

    return PRODUCTS.filter(
        (product) => product.occasion === activeOccasion
    );

}


function renderProducts() {

    const grid = document.getElementById("productGrid");

    if (!grid) {
        return;
    }


    const list = getFilteredProducts();


    grid.innerHTML = list.map((product) => {

        const safeName = product.name.replace(/"/g, "&quot;");


        return `
      <article class="card">

        <div class="card-art">

          <span class="card-tag">
            ${product.tag}
          </span>

            <div class="card-icon ${product.imageBase64 ? "has-image" : ""}">
                ${product.imageBase64
                ? `
                <img
                    src="${product.imageBase64}"
                    alt="${product.name}"
                    class="product-card-image"
                    loading="lazy"
                >
            `
                : (
                    ICONS[product.icon] ||
                    ICONS.giftbox
                )
            }
            </div>

        </div>


        <div class="card-body">

          <h3>
            ${product.name}
          </h3>


          <p>
            ${product.desc}
          </p>


          <div class="card-foot">

            <div class="price">
              ${product.price}

              <span>
                à combinar no WhatsApp
              </span>
            </div>


            <button
              type="button"
              class="buy-btn"
              data-name="${safeName}"
              aria-label="Comprar ${safeName}"
            >

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.16L2 22l5.09-1.53a9.86 9.86 0 0 0 4.95 1.33h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Z"/>
              </svg>

              Comprar

            </button>

          </div>

        </div>

      </article>
    `;

    }).join("");


    /* Liga os botões de compra */

    grid
        .querySelectorAll(".buy-btn")
        .forEach((button) => {

            button.addEventListener("click", () => {

                openWhatsapp(button.dataset.name);

            });

        });


    /* Atualiza o carrossel */

    setupProductCarousel();

}


/* =========================================================
   07. CARROSSEL MOBILE
========================================================= */

function isMobileCarousel() {

    return window.matchMedia(
        "(max-width: 640px)"
    ).matches;

}


function setupProductCarousel() {

    const grid =
        document.getElementById("productGrid");

    const controls =
        document.getElementById("carouselControls");


    if (!grid || !controls) {
        return;
    }


    /* Limpa indicadores anteriores */

    controls.innerHTML = "";


    const cards = [
        ...grid.querySelectorAll(".card")
    ];


    /*
       Desktop:
       não existe carrossel.
    */

    if (
        window.innerWidth > 640 ||
        cards.length <= 1
    ) {

        controls.hidden = true;

        return;
    }


    controls.hidden = false;


    /*
       Cria os indicadores.
    */

    const dots =
        cards.map((card, index) => {

            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "carousel-dot";


            button.setAttribute(
                "aria-label",
                `Ver produto ${index + 1}`
            );


            button.dataset.index =
                index;


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    const targetLeft =
                        card.offsetLeft;


                    grid.scrollTo({

                        left: targetLeft,

                        behavior: "smooth"

                    });

                }
            );


            controls.appendChild(button);


            return button;

        });


    /*
       Atualiza indicador.
    */

    function updateDots() {

        const scrollLeft =
            grid.scrollLeft;


        let closestIndex = 0;

        let closestDistance =
            Infinity;


        cards.forEach(
            (card, index) => {

                const distance =
                    Math.abs(
                        card.offsetLeft -
                        scrollLeft
                    );


                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closestIndex =
                        index;

                }

            }
        );


        dots.forEach(
            (dot, index) => {

                const active =
                    index === closestIndex;


                dot.classList.toggle(
                    "active",
                    active
                );


                if (active) {

                    dot.setAttribute(
                        "aria-current",
                        "true"
                    );

                } else {

                    dot.removeAttribute(
                        "aria-current"
                    );

                }

            }
        );

    }


    /*
       Atualiza os indicadores
       durante o arraste.
    */

    let scrollTimer;


    grid.addEventListener(
        "scroll",
        () => {

            clearTimeout(
                scrollTimer
            );


            scrollTimer =
                setTimeout(
                    updateDots,
                    30
                );

        },
        {
            passive: true
        }
    );


    updateDots();

}


/* =========================================================
   08. WHATSAPP GLOBAL
========================================================= */

function wireGlobalWhatsapp() {

    const ids = [
        "headerWhats",
        "panelWhats",
        "footWhats",
        "floatWhats",
        "menuWhats"
    ];


    ids.forEach((id) => {

        const element =
            document.getElementById(id);


        if (!element) {
            return;
        }


        element.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                openWhatsapp();

            }
        );

    });

}


/* =========================================================
   09. MENU MOBILE
========================================================= */

const ICON_BURGER = `
  <path d="M4 7h16M4 12h16M4 17h16"/>
`;


const ICON_CLOSE = `
  <path d="M6 6l12 12M18 6L6 18"/>
`;


function wireMobileMenu() {

    const burger =
        document.getElementById(
            "burgerBtn"
        );


    const navLinks =
        document.getElementById(
            "navLinks"
        );


    const backdrop =
        document.getElementById(
            "navBackdrop"
        );


    const navClose =
        document.getElementById(
            "navClose"
        );


    const icon =
        document.getElementById(
            "burgerIcon"
        );


    if (
        !burger ||
        !navLinks ||
        !backdrop ||
        !icon
    ) {

        return;

    }


    /* -----------------------------------------
       ABRIR MENU
    ----------------------------------------- */

    function openMenu() {

        navLinks.classList.add(
            "open"
        );


        backdrop.classList.add(
            "open"
        );


        burger.setAttribute(
            "aria-expanded",
            "true"
        );


        burger.setAttribute(
            "aria-label",
            "Fechar menu"
        );


        icon.innerHTML =
            ICON_CLOSE;


        document.body.classList.add(
            "menu-open"
        );

    }


    /* -----------------------------------------
       FECHAR MENU
    ----------------------------------------- */

    function closeMenu() {

        navLinks.classList.remove(
            "open"
        );


        backdrop.classList.remove(
            "open"
        );


        burger.setAttribute(
            "aria-expanded",
            "false"
        );


        burger.setAttribute(
            "aria-label",
            "Abrir menu"
        );


        icon.innerHTML =
            ICON_BURGER;


        document.body.classList.remove(
            "menu-open"
        );

    }


    /* -----------------------------------------
       BOTÃO HAMBURGER
    ----------------------------------------- */

    burger.addEventListener(
        "click",
        () => {

            if (
                navLinks.classList.contains(
                    "open"
                )
            ) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );


    /* -----------------------------------------
       CLICAR NO FUNDO
    ----------------------------------------- */

    backdrop.addEventListener(
        "click",
        closeMenu
    );


    /* -----------------------------------------
       BOTÃO X
    ----------------------------------------- */

    if (navClose) {

        navClose.addEventListener(
            "click",
            closeMenu
        );

    }


    /* -----------------------------------------
       LINKS DO MENU
    ----------------------------------------- */

    navLinks
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                closeMenu
            );

        });


    /* -----------------------------------------
       TECLA ESC
    ----------------------------------------- */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeMenu();

            }

        }
    );


    /* -----------------------------------------
       REDIMENSIONAMENTO
    ----------------------------------------- */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 840
            ) {

                closeMenu();

            }


            setupProductCarousel();

        }
    );

}


/* =========================================================
   10. INICIALIZAÇÃO
========================================================= */

async function inicializarLoja() {

    ocasioesAtuais = await carregarOcasioesDoFirestore();

    await carregarProdutos();
    
    renderTabs(ocasioesAtuais);

    renderProducts();

    wireGlobalWhatsapp();

    wireMobileMenu();

    setupProductCarousel();

}

inicializarLoja();