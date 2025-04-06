#  Веб-сервис для управления движением денежных средств (ДДС)

Это веб-приложение позволяет вести учет поступлений и списаний денежных средств, управлять справочниками и быстро находить нужные транзакции с помощью фильтров.

## Возможности

-  Создание / редактирование / удаление записей о ДДС
-  Фильтрация по дате, статусу, типу, категории и подкатегории
-  Управление справочниками:
  - Статусы (Бизнес, Личное, Налог и др.)
  - Типы (Пополнение, Списание и др.)
  - Категории и подкатегории с логическими связями
-  Автоматическая фильтрация типов, категорий и подкатегорий
-  Удобный интерфейс с использованием Bootstrap 5

---

##  Установка и запуск

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/your-username/dds-app.git
cd dds-app
```


### 2. Создайте и активируйте виртуальное окружение (опционально)

```bash
python -m venv env
source env\Scripts\activate
```


### 3. Установите зависимости

```bash
pip install -r requirements.txt
```


### 4. Примените миграции и запустите сервер

```bash
python manage.py migrate
python manage.py runserver
```


### 5. Откройте в браузере

```bash
http://127.0.0.1:8000/
```



## Технологии

Python 3.x
Django
Django REST Framework
SQLite
HTML + Bootstrap 5


## Скриншоты
![image_2025-04-06_21-24-54](https://github.com/user-attachments/assets/f32cfe8c-3e55-44ee-8fd9-a2b863e8c29d)
![image_2025-04-06_21-24-54 (2)](https://github.com/user-attachments/assets/5eef7d30-abbf-4098-a653-951f37bb4db0)
![image_2025-04-06_21-24-54 (3)](https://github.com/user-attachments/assets/14affe53-18bc-4af4-a4ef-25ab7cb0e312)
![image_2025-04-06_21-24-55](https://github.com/user-attachments/assets/8cc4b775-1bd9-4f67-bcf8-fea5b2e94293)


## Структура проекта

```bash
cashflow_management/
├──dds/               # Основное Django-приложение
    ├── static/               # JS, CSS
    ├── templates/dds         # HTML-шаблоны
├── manage.py
├── requirements.txt
└── README.md
```


## Автор
Разработано в рамках тестового задания.
buzzaggwd
