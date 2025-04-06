// Отображаемые имена для сущностей по-русски, чтобы не дублировать строки в заголовках
const modelNames = {
    status: 'статуса',
    type: 'типа',
    category: 'категории',
    subcategory: 'подкатегории',
  };
  
  // Получаем CSRF токен из куки (нужен для POST/PUT/DELETE запросов)
  function getCSRFToken() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }
  
  // Генерируем строку таблицы с кнопками "редактировать" и "удалить"
  function createRow({ id, name, description, extra }, entity) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>${description}</td>
      ${extra ? `<td>${extra}</td>` : ""}
      <td>
        <div class="d-flex justify-content-center">
          <button class="btn btn-sm btn-outline-primary me-2 edit-btn"
                  data-id="${id}" data-entity="${entity}" title="Редактировать">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-${entity}-btn"
                  data-id="${id}" title="Удалить">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>`;
    return row;
  }
  
  // При закрытии модалки - сбрасываем форму и удаляем залипшие бэкдропы
  function bindModalReset(modalId, formId) {
    document.getElementById(modalId).addEventListener("hidden.bs.modal", () => {
      const form = document.getElementById(formId);
      form.reset();
      document.getElementById(`${formId.split('-')[0]}-id`).value = "";
  
      // Иногда бутстрап не убирает бэкдроп, на всякий случай чистим вручную
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    });
  }
  
  // "Сохранить" - для создания или обновления сущности
  function bindSaveButton(entity, endpoint, reloadFn, prepareData = d => d) {
    document.getElementById(`save-${entity}-btn`).addEventListener("click", async () => {
      const form = document.getElementById(`${entity}-form`);
      const id = document.getElementById(`${entity}-id`).value;
      const data = prepareData(Object.fromEntries(new FormData(form)));
      const url = id ? `${endpoint}${id}/` : endpoint;
      const method = id ? "PUT" : "POST";
  
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          const contentType = response.headers.get("Content-Type") || "";
          const errorText = contentType.includes("application/json")
            ? JSON.stringify(await response.json())
            : await response.text();
          throw new Error(`Ошибка: ${errorText}`);
        }
  
        bootstrap.Modal.getInstance(document.getElementById(`${entity}-modal`)).hide();
        await reloadFn();
      } catch (e) {
        console.error("Ошибка сохранения:", e);
        alert(e.message || "Ошибка при сохранении");
      }
    });
  }
  
  // Обработка удаления - через модалку подтверждения удаления
  function bindDeleteHandler(entity, endpoint, reloadFn) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(`.delete-${entity}-btn`);
      if (!btn) return;
  
      const id = btn.dataset.id;
      const modal = new bootstrap.Modal(document.getElementById("confirm-delete-modal"));
      modal.show();
  
      const confirmBtn = document.getElementById("confirm-delete-btn");
  
      // Назначаем новый обработчик каждый раз, а потом снимаем
      const newHandler = async () => {
        try {
          const res = await fetch(`${endpoint}${id}/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": getCSRFToken() },
          });
          if (!res.ok) {
            alert("Ошибка удаления");
          } else {
            modal.hide();
            await reloadFn();
          }
        } catch (err) {
          console.error("Ошибка удаления:", err);
          alert("Ошибка при удалении");
        } finally {
          confirmBtn.removeEventListener("click", newHandler);
        }
      };
  
      confirmBtn.addEventListener("click", newHandler);
    });
  }
  
  // Обработка кнопки редактирования (загружаем данные, открываем модалку)
  function bindEditHandler(entity, endpoint, fields, onEdit = () => {}) {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".edit-btn");
      if (!btn || btn.dataset.entity !== entity) return;
  
      const id = btn.dataset.id;
  
      try {
        const res = await fetch(`${endpoint}${id}/`);
        if (!res.ok) throw new Error("Ошибка загрузки данных");
        const data = await res.json();
  
        const form = document.getElementById(`${entity}-form`);
        form.reset();
        setModalTitle(entity, "edit");
  
        fields.forEach(field => {
          const input = document.getElementById(`${entity}-${field}`);
          if (input) input.value = data[field] ?? "";
        });
  
        await onEdit(data);
        document.getElementById(`${entity}-id`).value = id;
  
        const modalEl = document.getElementById(`${entity}-modal`);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      } catch (err) {
        console.error("Ошибка редактирования:", err);
        alert("Ошибка при открытии для редактирования");
      }
    });
  }
  
  // Меняем заголовок модального окна в зависимости от режима
  function setModalTitle(entity, mode = "add") {
    const action = mode === "edit" ? "Редактирование" : "Добавление";
    document.getElementById(`${entity}-modal-title`).textContent = `${action} ${modelNames[entity]}`;
  }
  
  // Грузим и отображаем список сущностей
  function loadEntityList(entity, endpoint, tableId, getExtra = () => "") {
    return async function () {
      try {
        const res = await fetch(`${endpoint}?ordering=id`);
        const items = await res.json();
        const tableBody = document.getElementById(tableId).querySelector("tbody");
        tableBody.innerHTML = "";
        items.forEach(item => tableBody.appendChild(
          createRow({ ...item, extra: getExtra(item) }, entity)
        ));
      } catch (err) {
        console.error(`Ошибка загрузки ${entity}:`, err);
      }
    };
  }
  
  // Для формы категории загружаем доступные типы
  async function loadTypesForCategoryForm(selectedId = null) {
    try {
      const res = await fetch("/api/types/");
      const types = await res.json();
      const select = document.getElementById("category-type");
      select.innerHTML = '<option value="">Выберите тип</option>';
      types.forEach(t => {
        select.innerHTML += `<option value="${t.id}" ${t.id === selectedId ? "selected" : ""}>${t.name}</option>`;
      });
    } catch (e) {
      console.error("Ошибка загрузки типов:", e);
    }
  }
  
  // Для формы подкатегории загружаем доступные категории
  async function loadCategoriesForSubcategoryForm(selectedId = null) {
    try {
      const res = await fetch("/api/categories/");
      const categories = await res.json();
      const select = document.getElementById("subcategory-category");
      select.innerHTML = '<option value="">Выберите категорию</option>';
      categories.forEach(c => {
        select.innerHTML += `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${c.name}</option>`;
      });
    } catch (e) {
      console.error("Ошибка загрузки категорий:", e);
    }
  }
  
  // Все запускается при загрузке страницы
  document.addEventListener("DOMContentLoaded", () => {
    const loadStatuses = loadEntityList("status", "/api/statuses/", "status-table");
    const loadTypes = loadEntityList("type", "/api/types/", "type-table");
    const loadCategories = loadEntityList("category", "/api/categories/", "category-table", item => item.type.name);
    const loadSubcategories = loadEntityList("subcategory", "/api/subcategories/", "subcategory-table", item => item.category.name);
  
    // Делаем доступными снаружи
    window.loadStatuses = loadStatuses;
    window.loadTypes = loadTypes;
    window.loadCategories = loadCategories;
    window.loadSubcategories = loadSubcategories;
  
    // Привязка кнопок "Сохранить"
    bindSaveButton("status", "/api/statuses/", loadStatuses);
    bindSaveButton("type", "/api/types/", loadTypes);
    bindSaveButton("category", "/api/categories/", loadCategories, d => ({ ...d, type_id: +d.type, type: undefined }));
    bindSaveButton("subcategory", "/api/subcategories/", loadSubcategories, d => ({ ...d, category_id: +d.category, category: undefined }));
  
    // Привязка удаления
    bindDeleteHandler("status", "/api/statuses/", loadStatuses);
    bindDeleteHandler("type", "/api/types/", loadTypes);
    bindDeleteHandler("category", "/api/categories/", loadCategories);
    bindDeleteHandler("subcategory", "/api/subcategories/", loadSubcategories);
  
    // Привязка редактирования
    bindEditHandler("status", "/api/statuses/", ["id", "name", "description"]);
    bindEditHandler("type", "/api/types/", ["id", "name", "description"]);
    bindEditHandler("category", "/api/categories/", ["id", "name", "description"], data => loadTypesForCategoryForm(data.type.id));
    bindEditHandler("subcategory", "/api/subcategories/", ["id", "name", "description"], data => loadCategoriesForSubcategoryForm(data.category.id));
  
    // Очистка форм при закрытии модалок
    bindModalReset("status-modal", "status-form");
    bindModalReset("type-modal", "type-form");
    bindModalReset("category-modal", "category-form");
    bindModalReset("subcategory-modal", "subcategory-form");
  
    // Кнопки "Добавить"
    document.getElementById("add-status-btn")?.addEventListener("click", () => setModalTitle("status"));
    document.getElementById("add-type-btn")?.addEventListener("click", () => setModalTitle("type"));
    document.getElementById("add-category-btn")?.addEventListener("click", () => {
      setModalTitle("category");
      loadTypesForCategoryForm();
    });
    document.getElementById("add-subcategory-btn")?.addEventListener("click", () => {
      setModalTitle("subcategory");
      loadCategoriesForSubcategoryForm();
    });
  
    // Первичная загрузка таблиц
    loadStatuses();
    loadTypes();
    loadCategories();
    loadSubcategories();
  });
  