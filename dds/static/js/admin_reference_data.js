function getCSRFToken() {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    return cookieValue ? decodeURIComponent(cookieValue) : null;
}

// ==========================================
//                 СТАТУСЫ
// ==========================================
async function loadStatuses() {
    try {
        const response = await fetch("/api/statuses/?ordering=id");
        const statuses = await response.json();
        const tableBody = document
          .getElementById("status-table")
          .getElementsByTagName("tbody")[0];
        tableBody.innerHTML = "";
        statuses.forEach((status) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${status.id}</td>
                <td>${status.name}</td>
                <td>${status.description}</td>
                <td>
                    <button type="button" class="btn btn-warning edit-btn" data-bs-toggle="modal" data-bs-target="#status-modal" data-id="${status.id}">Редактировать</button>
                    <button type="button" class="btn btn-danger delete-status-btn" data-id="${status.id}">Удалить</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Ошибка загрузки статусов:", error);
    }
}

// 状态删除按钮点击事件
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-status-btn")) {
        const statusId = e.target.dataset.id;
        const csrfToken = getCSRFToken();

        if (confirm("Вы уверены, что хотите удалить этот статус?")) {
            fetch(`/api/statuses/${statusId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
              .then((response) => {
                    if (response.ok) loadStatuses();
                    else alert("Ошибка: " + response.statusText);
                })
              .catch((error) => console.error("Ошибка:", error));
        }
    }
});

// 状态编辑按钮点击事件
document.addEventListener("click", function (e) {
    if (
        e.target.classList.contains("edit-btn") &&
        e.target.closest("#status-table")
    ) {
        const statusId = e.target.dataset.id;
        fetch(`/api/statuses/${statusId}/`)
          .then((response) => response.json())
          .then((status) => {
                const form = document.getElementById("status-form");
                form.reset();
                document.getElementById("status-id").value = status.id;
                document.getElementById("status-name").value = status.name;
                document.getElementById("status-description").value =
                    status.description;
            })
          .catch((error) =>
                console.error("Ошибка загрузки статуса для редактирования:", error)
            );
    }
});

document
  .getElementById("save-status-btn")
  .addEventListener("click", async function () {
        const statusId = document.getElementById("status-id").value;
        const formData = new FormData(document.getElementById("status-form"));
        const status = Object.fromEntries(formData);
        const csrfToken = getCSRFToken();

        try {
            const response = await fetch(
                statusId ? `/api/statuses/${statusId}/` : "/api/statuses/",
                {
                    method: statusId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify(status),
                }
            );

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("status-modal")
                );
                modal.hide();
                loadStatuses();
            } else {
                alert("Ошибка: " + (await response.text()));
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    });

document
  .getElementById("status-modal")
  .addEventListener("hidden.bs.modal", () => {
        document.getElementById("status-form").reset();
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("status-modal")
        );
        if (modal) modal.dispose();
    });

document.addEventListener("DOMContentLoaded", () => {
    loadStatuses();
});

// ==========================================
//                  ТИПЫ
// ==========================================
async function loadTypes() {
    try {
        const response = await fetch("/api/types/?ordering=id");
        const types = await response.json();
        const tableBody = document
          .getElementById("type-table")
          .getElementsByTagName("tbody")[0];
        tableBody.innerHTML = "";
        types.forEach((type) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${type.id}</td>
                <td>${type.name}</td>
                <td>${type.description}</td>
                <td>
                    <button type="button" class="btn btn-warning edit-btn" data-bs-toggle="modal" data-bs-target="#type-modal" data-id="${type.id}">Редактировать</button>
                    <button type="button" class="btn btn-danger delete-type-btn" data-id="${type.id}">Удалить</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Ошибка загрузки типов:", error);
    }
}

// 类型删除按钮点击事件
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-type-btn")) {
        const typeId = e.target.dataset.id;
        const csrfToken = getCSRFToken();

        if (confirm("Вы уверены, что хотите удалить этот тип?")) {
            fetch(`/api/types/${typeId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
              .then((response) => {
                    if (response.ok) loadTypes();
                    else alert("Ошибка: " + response.statusText);
                })
              .catch((error) => console.error("Ошибка:", error));
        }
    }
});

