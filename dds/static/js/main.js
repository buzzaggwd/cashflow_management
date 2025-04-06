// Вспомогательная функция для загрузки справочников в select
async function loadOptions(url, selectId, defaultText = "Выбрать", valueField = "id", labelField = "name") {
    try {
        const response = await fetch(url);
        const items = await response.json();
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = `<option value="">${defaultText}</option>`;
            items.forEach(item => {
                select.innerHTML += `<option value="${item[valueField]}">${item[labelField]}</option>`;
            });
        }
    } catch (error) {
        console.error(`Ошибка загрузки из ${url}:`, error);
    }
}

// Загрузка транзакций
async function loadTransactions() {
    const getValue = id => document.getElementById(id)?.value || "";
    const params = new URLSearchParams({
        date: getValue("filter-date"),
        status: getValue("filter-status"),
        type: getValue("filter-type"),
        category: getValue("filter-category"),
        subcategory: getValue("filter-subcategory"),
    });

    try {
        const response = await fetch(`/api/transactions/?${params}`);
        const transactions = await response.json();
        const tableBody = document.getElementById("transactions-table")?.querySelector("tbody");
        if (tableBody) {
            tableBody.innerHTML = "";
            transactions.forEach(t => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${t.date}</td>
                        <td>${t.status_name || "—"}</td>
                        <td>${t.type_name || "—"}</td>
                        <td>${t.category_name || "—"}</td>
                        <td>${t.subcategory_name || "—"}</td>
                        <td>${t.amount}</td>
                        <td>${t.comment}</td>
                        <td>
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-outline-primary edit-btn me-1" data-id="${t.id}" title="Редактировать">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${t.id}" title="Удалить">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
        }
    } catch (error) {
        console.error("Ошибка загрузки транзакций:", error);
    }
}

// Загрузка подкатегорий по категории
async function loadSubcategories(categoryId) {
    await loadOptions(`/api/subcategories/?category=${categoryId}`, "subcategory-select", "Выберите подкатегорию");
}

// Загрузка категорий по типу
async function loadCategoriesByType(typeId) {
    await loadOptions(`/api/categories-by-type/?type=${typeId}`, "category-select", "Выберите категорию");
    const selectedCategoryId = document.getElementById("category-select")?.value;
    if (selectedCategoryId) await loadSubcategories(selectedCategoryId);
}

// Показ уведомлений
function showMessage(message, type = "success") {
    const container = document.getElementById("message-container");
    if (!container) return;
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
        </div>
    `;
}

// Получение CSRF токена
function getCSRFToken() {
    return document.cookie.split("; ").find(row => row.startsWith("csrftoken="))?.split("=")[1] || "";
}

// Обработчик формы транзакции
function setupTransactionForm() {
    const form = document.getElementById("transaction-form");
    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const category = document.getElementById("category-select")?.value;
        const subcategory = document.getElementById("subcategory-select")?.value;

        if (subcategory && !category) {
            showMessage("Выберите категорию перед подкатегорией!", "danger");
            return;
        }

        const formData = new FormData(form);
        const transaction = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/transactions/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify(transaction),
            });

            if (response.ok) {
                showMessage("Транзакция успешно создана!");
                form.reset();
                loadTransactions();
            } else {
                const text = await response.text();
                showMessage("Ошибка: " + text, "danger");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            showMessage("Произошла ошибка при создании транзакции.", "danger");
        }
    });
}

// Установка обработчиков
function setupEventListeners() {
    document.getElementById("type-select")?.addEventListener("change", async e => {
        const typeId = e.target.value;
        if (typeId) {
            await loadCategoriesByType(typeId);
            document.getElementById("subcategory-select").innerHTML = '<option value="">Выберите подкатегорию</option>';
        }
    });

    document.querySelectorAll(".filter").forEach(el => {
        el.addEventListener("change", loadTransactions);
    });
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
    loadOptions("/api/statuses/", "status-select", "Все статусы");
    loadOptions("/api/types/", "type-select", "Выберите тип");
    loadOptions("/api/categories/", "category-select", "Выберите категорию");
    loadOptions("/api/subcategories/", "subcategory-select", "Выберите подкатегорию");

    if (document.getElementById("transactions-table")) {
        loadOptions("/api/statuses/", "filter-status", "Все статусы");
        loadOptions("/api/types/", "filter-type", "Все типы");
        loadOptions("/api/categories/", "filter-category", "Все категории");
        loadOptions("/api/subcategories/", "filter-subcategory", "Все подкатегории");
        loadTransactions();
    }

    setupTransactionForm();
    setupEventListeners();
});
