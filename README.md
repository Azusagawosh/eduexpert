&#x09;# 🎓 EduExpert - Платформа онлайн-консультаций



<p align="center">

&#x20; <img src="https://img.shields.io/badge/Django-4.2-green" alt="Django">

&#x20; <img src="https://img.shields.io/badge/React-18-blue" alt="React">

&#x20; <img src="https://img.shields.io/badge/Bootstrap-5-purple" alt="Bootstrap">

&#x20; <img src="https://img.shields.io/badge/JWT-Auth-orange" alt="JWT">

&#x20; <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">

</p>



\## 📝 О проекте



\*\*EduExpert\*\* - это современная платформа для онлайн-консультаций и репетиторства. Проект позволяет клиентам находить экспертов и записываться на консультации, а консультантам - управлять расписанием и принимать заявки.



\### 🎯 Основные возможности



\- ✅ Регистрация и авторизация (JWT токены)

\- ✅ Три роли пользователей: \*\*Клиент\*\*, \*\*Консультант\*\*, \*\*Администратор\*\*

\- ✅ Поиск и фильтрация консультантов

\- ✅ Бронирование консультаций по расписанию

\- ✅ Управление расписанием для консультантов

\- ✅ Подтверждение и завершение консультаций

\- ✅ Отзывы и рейтинги

\- ✅ Админ-панель Django



\## 🛠️ Технологии



| Backend | Frontend |

|---------|----------|

| Django 4.2 | React 18 |

| Django REST Framework | Bootstrap 5 |

| JWT Authentication | Axios |

| SQLite (разработка) | React Router DOM |



\## 🚀 Быстрый старт



\### 📋 Требования



\- Python 3.8+

\- Node.js 16+

\- pip

\- npm



\### ⚙️ Установка и запуск



\#### 1️⃣ Клонирование репозитория



```bash

git clone https://github.com/Azusagawosh/eduexpert.git

cd eduexpert



\# Переход в папку backend

cd backend



\# Создание виртуального окружения

python -m venv venv



\# Активация виртуального окружения

\# Windows:

venv\\Scripts\\activate

\# Mac/Linux:

source venv/bin/activate



\# Установка зависимостей

pip install -r requirements.txt



\# Миграции базы данных

python manage.py makemigrations

python manage.py migrate



\# Создание суперпользователя (администратора)

python manage.py createsuperuser



\# Запуск сервера

python manage.py runserver



\# Открой новый терминал и перейди в папку frontend

cd frontend



\# Установка зависимостей

npm install



\# Запуск React приложения

npm start



🌐 Доступ к приложению

Сервис	URL

Frontend	http://localhost:3000

Backend API	http://localhost:8000

Admin панель	http://localhost:8000/admin



👥 Тестовые аккаунты

Роль	                Username	Password

👤 Клиент	        test\_client	client123456

👨‍🏫 Консультант	        tutor\_azamat	tutor123456

👑 Администратор	admin	        (создайте через createsuperuser)



📁 Структура проекта

online\_consultations/

├── backend/                 # Django REST API

│   ├── api/                 # Основное приложение

│   │   ├── models.py        # Модели данных

│   │   ├── views.py         # API представления

│   │   ├── serializers.py   # Сериализаторы

│   │   ├── permissions.py   # Права доступа

│   │   └── urls.py          # Маршруты API

│   └── backend/             # Настройки Django

├── frontend/                # React приложение

│   └── src/

│       ├── components/      # UI компоненты

│       ├── pages/           # Страницы

│       └── services/        # API сервисы

└── README.md



🔄 API Endpoints

Метод	URL	               Описание

POST	/api/register/	       Регистрация

POST	/api/token/	       Получение JWT токена

GET	/api/consultants/      Список консультантов

GET	/api/categories/       Список категорий

GET	/api/schedules/	       Расписание

POST	/api/consultations/    Создание консультации



📄 Лицензия

MIT License