// 类型编辑按钮点击事件
document.addEventListener("click", function (e) {
    if (
        e.target.classList.contains("edit-btn") &&
        e.target.closest("#type-table")
    ) {
        const typeId = e.target.dataset.id;
        fetch(`/api/types/${typeId}/`)
          .then((response) => response.json())
          .then((type) => {
                const form = document.getElementById("type-form");
                form.reset();
                document.getElementById("type-id").value = type.id;
                document.getElementById("type-name").value = type.name;
                document.getElementById("type-description").value = type.description;
            })
          .catch((error) =>
                console.error("Ошибка загрузки типа для редактирования:", error)
            );
    }
});

document
  .getElementById("save-type-btn")
  .addEventListener("click", async function () {
        const typeId = document.getElementById("type-id").value;
        const formData = new FormData(document.getElementById("type-form"));
        const type = Object.fromEntries(formData);
        const csrfToken = getCSRFToken();

        try {
            const response = await fetch(
                typeId ? `/api/types/${typeId}/` : "/api/types/",
                {
                    method: typeId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify(type),
                }
            );

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("type-modal")
                );
                modal.hide();
                loadTypes();
            } else {
                alert("Ошибка: " + (await response.text()));
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    });

document
  .getElementById("type-modal")
  .addEventListener("hidden.bs.modal", () => {
        document.getElementById("type-form").reset();
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("type-modal")
        );
        if (modal) modal.dispose();
    });

document.addEventListener("DOMContentLoaded", () => {
    loadTypes();
});

