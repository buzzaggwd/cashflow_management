// Загрузка справочников при старте
async function loadStatuses() {
    const response = await fetch('/api/statuses/');
    const statuses = await response.json();
    const select = document.getElementById('status-select');
    statuses.forEach(status => {
        select.innerHTML += `<option value="${status.id}">${status.name}</option>`;
    });
}

// Аналогичные функции для типов, категорий, подкатегорий...

// Загрузка категорий при выборе типа
async function loadCategories(typeId) {
    const response = await fetch(`/api/types/${typeId}/categories/`);
    const categories = await response.json();
    // Очистить и заполнить категорию
}

// Загрузка подкатегорий при выборе категории
async function loadSubcategories(categoryId) {
    const response = await fetch(`/api/categories/${categoryId}/subcategories/`);
    const subcategories = await response.json();
    // Очистить и заполнить подкатегорию
}

// Загрузка всех транзакций
async function loadTransactions() {
    const response = await fetch('/api/transactions/');
    const transactions = await response.json();
    // Заполнить таблицу
}

// Пример обработчика формы
document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const transaction = Object.fromEntries(formData);
    await fetch('/api/transactions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });
    loadTransactions();
});