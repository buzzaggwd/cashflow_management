let transactionIdToDelete = null;

// Вспомогательная функция для загрузки справочников в выпадающий список (select)
// Используется для статусов, типов, категорий и подкатегорий
async function loadOptions(
  url,
  selectId,
  defaultText = "Выбрать",
  valueField = "id",
  labelField = "name",
  selectedValue = null
) {
  try {
    const response = await fetch(url);
    const items = await response.json();
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = `<option value="">${defaultText}</option>`;

      const valuesSet = new Set(); // Чтобы потом проверить, есть ли нужное значение

      items.forEach((item) => {
        valuesSet.add(item[valueField]);
        select.innerHTML += `<option value="${item[valueField]}">${item[labelField]}</option>`;
      });

      // Добавим неизвестное значение, если оно не входит в список
      if (selectedValue && !valuesSet.has(selectedValue)) {
        select.innerHTML += `<option value="${selectedValue}">[неизвестное значение]</option>`;
      }

      if (selectedValue) {
        select.value = selectedValue;
      }
    }
  } catch (error) {
    console.error(`Ошибка загрузки из ${url}:`, error);
  }
}

// Загружаем все транзакции с учетом фильтров
async function loadTransactions() {
  const getValue = (id) => document.getElementById(id)?.value || "";
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
    const tableBody = document
      .getElementById("transactions-table")
      ?.querySelector("tbody");

    if (tableBody) {
      tableBody.innerHTML = ""; // Чистим таблицу перед вставкой
      transactions.forEach((t) => {
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

// Красивое бутстрап уведомление вместо alert()
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

// Получаем CSRF токен из куки (нужно для POST/PUT/DELETE запросов)
function getCSRFToken() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
}

// Установка логики формы создания транзакции
function setupTransactionForm() {
  const form = document.getElementById("transaction-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category = document.getElementById("category-select")?.value;
    const subcategory = document.getElementById("subcategory-select")?.value;

    // Проверка логики - нельзя выбрать подкатегорию без категории
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

// Подключаем обработчики событий: фильтры, зависимости, select-ы
function setupEventListeners() {
  // Зависимость: Тип → Категория (в форме редактирования)
  document.getElementById("edit-type")?.addEventListener("change", async (e) => {
    const typeId = e.target.value;
    await loadOptions(`/api/categories-by-type/?type=${typeId}`, "edit-category", "Выберите категорию");
    document.getElementById("edit-subcategory").innerHTML = '<option value="">Выберите подкатегорию</option>';
  });

  // Зависимость: Категория → Подкатегория (в форме редактирования)
  document.getElementById("edit-category")?.addEventListener("change", async (e) => {
    const categoryId = e.target.value;
    await loadOptions(`/api/subcategories/?category=${categoryId}`, "edit-subcategory", "Выберите подкатегорию");
  });

  // Фильтры на главной таблице
  document.querySelectorAll(".filter").forEach((el) => {
    el.addEventListener("change", loadTransactions);
  });

  // Зависимости в фильтрах: Тип → Категория → Подкатегория
  document.getElementById("filter-type")?.addEventListener("change", async (e) => {
    const typeId = e.target.value;
    if (typeId) {
      await loadOptions(`/api/categories-by-type/?type=${typeId}`, "filter-category", "Все категории");
    } else {
      await loadOptions("/api/categories/", "filter-category", "Все категории");
    }
    document.getElementById("filter-subcategory").innerHTML = '<option value="">Все подкатегории</option>';
    loadTransactions(); // Обновим список
  });

  document.getElementById("filter-category")?.addEventListener("change", async (e) => {
    const categoryId = e.target.value;
    if (categoryId) {
      await loadOptions(`/api/subcategories/?category=${categoryId}`, "filter-subcategory", "Все подкатегории");
    } else {
      await loadOptions("/api/subcategories/", "filter-subcategory", "Все подкатегории");
    }
    loadTransactions();
  });

  document.getElementById("filter-subcategory")?.addEventListener("change", loadTransactions);

  // Зависимости при создании транзакции
  document.getElementById("type-select")?.addEventListener("change", async (e) => {
    const typeId = e.target.value;
    if (typeId) {
      await loadOptions(`/api/categories-by-type/?type=${typeId}`, "category-select", "Выберите категорию");
      document.getElementById("subcategory-select").innerHTML = '<option value="">Выберите подкатегорию</option>';
    } else {
      document.getElementById("category-select").innerHTML = '<option value="">Выберите категорию</option>';
      document.getElementById("subcategory-select").innerHTML = '<option value="">Выберите подкатегорию</option>';
    }
  });

  document.getElementById("category-select")?.addEventListener("change", async (e) => {
    const categoryId = e.target.value;
    if (categoryId) {
      await loadOptions(`/api/subcategories/?category=${categoryId}`, "subcategory-select", "Выберите подкатегорию");
    } else {
      document.getElementById("subcategory-select").innerHTML = '<option value="">Выберите подкатегорию</option>';
    }
  });
}

// Подключаем действия таблицы: редактирование и удаление
function setupTableActions() {
  const table = document.getElementById("transactions-table");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      const id = editBtn.dataset.id;
      // Обработчик внизу (document.addEventListener)
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      deleteTransaction(id);
    }
  });
}

// Подтверждение и удаление транзакции через модальное окно
async function deleteTransaction(id) {
  transactionIdToDelete = id;
  const modal = new bootstrap.Modal(document.getElementById("confirm-delete-modal"));
  modal.show();
}

document.getElementById("confirm-delete-btn")?.addEventListener("click", async () => {
  if (!transactionIdToDelete) return;

  try {
    const response = await fetch(`/api/transactions/${transactionIdToDelete}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCSRFToken(),
      },
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById("confirm-delete-modal"));
    modal.hide();
    transactionIdToDelete = null;

    if (response.ok) {
      showMessage("Транзакция удалена.");
      loadTransactions();
    } else {
      const errorText = await response.text();
      showMessage("Ошибка удаления: " + errorText, "danger");
    }
  } catch (error) {
    console.error("Ошибка удаления:", error);
    showMessage("Произошла ошибка при удалении.", "danger");
  }
});

// Редактирование транзакции (загрузка данных в модальное окно)
document.addEventListener("click", async (e) => {
  if (e.target.closest(".edit-btn")) {
    const id = e.target.closest(".edit-btn").dataset.id;
    const modal = new bootstrap.Modal(document.getElementById("editTransactionModal"));

    try {
      const response = await fetch(`/api/transactions/${id}/`);
      const data = await response.json();

      // Заполняем форму
      document.getElementById("edit-id").value = data.id;
      document.getElementById("edit-date").value = data.date ? data.date.split("T")[0] : "";
      document.getElementById("edit-status").value = data.status || "";
      document.getElementById("edit-type").value = data.type || "";
        
      // Загружаем категории и подкатегории с учетом сохраненных значений
      await loadOptions(`/api/categories-by-type/?type=${data.type}`, "edit-category", "Выберите категорию", "id", "name", data.category);
      await loadOptions(`/api/subcategories/?category=${data.category}`, "edit-subcategory", "Выберите подкатегорию", "id", "name", data.subcategory);

      document.getElementById("edit-amount").value = data.amount;
      document.getElementById("edit-comment").value = data.comment || "";

      modal.show();
    } catch (error) {
      console.error("Ошибка загрузки транзакции:", error);
      showMessage("Не удалось загрузить транзакцию.", "danger");
    }
  }
});

// Обработка формы редактирования транзакции
document.getElementById("edit-transaction-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const updatedData = {
    date: document.getElementById("edit-date").value,
    status: document.getElementById("edit-status").value,
    type: document.getElementById("edit-type").value,
    category: document.getElementById("edit-category").value || null,
    subcategory: document.getElementById("edit-subcategory").value || null,
    amount: document.getElementById("edit-amount").value,
    comment: document.getElementById("edit-comment").value,
  };

  try {
    const response = await fetch(`/api/transactions/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      bootstrap.Modal.getInstance(document.getElementById("editTransactionModal")).hide();
      showMessage("Транзакция обновлена!");
      loadTransactions();
    } else {
      const text = await response.text();
      showMessage("Ошибка: " + text, "danger");
    }
  } catch (error) {
    console.error("Ошибка при обновлении:", error);
    showMessage("Не удалось обновить транзакцию.", "danger");
  }
});

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  // Заполняем справочники
  loadOptions("/api/statuses/", "status-select", "Все статусы");
  loadOptions("/api/types/", "type-select", "Выберите тип");
  loadOptions("/api/categories/", "category-select", "Выберите категорию");
  loadOptions("/api/subcategories/", "subcategory-select", "Выберите подкатегорию");
  loadOptions("/api/statuses/", "edit-status", "Выберите статус");
  loadOptions("/api/types/", "edit-type", "Выберите тип");

  // Только если есть таблица, значит, это главная страница (стишок)
  if (document.getElementById("transactions-table")) {
    loadOptions("/api/statuses/", "filter-status", "Все статусы");
    loadOptions("/api/types/", "filter-type", "Все типы");
    loadOptions("/api/categories/", "filter-category", "Все категории");
    loadOptions("/api/subcategories/", "filter-subcategory", "Все подкатегории");
    loadTransactions(); // Первая загрузка
  }

  setupTransactionForm();
  setupEventListeners();
  setupTableActions();
});