// ==========================================
//               КАТЕГОРИИ
// ==========================================
async function loadCategories() {
    try {
        const response = await fetch("/api/categories/?ordering=id");
        const categories = await response.json();
        const tableBody = document
          .getElementById("category-table")
          .getElementsByTagName("tbody")[0];
        tableBody.innerHTML = "";

        categories.forEach((category) => {
            const row = document.createElement("tr");
            // В loadCategories()
            row.innerHTML = `
<td>${category.id}</td>
<td>${category.name}</td>
<td>${category.description}</td>
<td>${category.type.name}</td>  <!-- Исправлено -->
<td>
    <button type="button" class="btn btn-warning edit-btn" data-bs-toggle="modal" data-bs-target="#category-modal" data-id="${category.id}">Редактировать</button>
    <button type="button" class="btn btn-danger delete-category-btn" data-id="${category.id}">Удалить</button>
</td>
`;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
    }
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-category-btn")) {
        const categoryId = e.target.dataset.id;
        const csrfToken = getCSRFToken();

        if (confirm("Вы уверены, что хотите удалить эту категорию?")) {
            fetch(`/api/categories/${categoryId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
              .then((response) => {
                    if (response.ok) loadCategories();
                    else alert("Ошибка: " + response.statusText);
                })
              .catch((error) => console.error("Ошибка:", error));
        }
    }
});

document.addEventListener("click", function (e) {
    if (
        e.target.classList.contains("edit-btn") &&
        e.target.closest("#category-table")
    ) {
        const categoryId = e.target.dataset.id;
        fetch(`/api/categories/${categoryId}/`)
          .then((response) => response.json())
          .then((category) => {
                const form = document.getElementById("category-form");
                form.reset();
                document.getElementById("category-id").value = category.id;
                document.getElementById("category-name").value = category.name;
                document.getElementById("category-description").value =
                    category.description;
                loadTypesForCategoryForm(category.type.id);
            })
          .catch((error) =>
                console.error("Ошибка загрузки категории для редактирования:", error)
            );
    }
});

async function loadTypesForCategoryForm(selectedTypeId = null) {
    try {
        const response = await fetch("/api/types/");
        const types = await response.json();
        const select = document.getElementById("category-type");
        select.innerHTML = '<option value="">Выберите тип</option>';

        types.forEach((type) => {
            select.innerHTML += `<option value="${type.id}" ${
                type.id === selectedTypeId ? "selected" : ""
            }>${type.name}</option>`;
        });
    } catch (error) {
        console.error("Ошибка загрузки типов:", error);
    }
}

document.getElementById('add-category-btn').addEventListener('click', () => {
    loadTypesForCategoryForm(); // Автоматическая загрузка типов при открытии модального окна
});

document
  .getElementById("save-category-btn")
  .addEventListener("click", async function () {
        const categoryId = document.getElementById("category-id").value;
        const formData = new FormData(document.getElementById("category-form"));
        const category = Object.fromEntries(formData);
        const csrfToken = getCSRFToken();

        // 修改 type 字段为字典类型
        if (category.type) {
            category.type = { id: parseInt(category.type) };
        }

        try {
            const response = await fetch(
                categoryId ? `/api/categories/${categoryId}/` : "/api/categories/",
                {
                    method: categoryId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify(category),
                }
            );

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("category-modal")
                );
                modal.hide();
                loadCategories();
            } else {
                alert("Ошибка: " + (await response.text()));
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    });

document
  .getElementById("category-modal")
  .addEventListener("hidden.bs.modal", () => {
        document.getElementById("category-form").reset();
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("category-modal")
        );
        if (modal) modal.dispose();
    });

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
});

// ==========================================
//            ПОДКАТЕГОРИИ
// ==========================================
async function loadSubcategories() {
    try {
        const response = await fetch("/api/subcategories/?ordering=id");
        const subcategories = await response.json();
        const tableBody = document
          .getElementById("subcategory-table")
          .getElementsByTagName("tbody")[0];
        tableBody.innerHTML = "";

        subcategories.forEach((subcategory) => {
            const row = document.createElement("tr");
            // В loadSubcategories()
            row.innerHTML = `
<td>${subcategory.id}</td>
<td>${subcategory.name}</td>
<td>${subcategory.description}</td>
<td>${subcategory.category.name}</td>  <!-- Исправлено -->
<td>
    <button type="button" class="btn btn-warning edit-btn" data-bs-toggle="modal" data-bs-target="#subcategory-modal" data-id="${subcategory.id}">Редактировать</button>
    <button type="button" class="btn btn-danger delete-subcategory-btn" data-id="${subcategory.id}">Удалить</button>
</td>
`;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Ошибка загрузки подкатегорий:", error);
    }
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-subcategory-btn")) {
        const subcategoryId = e.target.dataset.id;
        const csrfToken = getCSRFToken();

        if (confirm("Вы уверены, что хотите удалить эту подкатегорию?")) {
            fetch(`/api/subcategories/${subcategoryId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
              .then((response) => {
                    if (response.ok) loadSubcategories();
                    else alert("Ошибка: " + response.statusText);
                })
              .catch((error) => console.error("Ошибка:", error));
        }
    }
});

document.addEventListener("click", function (e) {
    if (
        e.target.classList.contains("edit-btn") &&
        e.target.closest("#subcategory-table")
    ) {
        const subcategoryId = e.target.dataset.id;
        fetch(`/api/subcategories/${subcategoryId}/`)
          .then((response) => response.json())
          .then((subcategory) => {
                const form = document.getElementById("subcategory-form");
                form.reset();
                document.getElementById("subcategory-id").value = subcategory.id;
                document.getElementById("subcategory-name").value = subcategory.name;
                document.getElementById("subcategory-description").value =
                    subcategory.description;
                loadCategoriesForSubcategoryForm(subcategory.category.id);
            })
          .catch((error) =>
                console.error("Ошибка загрузки подкатегории для редактирования:", error)
            );
    }
});

async function loadCategoriesForSubcategoryForm(selectedCategoryId = null) {
    try {
        const response = await fetch('/api/categories/');
        const categories = await response.json();
        const select = document.getElementById('subcategory-category');
        select.innerHTML = '<option value="">Выберите категорию</option>';

        categories.forEach(category => {
            select.innerHTML += `<option value="${category.id}" ${category.id === selectedCategoryId ? 'selected' : ''}>${category.name}</option>`;
        });
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

document.getElementById('add-subcategory-btn').addEventListener('click', () => {
    loadCategoriesForSubcategoryForm(); // Автоматическая загрузка категорий при открытии модального окна
});

document
  .getElementById("save-subcategory-btn")
  .addEventListener("click", async function () {
        const subcategoryId = document.getElementById("subcategory-id").value;
        const formData = new FormData(document.getElementById("subcategory-form"));
        const subcategory = Object.fromEntries(formData);
        const csrfToken = getCSRFToken();

        // 确保 category 字段是一个整数
        subcategory.category = parseInt(subcategory.category);

        try {
            const response = await fetch(
                subcategoryId
                   ? `/api/subcategories/${subcategoryId}/`
                    : "/api/subcategories/",
                {
                    method: subcategoryId? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify(subcategory),
                }
            );

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("subcategory-modal")
                );
                modal.hide();
                loadSubcategories();
            } else {
                alert("Ошибка: " + (await response.text()));
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    });

document
  .getElementById("subcategory-modal")
  .addEventListener("hidden.bs.modal", () => {
        document.getElementById("subcategory-form").reset();
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("subcategory-modal")
        );
        if (modal) modal.dispose();
    });

document.addEventListener("DOMContentLoaded", () => {
    loadSubcategories();
});    