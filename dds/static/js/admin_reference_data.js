function getCSRFToken() {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
    return cookieValue? decodeURIComponent(cookieValue) : null;
}

async function loadStatuses() {
    try {
        const response = await fetch('/api/statuses/?ordering=id');
        const statuses = await response.json();
        const tableBody = document.getElementById('status-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        statuses.forEach(status => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${status.id}</td>
                <td>${status.name}</td>
                <td>${status.description}</td>
                <td>
                    <button type="button" class="btn btn-warning edit-btn" data-bs-toggle="modal" data-bs-target="#status-modal" data-id="${status.id}">Редактировать</button>
                    <button type="button" class="btn btn-danger delete-btn" data-id="${status.id}">Удалить</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки статусов:', error);
    }
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-btn')) {
        const statusId = e.target.dataset.id;
        const csrfToken = getCSRFToken();
        
        if (confirm('Вы уверены, что хотите удалить этот статус?')) {
            fetch(`/api/statuses/${statusId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
           .then(response => {
                if (response.ok) {
                    loadStatuses();
                } else {
                    alert('Ошибка: ' + response.statusText);
                }
            })
           .catch(error => console.error('Ошибка:', error));
        }
    }
});

document.getElementById('save-status-btn').addEventListener('click', async function () {
    const statusId = document.getElementById('status-id').value;
    const formData = new FormData(document.getElementById('status-form'));
    const status = Object.fromEntries(formData);
    const csrfToken = getCSRFToken();
    
    try {
        const response = await fetch(statusId? `/api/statuses/${statusId}/` : '/api/statuses/', {
            method: statusId? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(status)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('status-modal'));
            modal.hide(); // Закрытие модального окна
            loadStatuses();
        } else {
            alert('Ошибка: ' + await response.text());
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
});

document.getElementById('delete-status-btn').addEventListener('click', async function () {
    const statusId = document.getElementById('status-id').value;
    const csrfToken = getCSRFToken();
    
    try {
        const response = await fetch(`/api/statuses/${statusId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('status-modal'));
            modal.hide(); // Закрытие модального окна
            loadStatuses();
        } else {
            alert('Ошибка: ' + await response.text());
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
});

document.getElementById('status-modal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('status-form').reset();
    document.getElementById('delete-status-btn').style.display = 'none';
    // Убедитесь, что модальное окно полностью очищено
    const modal = bootstrap.Modal.getInstance(document.getElementById('status-modal'));
    if (modal) {
        modal.dispose(); // Удаление экземпляра модального окна
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadStatuses();
});

statuses.forEach(status => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${status.id}</td>
        <td>${status.name}</td>
        <td>${status.description}</td>
        <td>
            <button type="button" class="btn btn-warning edit-btn" data-bs-toggle="modal" data-bs-target="#status-modal" data-id="${status.id}">Редактировать</button>
            <button type="button" class="btn btn-danger delete-btn" data-id="${status.id}">Удалить</button>
        </td>
    `;
    tableBody.appendChild(row); // Добавление в конец
});