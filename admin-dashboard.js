import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const productsCount =
    document.getElementById("productsCount");

const activeProductsCount =
    document.getElementById("activeProductsCount");

const productsList =
    document.getElementById("productsList");

const logoutBtn =
    document.getElementById("logoutBtn");

const newProductBtn =
    document.getElementById("newProductBtn");


const productModal =
    document.getElementById("productModal");

const closeProductModal =
    document.getElementById("closeProductModal");

const cancelProductBtn =
    document.getElementById("cancelProductBtn");

const productForm =
    document.getElementById("productForm");

const saveProductBtn =
    document.getElementById("saveProductBtn");

const productFormMessage =
    document.getElementById("productFormMessage");

const modalTitle =
    document.getElementById("modalTitle");


const productName =
    document.getElementById("productName");

const productOccasion =
    document.getElementById("productOccasion");

const productTag =
    document.getElementById("productTag");

const productPrice =
    document.getElementById("productPrice");

const productOrder =
    document.getElementById("productOrder");

const productIcon =
    document.getElementById("productIcon");

const productDescription =
    document.getElementById("productDescription");

const productImage =
    document.getElementById("productImage");

const productActive =
    document.getElementById("productActive");

const imagePreview =
    document.getElementById("imagePreview");

const previewImage =
    document.getElementById("previewImage");

const removeImageBtn =
    document.getElementById("removeImageBtn");

const imageUploadContent =
    document.getElementById("imageUploadContent");

const descriptionCounter =
    document.getElementById("descriptionCounter");

const newOccasionBtn =
    document.getElementById("newOccasionBtn");

const occasionsList =
    document.getElementById("occasionsList");

const occasionModal =
    document.getElementById("occasionModal");

const occasionModalTitle =
    document.getElementById("occasionModalTitle");

const closeOccasionModal =
    document.getElementById("closeOccasionModal");

const cancelOccasionBtn =
    document.getElementById("cancelOccasionBtn");

const occasionForm =
    document.getElementById("occasionForm");

const occasionLabel =
    document.getElementById("occasionLabel");

const occasionId =
    document.getElementById("occasionId");

const occasionOrder =
    document.getElementById("occasionOrder");

const occasionActive =
    document.getElementById("occasionActive");

const occasionFormMessage =
    document.getElementById("occasionFormMessage");

const saveOccasionBtn =
    document.getElementById("saveOccasionBtn");


let ocasioesAtuais = [];

let ocasiaoEditandoId = null;


/* =========================================================
   ESTADO
========================================================= */

let produtosAtuais = [];

let produtoEditandoId = null;

let imagemBase64Atual = "";


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "admin.html";

        return;

    }


    console.log(
        "Administrador autenticado:",
        user.uid
    );


    await carregarProdutos();

    await carregarOcasioes();

});


/* =========================================================
   SISTEMA DE NOTIFICAÇÕES
========================================================= */

function mostrarToast(
    titulo,
    mensagem = "",
    tipo = "success",
    duracao = 4000
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        console.warn(
            "toastContainer não encontrado."
        );

        return;

    }


    const toast =
        document.createElement("div");


    toast.className =
        `toast toast-${tipo}`;


    let icone = "✓";


    if (tipo === "error") {
        icone = "!";
    }


    if (tipo === "warning") {
        icone = "!";
    }


    if (tipo === "info") {
        icone = "i";
    }


    toast.innerHTML = `

        <div class="toast-icon">
            ${icone}
        </div>


        <div class="toast-content">

            <div class="toast-title">
                ${escaparHTML(titulo)}
            </div>


            ${mensagem
            ? `
                        <div class="toast-message">
                            ${escaparHTML(mensagem)}
                        </div>
                      `
            : ""
        }

        </div>


        <button
            type="button"
            class="toast-close"
            aria-label="Fechar notificação"
        >
            ×
        </button>

    `;


    container.appendChild(toast);


    const fechar =
        () => {

            if (
                toast.classList.contains(
                    "saindo"
                )
            ) {

                return;

            }


            toast.classList.add(
                "saindo"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        };


    const botaoFechar =
        toast.querySelector(
            ".toast-close"
        );


    botaoFechar.addEventListener(
        "click",
        fechar
    );


    setTimeout(
        fechar,
        duracao
    );

}


