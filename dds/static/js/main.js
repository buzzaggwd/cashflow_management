// Загрузка справочников при старте
async function loadStatuses() {
  try {
    const response = await fetch("/api/statuses/");
    const statuses = await response.json();
    console.log("Статусы:", statuses);
    const select = document.getElementById("status-select");
    select.innerHTML = '<option value="">Все статусы</option>';
    statuses.forEach((status) => {
      select.innerHTML += `<option value="${status.id}">${status.name}</option>`;
    });
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
    select.innerHTML = '<option value="">Все типы</option>';
    types.forEach((type) => {
      select.innerHTML += `<option value="${type.id}">${type.name}</option>`;
    });
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
    select.innerHTML = '<option value="">Все категории</option>';
    categories.forEach((category) => {
      select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
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
    select.innerHTML = '<option value="">Выберите категорию</option>';

    if (subcategories.length === 0) {
      select.innerHTML += '<option value="">Нет подкатегорий</option>';
      return;
    }

    subcategories.forEach((subcategory) => {
      select.innerHTML += `<option value="${subcategory.id}">${subcategory.name}</option>`;
    });
  } catch (error) {
    console.error("Ошибка загрузки подкатегорий:", error);
  }
}

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadStatuses();
  loadTypes();
  loadCategories(); // Загрузка категорий сразу
});

// Обработка формы
document
  .getElementById("transaction-form")
  .addEventListener("submit", async (e) => {
    const categoryId = document.getElementById("category-select").value;
    const subcategoryId = document.getElementById("subcategory-select").value;

    if (subcategoryId && !categoryId) {
      alert("Выберите категорию перед подкатегорией!");
      e.preventDefault();
      return;
    }

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
        e.target.reset();
      } else {
        alert("Ошибка: " + (await response.text()));
      }
    } catch (error) {
      console.error("Ошибка:", error);
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
