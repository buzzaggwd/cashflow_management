// Вспомогательная функция для загрузки справочников в select
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

      const valuesSet = new Set();

      items.forEach((item) => {
        valuesSet.add(item[valueField]);
        select.innerHTML += `<option value="${item[valueField]}">${item[labelField]}</option>`;
      });

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

// Загрузка транзакций
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
      tableBody.innerHTML = "";
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
                                  <button class="btn btn-sm btn-outline-primary edit-btn me-1" data-id="${
                                    t.id
                                  }" title="Редактировать">
                                      <i class="bi bi-pencil"></i>
                                  </button>
                                  <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                                    t.id
                                  }" title="Удалить">
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
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
}

// Обработчик формы транзакции
function setupTransactionForm() {
  const form = document.getElementById("transaction-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
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
  document
    .getElementById("type-select")
    ?.addEventListener("change", async (e) => {
      const typeId = e.target.value;
      if (typeId) {
        await loadOptions(
          `/api/categories-by-type/?type=${typeId}`,
          "category-select",
          "Выберите категорию"
        );
        document.getElementById("subcategory-select").innerHTML =
          '<option value="">Выберите подкатегорию</option>';
      }
    });

  document.querySelectorAll(".filter").forEach((el) => {
    el.addEventListener("change", loadTransactions);
  });

  document
    .getElementById("edit-type")
    ?.addEventListener("change", async (e) => {
      const typeId = e.target.value;
      await loadOptions(
        `/api/categories-by-type/?type=${typeId}`,
        "edit-category",
        "Выберите категорию"
      );
      document.getElementById("edit-subcategory").innerHTML =
        '<option value="">Выберите подкатегорию</option>';
    });

  document
    .getElementById("edit-category")
    ?.addEventListener("change", async (e) => {
      const categoryId = e.target.value;
      await loadOptions(
        `/api/subcategories/?category=${categoryId}`,
        "edit-subcategory",
        "Выберите подкатегорию"
      );
    });

  // Фильтры: зависимости "тип" → "категория" → "подкатегория"
  document
    .getElementById("filter-type")
    ?.addEventListener("change", async (e) => {
      const typeId = e.target.value;
      if (typeId) {
        await loadOptions(
          `/api/categories-by-type/?type=${typeId}`,
          "filter-category",
          "Все категории"
        );
      } else {
        await loadOptions(
          "/api/categories/",
          "filter-category",
          "Все категории"
        );
      }
      document.getElementById("filter-subcategory").innerHTML =
        '<option value="">Все подкатегории</option>';
      loadTransactions(); // Обновим таблицу
    });

  document
    .getElementById("filter-category")
    ?.addEventListener("change", async (e) => {
      const categoryId = e.target.value;
      if (categoryId) {
        await loadOptions(
          `/api/subcategories/?category=${categoryId}`,
          "filter-subcategory",
          "Все подкатегории"
        );
      } else {
        await loadOptions(
          "/api/subcategories/",
          "filter-subcategory",
          "Все подкатегории"
        );
      }
      loadTransactions(); // Обновим таблицу
    });

  document
    .getElementById("filter-subcategory")
    ?.addEventListener("change", loadTransactions);

  // Зависимость при создании: Тип → Категория
  document
    .getElementById("type-select")
    ?.addEventListener("change", async (e) => {
      const typeId = e.target.value;
      if (typeId) {
        await loadOptions(
          `/api/categories-by-type/?type=${typeId}`,
          "category-select",
          "Выберите категорию"
        );
        document.getElementById("subcategory-select").innerHTML =
          '<option value="">Выберите подкатегорию</option>';
      } else {
        document.getElementById("category-select").innerHTML =
          '<option value="">Выберите категорию</option>';
        document.getElementById("subcategory-select").innerHTML =
          '<option value="">Выберите подкатегорию</option>';
      }
    });

  // Зависимость при создании: Категория → Подкатегория
  document
    .getElementById("category-select")
    ?.addEventListener("change", async (e) => {
      const categoryId = e.target.value;
      if (categoryId) {
        await loadOptions(
          `/api/subcategories/?category=${categoryId}`,
          "subcategory-select",
          "Выберите подкатегорию"
        );
      } else {
        document.getElementById("subcategory-select").innerHTML =
          '<option value="">Выберите подкатегорию</option>';
      }
    });
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  loadOptions("/api/statuses/", "status-select", "Все статусы");
  loadOptions("/api/types/", "type-select", "Выберите тип");
  loadOptions("/api/categories/", "category-select", "Выберите категорию");
  loadOptions(
    "/api/subcategories/",
    "subcategory-select",
    "Выберите подкатегорию"
  );
  loadOptions("/api/statuses/", "edit-status", "Выберите статус");
  loadOptions("/api/types/", "edit-type", "Выберите тип");

  if (document.getElementById("transactions-table")) {
    loadOptions("/api/statuses/", "filter-status", "Все статусы");
    loadOptions("/api/types/", "filter-type", "Все типы");
    loadOptions("/api/categories/", "filter-category", "Все категории");
    loadOptions(
      "/api/subcategories/",
      "filter-subcategory",
      "Все подкатегории"
    );
    loadTransactions();
  }

  setupTransactionForm();
  setupEventListeners();
  setupTableActions();
});

// Удаление транзакции
async function deleteTransaction(id) {
  if (!confirm("Удалить транзакцию?")) return;

  try {
    const response = await fetch(`/api/transactions/${id}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCSRFToken(),
      },
    });

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
}

// Обработчики кнопок в таблице
function setupTableActions() {
  const table = document.getElementById("transactions-table");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      const id = editBtn.dataset.id;
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      deleteTransaction(id);
    }
  });
}

// Обработчик кнопки редактирования
document.addEventListener("click", async (e) => {
  if (e.target.closest(".edit-btn")) {
    const id = e.target.closest(".edit-btn").dataset.id;
    const modal = new bootstrap.Modal(
      document.getElementById("editTransactionModal")
    );

    try {
      const response = await fetch(`/api/transactions/${id}/`);
      const data = await response.json();

      document.getElementById("edit-id").value = data.id;
      document.getElementById("edit-date").value = data.date;
      document.getElementById("edit-status").value = data.status || "";
      document.getElementById("edit-type").value = data.type || "";

      await loadOptions(
        `/api/categories-by-type/?type=${data.type}`,
        "edit-category",
        "Выберите категорию",
        "id",
        "name",
        data.category
      );
      await loadOptions(
        `/api/subcategories/?category=${data.category}`,
        "edit-subcategory",
        "Выберите подкатегорию",
        "id",
        "name",
        data.subcategory
      );

      document.getElementById("edit-amount").value = data.amount;
      document.getElementById("edit-comment").value = data.comment || "";

      modal.show();
    } catch (error) {
      console.error("Ошибка загрузки транзакции:", error);
      showMessage("Не удалось загрузить транзакцию.", "danger");
    }
  }
});

// Обработка формы редактирования
document
  .getElementById("edit-transaction-form")
  ?.addEventListener("submit", async (e) => {
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
        bootstrap.Modal.getInstance(
          document.getElementById("editTransactionModal")
        ).hide();
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