/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function carregarProdutos() {

    productsList.innerHTML = `
        <div class="products-loading">
            Carregando produtos...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "produtos"
                )
            );


        produtosAtuais =
            snapshot.docs.map((item) => ({

                id: item.id,

                ...item.data()

            }));


        produtosAtuais.sort(
            (a, b) => {

                const ordemA =
                    Number(
                        a.order ?? 0
                    );

                const ordemB =
                    Number(
                        b.order ?? 0
                    );


                return ordemA - ordemB;

            }
        );


        const produtosAtivos =
            produtosAtuais.filter(
                (produto) =>
                    produto.active !== false
            );


        productsCount.textContent =
            produtosAtuais.length;


        activeProductsCount.textContent =
            produtosAtivos.length;


        renderizarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao carregar produtos:",
            erro
        );


        productsList.innerHTML = `

            <div class="empty-products">

                <strong>
                    Não foi possível carregar os produtos.
                </strong>

                <span>
                    Verifique o console do navegador.
                </span>

            </div>

        `;

    }

}


/* =========================================================
   RENDERIZAR PRODUTOS
========================================================= */

function renderizarProdutos() {

    if (!produtosAtuais.length) {

        productsList.innerHTML = `

            <div class="empty-products">

                <strong>
                    Nenhum produto cadastrado.
                </strong>

                <span>
                    Clique em "+ Novo produto" para começar.
                </span>

            </div>

        `;

        return;
    }


    productsList.innerHTML =
        produtosAtuais
            .map(renderizarProduto)
            .join("");


}


/* =========================================================
   RENDERIZAR UM PRODUTO
========================================================= */

function renderizarProduto(produto) {

    const preco =
        Number(
            produto.price
        );


    const precoFormatado =
        Number.isFinite(preco)

            ? preco.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            )

            : "Preço não informado";


    const ativo =
        produto.active !== false;


    const statusClass =
        ativo
            ? "active"
            : "inactive";


    const statusTexto =
        ativo
            ? "Ativo"
            : "Inativo";


    const imagem =
        produto.imageBase64
            ? `
                <img
                    src="${produto.imageBase64}"
                    alt="${escaparHTML(
                produto.name ||
                "Produto"
            )}"
                    loading="lazy"
                >
            `
            : `
                <div class="admin-product-icon">
                    ${obterIcone(produto.icon)}
                </div>
            `;


    return `

        <div
            class="admin-product-row"
            data-id="${produto.id}"
        >

            <div class="admin-product-image">

                ${imagem}

            </div>


            <div class="admin-product-info">

                <h3>
                    ${escaparHTML(
        produto.name ||
        "Sem nome"
    )}
                </h3>


                <div class="admin-product-meta">

                    <span>
                        ${escaparHTML(
        produto.tag ||
        produto.occasion ||
        "Sem ocasião"
    )}
                    </span>


                    <span>·</span>


                    <span
                        class="product-status ${statusClass}"
                    >
                        ● ${statusTexto}
                    </span>

                </div>


                <div class="admin-product-price">

                    ${precoFormatado}

                </div>

            </div>


            <div class="admin-product-actions">

                <button
                    type="button"
                    class="action-btn"
                    data-action="edit"
                    data-id="${produto.id}"
                >
                    Editar
                </button>


                <button
                    type="button"
                    class="action-btn"
                    data-action="toggle"
                    data-id="${produto.id}"
                >
                    ${ativo ? "Desativar" : "Ativar"}
                </button>


                <button
                    type="button"
                    class="action-btn delete-btn"
                    data-action="delete"
                    data-id="${produto.id}"
                >
                    Excluir
                </button>

            </div>

        </div>

    `;

}



/*Carregar ocasioes*/
async function carregarOcasioes() {

    occasionsList.innerHTML = `
        <div class="products-loading">
            Carregando ocasiões...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "ocasioes"
                )
            );


        ocasioesAtuais =
            snapshot.docs.map((item) => ({

                id: item.id,

                ...item.data()

            }));


        ocasioesAtuais.sort(
            (a, b) => {

                return Number(a.order ?? 0)
                    -
                    Number(b.order ?? 0);

            }
        );


        renderizarOcasioes();

        renderizarOpcoesDeOcasião();


    } catch (erro) {

        console.error(
            "Erro ao carregar ocasiões:",
            erro
        );


        occasionsList.innerHTML = `
            <div class="empty-products">

                <strong>
                    Não foi possível carregar as ocasiões.
                </strong>

            </div>
        `;

    }

}



