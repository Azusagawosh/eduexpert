import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import ConsultationCategory, User, ConsultantProfile
from django.contrib.auth.models import User

# Категории
categories = {
    'Школьные предметы': [
        'Математика (алгебра, геометрия)',
        'Русский язык и литература',
        'Физика',
        'Химия',
        'Биология',
        'История и обществознание',
        'Английский язык',
        'Информатика',
    ],
    'Подготовка к экзаменам': [
        'Подготовка к ЕГЭ',
        'Подготовка к ОГЭ',
        'ВПР',
        'Олимпиадная математика',
    ],
    'Иностранные языки': [
        'Английский язык',
        'Немецкий язык',
        'Французский язык',
        'Испанский язык',
        'Китайский язык',
        'Разговорный английский',
        'Бизнес-английский',
    ],
    'Программирование': [
        'Python для начинающих',
        'JavaScript / React',
        'Java / Spring',
        'C++ / C#',
        'Веб-разработка (HTML/CSS/JS)',
        'Разработка игр (Unity)',
        'Создание сайтов',
        'Мобильная разработка',
    ],
    'Дополнительные направления': [
        'Скорочтение',
        'Каллиграфия',
        'Логика и мышление',
        'Профориентация',
    ]
}

print("Добавление категорий...")
for group, cat_list in categories.items():
    for cat_name in cat_list:
        obj, created = ConsultationCategory.objects.get_or_create(
            name=cat_name,
            defaults={'description': f'{group} - {cat_name}', 'is_active': True}
        )
        if created:
            print(f"  ✅ Создана: {cat_name}")
        else:
            print(f"  ⏭️ Уже есть: {cat_name}")

print(f"\n✅ Всего категорий: {ConsultationCategory.objects.count()}")

# Создаем тестового репетитора
print("\nСоздание тестового репетитора...")

tutor_data = [
    ('math_tutor', 'math@tutor.com', 'math123456', 'Анна', 'Смирнова',
     'Математика (алгебра, геометрия)', 'МГУ им. Ломоносова, механико-математический факультет',
     'Индивидуальный подход, разбор сложных тем', 10, 2500, 90, 'Zoom, Skype'),

    ('eng_tutor', 'english@tutor.com', 'eng123456', 'Елена', 'Иванова',
     'Английский язык (разговорный, бизнес, IELTS)', 'МГЛУ, сертификат CELTA',
     'Коммуникативная методика, разговорная практика', 8, 3000, 60, 'Zoom, Google Meet'),

    ('python_tutor', 'python@tutor.com', 'python123456', 'Дмитрий', 'Волков',
     'Python для начинающих', 'СПбГУ, курсы Python Advanced',
     'Практические проекты, разбор кода', 7, 3500, 90, 'Discord, VS Code Live Share'),

    ('history_tutor', 'history@tutor.com', 'history123456', 'Сергей', 'Морозов',
     'История и обществознание', 'МПГУ, исторический факультет',
     'Интерактивные презентации, работа с картами', 12, 2000, 60, 'Zoom'),

    ('chinese_tutor', 'chinese@tutor.com', 'chinese123456', 'Ольга', 'Ким',
     'Китайский язык', 'ДВФУ, стажировка в Пекине',
     'Иероглифика, тоны, разговорная практика', 5, 4000, 60, 'Skype, WeChat'),
]

for data in tutor_data:
    username, email, password, first_name, last_name, spec, edu, method, exp, rate, duration, platform = data

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name
        }
    )

    if created:
        user.set_password(password)
        user.save()
        user.profile.user_type = 'consultant'
        user.profile.bio = f'Репетитор по {spec}'
        user.profile.save()

        ConsultantProfile.objects.create(
            user=user,
            specialization=spec,
            experience_years=exp,
            hourly_rate=rate,
            is_available=True,
            rating=5.0,
            education=edu,
            teaching_methods=method,
            free_first_lesson=True,
            lesson_duration=duration,
            online_platforms=platform
        )
        print(f"  ✅ Создан репетитор: {first_name} {last_name} - {spec}")
    else:
        print(f"  ⏭️ Уже существует: {username}")

print("\n🎉 Готово! Все данные добавлены!")
