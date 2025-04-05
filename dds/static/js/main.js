// Загрузка справочников при старте
async function loadStatuses() {
    try {
        const response = await fetch("/api/statuses/");
        const statuses = await response.json();
        console.log("Статусы:", statuses);
        const select = document.getElementById("status-select");
        if (select) {
            select.innerHTML = '<option value="">Все статусы</option>';
            statuses.forEach((status) => {
                select.innerHTML += `<option value="${status.id}">${status.name}</option>`;
            });
        }
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

async function loadTypes() {
    try {
        const response = await fetch("/api/types/");
        const types = await response.json();
        console.log("Типы:", types);
        const select = document.getElementById("type-select");
        if (select) {
            select.innerHTML = '<option value="">Все типы</option>';
            types.forEach((type) => {
                select.innerHTML += `<option value="${type.id}">${type.name}</option>`;
            });
        }
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

// Загрузка категорий без фильтрации по типу
async function loadCategories() {
    try {
        const response = await fetch("/api/categories/");
        const categories = await response.json();
        const select = document.getElementById("category-select");
        if (select) {
            select.innerHTML = '<option value="">Все категории</option>';
            categories.forEach((category) => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

// Загрузка подкатегорий по категории
async function loadSubcategories(categoryId) {
    try {
        const response = await fetch(`/api/subcategories/?category=${categoryId}`);
        const subcategories = await response.json();
        const select = document.getElementById("subcategory-select");
        if (select) {
            select.innerHTML = '<option value="">Выберите категорию</option>';

            if (subcategories.length === 0) {
                select.innerHTML += '<option value="">Нет подкатегорий</option>';
                return;
            }

            subcategories.forEach((subcategory) => {
                select.innerHTML += `<option value="${subcategory.id}">${subcategory.name}</option>`;
            });
        }
    } catch (error) {
        console.error("Ошибка загрузки подкатегорий:", error);
    }
}

// Загрузка справочников для фильтров на index.html
async function loadStatusesForFilter() {
    try {
        const response = await fetch('/api/statuses/');
        const statuses = await response.json();
        const select = document.getElementById('filter-status');
        if (select) {
            select.innerHTML = '<option value="">Все статусы</option>';
            statuses.forEach(status => {
                select.innerHTML += `<option value="${status.id}">${status.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки статусов для фильтра:', error);
    }
}

async function loadTypesForFilter() {
    try {
        const response = await fetch('/api/types/');
        const types = await response.json();
        const select = document.getElementById('filter-type');
        if (select) {
            select.innerHTML = '<option value="">Все типы</option>';
            types.forEach(type => {
                select.innerHTML += `<option value="${type.id}">${type.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки типов для фильтра:', error);
    }
}

async function loadCategoriesForFilter() {
    try {
        const response = await fetch('/api/categories/');
        const categories = await response.json();
        const select = document.getElementById('filter-category');
        if (select) {
            select.innerHTML = '<option value="">Все категории</option>';
            categories.forEach(category => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки категорий для фильтра:', error);
    }
}

async function loadSubcategoriesForFilter() {
    try {
        const response = await fetch('/api/subcategories/');
        const subcategories = await response.json();
        const select = document.getElementById('filter-subcategory');
        if (select) {
            select.innerHTML = '<option value="">Все подкатегории</option>';
            subcategories.forEach(subcategory => {
                select.innerHTML += `<option value="${subcategory.id}">${subcategory.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки подкатегорий для фильтра:', error);
    }
}

// Загрузка транзакций с фильтрами
async function loadTransactions() {
    const date = document.getElementById('filter-date');
    const status = document.getElementById('filter-status');
    const type = document.getElementById('filter-type');
    const category = document.getElementById('filter-category');
    const subcategory = document.getElementById('filter-subcategory');

    if (date && status && type && category && subcategory) {
        const dateValue = date.value;
        const statusValue = status.value;
        const typeValue = type.value;
        const categoryValue = category.value;
        const subcategoryValue = subcategory.value;

        try {
            const response = await fetch(`/api/transactions/?date=${dateValue}&status=${statusValue}&type=${typeValue}&category=${categoryValue}&subcategory=${subcategoryValue}`);
            const transactions = await response.json();

            const tableBody = document.getElementById('transactions-table').querySelector('tbody');
            if (tableBody) {
                tableBody.innerHTML = '';

                transactions.forEach(transaction => {
                    tableBody.innerHTML += `
                        <tr>
                            <td>${transaction.date}</td>
                            <td>${transaction.status}</td>
                            <td>${transaction.type}</td>
                            <td>${transaction.category}</td>
                            <td>${transaction.subcategory}</td>
                            <td>${transaction.amount}</td>
                            <td>${transaction.comment}</td>
                            <td>
                                <button class="btn btn-primary btn-sm edit-btn" data-id="${transaction.id}">Изменить</button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${transaction.id}">Удалить</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
        }
    }
}

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    loadStatuses();
    loadTypes();
    loadCategories(); // Загрузка категорий сразу

    if (document.getElementById('transactions-table')) {
        loadStatusesForFilter();
        loadTypesForFilter();
        loadCategoriesForFilter();
        loadSubcategoriesForFilter();
        loadTransactions();
    }

    const form = document.getElementById("transaction-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            const categoryId = document.getElementById("category-select");
            const subcategoryId = document.getElementById("subcategory-select");

            if (categoryId && subcategoryId) {
                const categoryValue = categoryId.value;
                const subcategoryValue = subcategoryId.value;

                if (subcategoryValue && !categoryValue) {
                    alert("Выберите категорию перед подкатегорией!");
                    e.preventDefault();
                    return;
                }

                const transaction = {};
                const formData = new FormData(form);
                formData.forEach((value, key) => {
                    transaction[key] = value;
                });

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
                        alert("Транзакция успешно создана!");
                        form.reset();
                        if (document.getElementById('transactions-table')) {
                            loadTransactions();
                        }
                    } else {
                        alert("Ошибка: " + (await response.text()));
                    }
                } catch (error) {
                    console.error("Ошибка:", error);
                }
            }
        });
    }
});

// Получение CSRF-токена
function getCSRFToken() {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
}

// Применение фильтров
const filters = document.querySelectorAll('.filter');
if (filters) {
    filters.forEach(select => {
        select.addEventListener('change', loadTransactions);
    });
}