/* =========================================================
   OPÇÕES DE OCASIÃO NO CADASTRO DE PRODUTO
========================================================= */

function renderizarOpcoesDeOcasião(ocasiaoSelecionada = "") {

    if (!productOccasion) {
        return;
    }


    const ocasioesAtivas =
        ocasioesAtuais
            .filter(
                (ocasiao) =>
                    ocasiao.active !== false
            )
            .sort(
                (a, b) => {

                    return Number(a.order ?? 0)
                        -
                        Number(b.order ?? 0);

                }
            );


    productOccasion.innerHTML = `

        <option value="">
            Selecione
        </option>

        ${ocasioesAtivas
            .map(
                (ocasiao) => `

                        <option
                            value="${escaparHTML(ocasiao.id)}"
                        >
                            ${escaparHTML(
                    ocasiao.label ||
                    ocasiao.id
                )}
                        </option>

                    `
            )
            .join("")
        }

    `;


    /*
     * Se estivermos editando um produto que possui
     * uma ocasião que foi desativada, mantemos essa
     * ocasião disponível apenas para a edição.
     */

    if (
        ocasiaoSelecionada &&
        !ocasioesAtivas.some(
            (ocasiao) =>
                ocasiao.id ===
                ocasiaoSelecionada
        )
    ) {

        const ocasiaoAtual =
            ocasioesAtuais.find(
                (ocasiao) =>
                    ocasiao.id ===
                    ocasiaoSelecionada
            );


        if (ocasiaoAtual) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                ocasiaoAtual.id;


            option.textContent =
                `${ocasiaoAtual.label ||
                ocasiaoAtual.id
                } (inativa)`;


            productOccasion.appendChild(
                option
            );

        }

    }


    productOccasion.value =
        ocasiaoSelecionada;

}



