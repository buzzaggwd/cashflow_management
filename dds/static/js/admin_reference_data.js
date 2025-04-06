const modelNames = {
    status: 'статуса',
    type: 'типа',
    category: 'категории',
    subcategory: 'подкатегории'
  };
  
  function getCSRFToken() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }
  
  function createRow({ id, name, description, extra }, entity, icon = true) {
    const row = document.createElement("tr");
    const extraColumn = extra ? `<td>${extra}</td>` : "";
    row.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>${description}</td>
      ${extraColumn}
      <td>
        <div class="d-flex justify-content-center">
          <button type="button" class="btn btn-sm btn-outline-primary me-2 edit-btn" 
                  data-bs-toggle="modal" data-bs-target="#${entity}-modal" 
                  data-id="${id}" title="Редактировать">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger delete-${entity}-btn" 
                  data-id="${id}" title="Удалить">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>`;
    return row;
  }
  
  function bindModalReset(modalId, formId) {
    document.getElementById(modalId).addEventListener("hidden.bs.modal", () => {
      document.getElementById(formId).reset();
      document.getElementById(`${formId.split('-')[0]}-id`).value = "";
      const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
      if (modal) modal.dispose();
    });
  }
  
  function bindSaveButton(entity, endpoint, prepareData = (data) => data) {
    document.getElementById(`save-${entity}-btn`).addEventListener("click", async () => {
      const id = document.getElementById(`${entity}-id`).value;
      const formData = new FormData(document.getElementById(`${entity}-form`));
      const data = prepareData(Object.fromEntries(formData));
      const method = id ? "PUT" : "POST";
      const url = id ? `${endpoint}/${id}/` : endpoint;
  
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          bootstrap.Modal.getInstance(document.getElementById(`${entity}-modal`)).hide();
          window[`load${capitalize(entity)}s`]();
        } else alert("Ошибка: " + (await response.text()));
      } catch (e) {
        console.error("Ошибка сохранения:", e);
      }
    });
  }
  
  function bindDeleteHandler(entity, endpoint, loader) {
    document.addEventListener("click", (e) => {
      if (e.target.closest(`.delete-${entity}-btn`)) {
        const id = e.target.closest(`.delete-${entity}-btn`).dataset.id;
        if (confirm("Вы уверены, что хотите удалить?")) {
          fetch(`${endpoint}/${id}/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": getCSRFToken() },
          })
            .then(res => res.ok ? loader() : alert("Ошибка удаления"))
            .catch(err => console.error("Ошибка удаления:", err));
        }
      }
    });
  }
  
  function bindEditHandler(entity, endpoint, fields, onEdit = () => {}) {
    document.addEventListener("click", (e) => {
      const editBtn = e.target.closest(`.edit-btn`);
      const id = editBtn?.dataset?.id;
  
      if (editBtn && id) {
        fetch(`${endpoint}/${id}/`)
          .then(res => res.json())
          .then(data => {
            const form = document.getElementById(`${entity}-form`);
            form.reset();
            setModalTitle(entity, "edit");
            fields.forEach(f => document.getElementById(`${entity}-${f}`).value = data[f]);
            onEdit(data);
          })
          .catch(err => console.error("Ошибка загрузки для редактирования:", err));
      }
    });
  }
  
  
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function setModalTitle(entity, mode = "add") {
    const action = mode === "edit" ? "Редактирование" : "Добавление";
    document.getElementById(`${entity}-modal-title`).textContent = `${action} ${modelNames[entity]}`;
  }
  
  function loadEntityList(entity, endpoint, tableId, extraFn = () => "") {
    return async function () {
      try {
        const res = await fetch(`${endpoint}/?ordering=id`);
        const items = await res.json();
        const tableBody = document.getElementById(tableId).querySelector("tbody");
        tableBody.innerHTML = "";
        items.forEach(item => tableBody.appendChild(
          createRow({ ...item, extra: extraFn(item) }, entity)
        ));
      } catch (err) {
        console.error(`Ошибка загрузки ${entity}:`, err);
      }
    };
  }
  
  async function loadTypesForCategoryForm(selectedId = null) {
    try {
      const res = await fetch("/api/types/");
      const types = await res.json();
      const select = document.getElementById("category-type");
      select.innerHTML = '<option value="">Выберите тип</option>';
      types.forEach(t => select.innerHTML += `<option value="${t.id}" ${t.id === selectedId ? "selected" : ""}>${t.name}</option>`);
    } catch (e) {
      console.error("Ошибка загрузки типов:", e);
    }
  }
  
  async function loadCategoriesForSubcategoryForm(selectedId = null) {
    try {
      const res = await fetch("/api/categories/");
      const cats = await res.json();
      const select = document.getElementById("subcategory-category");
      select.innerHTML = '<option value="">Выберите категорию</option>';
      cats.forEach(c => select.innerHTML += `<option value="${c.id}" ${c.id === selectedId ? "selected" : ""}>${c.name}</option>`);
    } catch (e) {
      console.error("Ошибка загрузки категорий:", e);
    }
  }
  
  // ========================= ENTITIES ========================= //
  
  const loadStatuses = loadEntityList("status", "/api/statuses", "status-table");
  const loadTypes = loadEntityList("type", "/api/types", "type-table");
  const loadCategories = loadEntityList("category", "/api/categories", "category-table", item => item.type.name);
  const loadSubcategories = loadEntityList("subcategory", "/api/subcategories", "subcategory-table", item => item.category.name);
  
  bindSaveButton("status", "/api/statuses");
  bindSaveButton("type", "/api/types");
  bindSaveButton("category", "/api/categories", data => ({ ...data, type_id: parseInt(data.type), type: undefined }));
  bindSaveButton("subcategory", "/api/subcategories", data => ({ ...data, category_id: parseInt(data.category), category: undefined }));
  
  bindDeleteHandler("status", "/api/statuses", loadStatuses);
  bindDeleteHandler("type", "/api/types", loadTypes);
  bindDeleteHandler("category", "/api/categories", loadCategories);
  bindDeleteHandler("subcategory", "/api/subcategories", loadSubcategories);
  
  bindEditHandler("status", "/api/statuses", ["id", "name", "description"]);
  bindEditHandler("type", "/api/types", ["id", "name", "description"]);
  bindEditHandler("category", "/api/categories", ["id", "name", "description"],
    (data) => loadTypesForCategoryForm(data.type.id));
  bindEditHandler("subcategory", "/api/subcategories", ["id", "name", "description"],
    (data) => loadCategoriesForSubcategoryForm(data.category.id));
  
  bindModalReset("status-modal", "status-form");
  bindModalReset("type-modal", "type-form");
  bindModalReset("category-modal", "category-form");
  bindModalReset("subcategory-modal", "subcategory-form");
  
  // DOM READY
  document.addEventListener("DOMContentLoaded", () => {
    loadStatuses();
    loadTypes();
    loadCategories();
    loadSubcategories();
  
    document.getElementById("add-status-btn")?.addEventListener("click", () => {
      setModalTitle("status");
    });
  
    document.getElementById("add-type-btn")?.addEventListener("click", () => {
      setModalTitle("type");
    });
  
    document.getElementById("add-category-btn")?.addEventListener("click", () => {
      setModalTitle("category");
      loadTypesForCategoryForm();
    });
  
    document.getElementById("add-subcategory-btn")?.addEventListener("click", () => {
      setModalTitle("subcategory");
      loadCategoriesForSubcategoryForm();
    });
  });
  