/*Renderizer Ocasioes*/
function renderizarOcasioes() {

    if (!ocasioesAtuais.length) {

        occasionsList.innerHTML = `
            <div class="empty-products">

                <strong>
                    Nenhuma ocasião cadastrada.
                </strong>

                <span>
                    Clique em "+ Nova ocasião".
                </span>

            </div>
        `;

        return;
    }


    occasionsList.innerHTML =
        ocasioesAtuais
            .map((ocasiao) => {

                const ativo =
                    ocasiao.active !== false;


                return `

                    <div
                        class="occasion-row"
                        data-id="${ocasiao.id}"
                    >

                        <div class="occasion-info">

                            <h3>
                                ${escaparHTML(
                    ocasiao.label ||
                    ocasiao.id
                )}
                            </h3>


                            <div class="occasion-meta">

                                <span>
                                    ID: ${escaparHTML(
                    ocasiao.id
                )}
                                </span>

                                <span>·</span>

                                <span class="occasion-order">
                                    Ordem ${Number(
                    ocasiao.order ?? 0
                )}
                                </span>

                                <span>·</span>

                                <span
                                    class="product-status ${ativo
                        ? "active"
                        : "inactive"
                    }"
                                >
                                    ● ${ativo
                        ? "Ativa"
                        : "Inativa"
                    }
                                </span>

                            </div>

                        </div>


                        <div class="occasion-actions">

                            <button
                                type="button"
                                class="action-btn"
                                data-occasion-action="edit"
                                data-id="${ocasiao.id}"
                            >
                                Editar
                            </button>


                            <button
                                type="button"
                                class="action-btn"
                                data-occasion-action="toggle"
                                data-id="${ocasiao.id}"
                            >
                                ${ativo
                        ? "Desativar"
                        : "Ativar"
                    }
                            </button>


                            <button
                                type="button"
                                class="action-btn delete-btn"
                                data-occasion-action="delete"
                                data-id="${ocasiao.id}"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

}


newOccasionBtn.addEventListener(
    "click",
    () => {

        ocasiaoEditandoId = null;


        occasionModalTitle.textContent =
            "Nova ocasião";


        occasionForm.reset();

        occasionId.disabled = false;

        occasionActive.checked =
            true;


        occasionOrder.value =
            String(
                ocasioesAtuais.length + 1
            );


        occasionFormMessage.textContent =
            "";


        occasionModal.classList.add(
            "open"
        );


        occasionModal.setAttribute(
            "aria-hidden",
            "false"
        );


        occasionLabel.focus();

    }
);


/*Fechar Modal Ocasioes*/
function fecharModalOcasiao() {

    occasionModal.classList.remove(
        "open"
    );


    occasionModal.setAttribute(
        "aria-hidden",
        "true"
    );


    ocasiaoEditandoId =
        null;

}


closeOccasionModal.addEventListener(
    "click",
    fecharModalOcasiao
);


cancelOccasionBtn.addEventListener(
    "click",
    fecharModalOcasiao
);


occasionModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            occasionModal
        ) {

            fecharModalOcasiao();

        }

    }
);



/*Salvar ocasiao no banco*/
occasionForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const label =
            occasionLabel.value.trim();


        const id =
            occasionId.value
                .trim()
                .toLowerCase();


        const order =
            Number(
                occasionOrder.value
            );


        const active =
            occasionActive.checked;


        if (!label) {

            mostrarMensagemOcasiao(
                "Digite o nome da ocasião.",
                true
            );

            return;

        }


        if (
            !/^[a-z0-9_-]+$/.test(id)
        ) {

            mostrarMensagemOcasiao(
                "O identificador deve conter apenas letras minúsculas, números, hífen ou underline.",
                true
            );

            occasionId.focus();

            return;

        }


        if (
            !Number.isInteger(order) ||
            order < 1
        ) {

            mostrarMensagemOcasiao(
                "Digite uma ordem válida.",
                true
            );

            return;

        }


        saveOccasionBtn.disabled =
            true;


        saveOccasionBtn.textContent =
            ocasiaoEditandoId
                ? "Salvando..."
                : "Criando...";


        try {

            /*
             * EDIÇÃO
             */

            if (ocasiaoEditandoId) {

                const idAntigo =
                    ocasiaoEditandoId;


                /*
                 * Se o identificador não mudou,
                 * apenas atualizamos o documento.
                 */

                if (idAntigo === id) {

                    await updateDoc(
                        doc(
                            db,
                            "ocasioes",
                            idAntigo
                        ),
                        {
                            label,
                            order,
                            active,
                            updatedAt:
                                serverTimestamp()
                        }
                    );

                }


                /*
                 * Se o identificador mudou,
                 * criamos o novo documento e
                 * removemos o antigo.
                 */

                else {

                    const novoDocumento =
                        doc(
                            db,
                            "ocasioes",
                            id
                        );


                    const documentoAntigo =
                        ocasioesAtuais.find(
                            (item) =>
                                item.id === idAntigo
                        );


                    /*
                     * Verifica se já existe uma ocasião
                     * com o novo identificador.
                     */

                    const idJaExiste =
                        ocasioesAtuais.some(
                            (item) =>
                                item.id === id
                        );


                    if (idJaExiste) {

                        throw new Error(
                            "Já existe uma ocasião com esse identificador."
                        );

                    }


                    await setDoc(
                        novoDocumento,
                        {
                            label,
                            order,
                            active,

                            createdAt:
                                documentoAntigo?.createdAt ||
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()
                        }
                    );


                    await deleteDoc(
                        doc(
                            db,
                            "ocasioes",
                            idAntigo
                        )
                    );

                }

            }

            /*
             * NOVA OCASIÃO
             */

            else {

                const existente =
                    ocasioesAtuais.find(
                        (item) =>
                            item.id === id
                    );


                if (existente) {

                    throw new Error(
                        "Já existe uma ocasião com esse identificador."
                    );

                }


                await updateDoc(
                    doc(
                        db,
                        "ocasioes",
                        id
                    ),
                    {
                        label,
                        order,
                        active,
                        createdAt:
                            serverTimestamp(),
                        updatedAt:
                            serverTimestamp()
                    }
                ).catch(
                    async () => {

                        /*
                         * Se o documento não existir,
                         * usamos setDoc.
                         */

                        const { setDoc } =
                            await import(
                                "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
                            );


                        await setDoc(
                            doc(
                                db,
                                "ocasioes",
                                id
                            ),
                            {
                                label,
                                order,
                                active,
                                createdAt:
                                    serverTimestamp(),
                                updatedAt:
                                    serverTimestamp()
                            }
                        );

                    }
                );

            }


            await carregarOcasioes();

            const mensagemSucesso =
                ocasiaoEditandoId
                    ? "A ocasião foi atualizada com sucesso."
                    : "A nova ocasião foi cadastrada no sistema.";

            mostrarToast(
                ocasiaoEditandoId
                    ? "Ocasião atualizada!"
                    : "Ocasião adicionada!",
                mensagemSucesso,
                "success"
            );

            fecharModalOcasiao();


        } catch (erro) {

            console.error(
                "Erro ao salvar ocasião:",
                erro
            );


            mostrarToast(
                "Não foi possível salvar",
                erro.message ||
                "Ocorreu um erro ao salvar a ocasião.",
                "error"
            );

        } finally {

            saveOccasionBtn.disabled =
                false;


            saveOccasionBtn.textContent =
                "Salvar ocasião";

        }

    }
);



occasionsList.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "button[data-occasion-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.occasionAction;


        const id =
            button.dataset.id;


        if (action === "edit") {

            editarOcasiao(id);

        }


        if (action === "toggle") {

            await alternarOcasiao(id);

        }


        if (action === "delete") {

            await excluirOcasiao(id);

        }

    }
);



function editarOcasiao(id) {

    const ocasiao =
        ocasioesAtuais.find(
            (item) =>
                item.id === id
        );


    if (!ocasiao) {

        return;

    }


    ocasiaoEditandoId =
        id;


    occasionModalTitle.textContent =
        "Editar ocasião";


    occasionLabel.value =
        ocasiao.label || "";


    occasionId.value =
        ocasiao.id;


    /*
     * Durante edição não permitimos
     * alterar o ID do documento.
     */

    occasionId.disabled =
        false;


    occasionOrder.value =
        ocasiao.order ?? 1;


    occasionActive.checked =
        ocasiao.active !== false;


    occasionFormMessage.textContent =
        "";


    occasionModal.classList.add(
        "open"
    );


    occasionModal.setAttribute(
        "aria-hidden",
        "false"
    );

}



async function alternarOcasiao(id) {

    const ocasiao =
        ocasioesAtuais.find(
            (item) =>
                item.id === id
        );


    if (!ocasiao) {
        return;
    }


    try {

        const novoStatus =
            ocasiao.active === false;


        await updateDoc(
            doc(
                db,
                "ocasioes",
                id
            ),
            {
                active: novoStatus,

                updatedAt:
                    serverTimestamp()
            }
        );


        await carregarOcasioes();


        // Notificação de sucesso
        mostrarToast(
            novoStatus
                ? "Ocasião ativada!"
                : "Ocasião desativada!",

            novoStatus
                ? `"${ocasiao.label}" voltou a aparecer como opção.`
                : `"${ocasiao.label}" foi desativada.`,

            "success"
        );


    } catch (erro) {

        console.error(
            "Erro ao alterar ocasião:",
            erro
        );


        mostrarToast(
            "Não foi possível alterar",
            "Ocorreu um erro ao alterar a ocasião.",
            "error"
        );

    }

}


async function excluirOcasiao(id) {

    const ocasiao =
        ocasioesAtuais.find(
            (item) =>
                item.id === id
        );


    if (!ocasiao) {
        return;
    }


    const confirmou =
        confirm(
            `Tem certeza que deseja excluir "${ocasiao.label}"?`
        );


    if (!confirmou) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "ocasioes",
                id
            )
        );


        await carregarOcasioes();


        // Notificação de sucesso
        mostrarToast(
            "Ocasião excluída!",
            `"${ocasiao.label}" foi removida do sistema.`,
            "success"
        );


    } catch (erro) {

        console.error(
            "Erro ao excluir ocasião:",
            erro
        );


        mostrarToast(
            "Não foi possível excluir",
            "Ocorreu um erro ao excluir a ocasião.",
            "error"
        );

    }

}



function mostrarMensagemOcasiao(
    mensagem,
    erro = false
) {

    occasionFormMessage.textContent =
        mensagem;


    occasionFormMessage.style.color =
        erro
            ? "#ffb5b5"
            : "#b9f5c8";

}


/* =========================================================
   CLIQUES NOS PRODUTOS
========================================================= */

productsList.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;

        const id =
            button.dataset.id;


        if (action === "edit") {

            editarProduto(id);

            return;

        }


        if (action === "toggle") {

            await alternarProduto(id);

            return;

        }


        if (action === "delete") {

            await excluirProduto(id);

        }

    }
);


/* =========================================================
   EDITAR PRODUTO
========================================================= */

function editarProduto(id) {

    const produto =
        produtosAtuais.find(
            (item) =>
                item.id === id
        );


    if (!produto) {

        return;

    }


    produtoEditandoId =
        id;


    modalTitle.textContent =
        "Editar produto";


    productName.value =
        produto.name || "";


    renderizarOpcoesDeOcasião(
        produto.occasion || ""
    );


    productTag.value =
        produto.tag || "";


    productPrice.value =
        produto.price ?? "";


    productOrder.value =
        produto.order ?? 0;


    productIcon.value =
        produto.icon || "giftbox";


    productDescription.value =
        produto.desc || "";


    productActive.checked =
        produto.active !== false;


    imagemBase64Atual =
        produto.imageBase64 || "";


    if (imagemBase64Atual) {

        previewImage.src =
            imagemBase64Atual;

        imagePreview.hidden =
            false;

        imageUploadContent.innerHTML = `

            <strong>
                Imagem atual
            </strong>

            <span>
                Clique para trocar
            </span>

        `;

    } else {

        limparImagem();

    }


    productFormMessage.textContent =
        "";


    productFormMessage.style.color =
        "";


    atualizarContadorDescricao();


    productModal.classList.add(
        "open"
    );


    productModal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(
        () => {

            productName.focus();

        },
        100
    );

}


/* =========================================================
   NOVO PRODUTO
========================================================= */

newProductBtn.addEventListener(
    "click",
    () => {

        produtoEditandoId =
            null;


        modalTitle.textContent =
            "Novo produto";


        productForm.reset();

        renderizarOpcoesDeOcasião("");

        productActive.checked =
            true;


        productOrder.value =
            "1";


        limparImagem();


        productFormMessage.textContent =
            "";


        productFormMessage.style.color =
            "";


        atualizarContadorDescricao();


        productModal.classList.add(
            "open"
        );


        productModal.setAttribute(
            "aria-hidden",
            "false"
        );


        setTimeout(
            () => {

                productName.focus();

            },
            100
        );

    }
);


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModalProduto() {

    productModal.classList.remove(
        "open"
    );


    productModal.setAttribute(
        "aria-hidden",
        "true"
    );


    produtoEditandoId =
        null;

}


closeProductModal.addEventListener(
    "click",
    fecharModalProduto
);


cancelProductBtn.addEventListener(
    "click",
    fecharModalProduto
);


productModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            productModal
        ) {

            fecharModalProduto();

        }

    }
);


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            productModal.classList.contains(
                "open"
            )
        ) {

            fecharModalProduto();

        }

    }
);


/* =========================================================
   ALTERNAR ATIVO / INATIVO
========================================================= */

async function alternarProduto(id) {

    const produto =
        produtosAtuais.find(
            (item) =>
                item.id === id
        );


    if (!produto) {

        return;

    }


    const novoStatus =
        produto.active === false;


    try {

        await updateDoc(
            doc(
                db,
                "produtos",
                id
            ),
            {
                active: novoStatus,
                updatedAt:
                    serverTimestamp()
            }
        );


        await carregarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );


        alert(
            "Não foi possível alterar o status do produto."
        );

    }

}


/* =========================================================
   EXCLUIR PRODUTO
========================================================= */

async function excluirProduto(id) {

    const produto =
        produtosAtuais.find(
            (item) =>
                item.id === id
        );


    if (!produto) {

        return;

    }


    const nome =
        produto.name ||
        "este produto";


    const confirmou =
        confirm(
            `Tem certeza que deseja excluir "${nome}"?`
        );


    if (!confirmou) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "produtos",
                id
            )
        );


        await carregarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao excluir produto:",
            erro
        );


        alert(
            "Não foi possível excluir o produto."
        );

    }

}


/* =========================================================
   SALVAR PRODUTO
========================================================= */

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const nome =
            productName.value.trim();

        const ocasiao =
            productOccasion.value;

        const tag =
            productTag.value.trim();

        const preco =
            Number(
                productPrice.value
            );

        const ordem =
            Number(
                productOrder.value
            );

        const icone =
            productIcon.value;

        const descricao =
            productDescription.value.trim();

        const ativo =
            productActive.checked;


        if (!nome) {

            mostrarMensagem(
                "Digite o nome do produto.",
                true
            );

            productName.focus();

            return;

        }


        if (!ocasiao) {

            mostrarMensagem(
                "Selecione uma ocasião.",
                true
            );

            productOccasion.focus();

            return;

        }


        if (!tag) {

            mostrarMensagem(
                "Digite a tag do produto.",
                true
            );

            productTag.focus();

            return;

        }


        if (
            !Number.isFinite(preco) ||
            preco < 0
        ) {

            mostrarMensagem(
                "Digite um preço válido.",
                true
            );

            productPrice.focus();

            return;

        }


        if (!descricao) {

            mostrarMensagem(
                "Digite uma descrição.",
                true
            );

            productDescription.focus();

            return;

        }


        if (
            !Number.isFinite(ordem) ||
            ordem < 0
        ) {

            mostrarMensagem(
                "Digite uma ordem válida.",
                true
            );

            productOrder.focus();

            return;

        }


        saveProductBtn.disabled =
            true;


        saveProductBtn.textContent =
            produtoEditandoId
                ? "Salvando alterações..."
                : "Salvando...";


        try {

            const user =
                auth.currentUser;


            if (!user) {

                throw new Error(
                    "Sua sessão expirou. Faça login novamente."
                );

            }


            const dadosProduto = {

                name: nome,

                occasion: ocasiao,

                tag: tag,

                price: preco,

                desc: descricao,

                icon: icone,

                imageBase64:
                    imagemBase64Atual,

                active: ativo,

                order: ordem,

                updatedAt:
                    serverTimestamp()

            };


            /* =============================================
               EDITAR
            ============================================= */

            if (produtoEditandoId) {

                await updateDoc(
                    doc(
                        db,
                        "produtos",
                        produtoEditandoId
                    ),
                    dadosProduto
                );


                mostrarMensagem(
                    "Produto atualizado com sucesso!",
                    false
                );

            }


            /* =============================================
               NOVO
            ============================================= */

            else {

                await addDoc(
                    collection(
                        db,
                        "produtos"
                    ),
                    {
                        ...dadosProduto,

                        createdAt:
                            serverTimestamp()

                    }
                );


                mostrarMensagem(
                    "Produto cadastrado com sucesso!",
                    false
                );

            }


            await carregarProdutos();


            setTimeout(
                () => {

                    fecharModalProduto();

                },
                700
            );


        } catch (erro) {

            console.error(
                "Erro ao salvar produto:",
                erro
            );


            mostrarMensagem(
                "Não foi possível salvar o produto. Verifique o console.",
                true
            );

        } finally {

            saveProductBtn.disabled =
                false;


            saveProductBtn.textContent =
                "Salvar produto";

        }

    }
);


/* =========================================================
   IMAGEM
========================================================= */

productImage.addEventListener(
    "change",
    async () => {

        const file =
            productImage.files?.[0];


        if (!file) {

            return;

        }


        try {

            const base64 =
                await prepararImagem(
                    file
                );


            imagemBase64Atual =
                base64;


            previewImage.src =
                base64;


            imagePreview.hidden =
                false;


            imageUploadContent.innerHTML = `

                <strong>
                    Nova imagem selecionada
                </strong>

                <span>
                    Clique para trocar
                </span>

            `;


        } catch (erro) {

            console.error(
                erro
            );


            productImage.value =
                "";


            mostrarMensagem(
                erro.message,
                true
            );

        }

    }
);


/* =========================================================
   REMOVER IMAGEM
========================================================= */

removeImageBtn.addEventListener(
    "click",
    limparImagem
);


function limparImagem() {

    productImage.value =
        "";


    imagemBase64Atual =
        "";


    imagePreview.hidden =
        true;


    previewImage.src =
        "";


    imageUploadContent.innerHTML = `

        <strong>
            Escolher imagem
        </strong>

        <span>
            JPG, PNG ou WebP
        </span>

    `;

}


/* =========================================================
   PREPARAR IMAGEM
========================================================= */

async function prepararImagem(file) {

    const MAX_ORIGINAL =
        10 * 1024 * 1024;


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            "Selecione apenas arquivos de imagem."
        );

    }


    if (
        file.size > MAX_ORIGINAL
    ) {

        throw new Error(
            "A imagem original deve ter no máximo 10 MB."
        );

    }


    const image =
        await carregarImagem(file);


    const MAX_DIMENSION =
        1000;


    let width =
        image.naturalWidth;

    let height =
        image.naturalHeight;


    if (
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION
    ) {

        if (width > height) {

            height =
                Math.round(
                    height *
                    (
                        MAX_DIMENSION /
                        width
                    )
                );

            width =
                MAX_DIMENSION;

        } else {

            width =
                Math.round(
                    width *
                    (
                        MAX_DIMENSION /
                        height
                    )
                );

            height =
                MAX_DIMENSION;

        }

    }


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;


    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d"
        );


    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    let blob =
        await canvasToBlob(
            canvas,
            "image/webp",
            0.72
        );


    if (!blob) {

        blob =
            await canvasToBlob(
                canvas,
                "image/jpeg",
                0.72
            );

    }


    if (!blob) {

        throw new Error(
            "Não foi possível processar a imagem."
        );

    }


    const base64 =
        await blobToBase64(
            blob
        );


    const MAX_BASE64 =
        700 * 1024;


    if (
        base64.length >
        MAX_BASE64
    ) {

        throw new Error(
            "A imagem ficou muito grande após a compressão."
        );

    }


    return base64;

}


/* =========================================================
   CARREGAR IMAGEM
========================================================= */

function carregarImagem(file) {

    return new Promise(
        (resolve, reject) => {

            const url =
                URL.createObjectURL(
                    file
                );


            const image =
                new Image();


            image.onload =
                () => {

                    URL.revokeObjectURL(
                        url
                    );


                    resolve(
                        image
                    );

                };


            image.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );


                    reject(
                        new Error(
                            "Não foi possível ler a imagem."
                        )
                    );

                };


            image.src =
                url;

        }
    );

}


/* =========================================================
   CANVAS → BLOB
========================================================= */

function canvasToBlob(
    canvas,
    type,
    quality
) {

    return new Promise(
        (resolve) => {

            canvas.toBlob(
                resolve,
                type,
                quality
            );

        }
    );

}


/* =========================================================
   BLOB → BASE64
========================================================= */

function blobToBase64(blob) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    resolve(
                        reader.result
                    );

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Erro ao preparar a imagem."
                        )
                    );

                };


            reader.readAsDataURL(
                blob
            );

        }
    );

}


/* =========================================================
   DESCRIÇÃO
========================================================= */

productDescription.addEventListener(
    "input",
    atualizarContadorDescricao
);


function atualizarContadorDescricao() {

    descriptionCounter.textContent =
        `${productDescription.value.length} / 500`;

}


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(
    mensagem,
    erro = false
) {

    productFormMessage.textContent =
        mensagem;


    productFormMessage.style.color =
        erro
            ? "#ffb5b5"
            : "#b9f5c8";

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ÍCONES
========================================================= */

function obterIcone(tipo) {

    /*
     * Mantemos um fallback simples.
     * Produtos com imagem normalmente não utilizam isso.
     */

    const icones = {

        flower: "✿",

        mug: "☕",

        frame: "▣",

        candle: "♟",

        ornament: "○",

        bookmark: "▮",

        keychain: "🔑",

        card: "▤",

        giftbox: "🎁"

    };


    return icones[tipo]
        || icones.giftbox;

}


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "admin.html";


        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);