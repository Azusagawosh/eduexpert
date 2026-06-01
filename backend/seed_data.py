import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Profile, ConsultantProfile, ConsultationCategory, Schedule
from datetime import date, time, timedelta


def seed_database():
    print("🌱 Заполнение базы данных...")

    # Создаем категории
    categories = [
        'Математика', 'Английский язык', 'Программирование Python',
        'Физика', 'Химия', 'История', 'Подготовка к ЕГЭ', 'JavaScript / React'
    ]

    for cat in categories:
        obj, created = ConsultationCategory.objects.get_or_create(name=cat)
        if created:
            print(f"  ✅ Создана категория: {cat}")

    # Создаем экспертов
    experts = [
        ('math_pro', 'Анна', 'Смирнова', 'math@tutor.com', 'Математика (алгебра, геометрия)', 10, 2500),
        ('eng_teacher', 'Елена', 'Иванова', 'eng@tutor.com', 'Английский язык, IELTS', 8, 3000),
        ('python_dev', 'Дмитрий', 'Волков', 'python@tutor.com', 'Python разработка', 7, 3500),
        ('physics_tutor', 'Сергей', 'Морозов', 'physics@tutor.com', 'Физика, подготовка к ЕГЭ', 12, 2000),
    ]

    for username, first, last, email, spec, exp, rate in experts:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first,
                'last_name': last
            }
        )
        if created:
            user.set_password('tutor123456')
            user.save()
            user.profile.user_type = 'consultant'
            user.profile.save()

            ConsultantProfile.objects.create(
                user=user,
                specialization=spec,
                experience_years=exp,
                hourly_rate=rate,
                is_available=True,
                rating=5.0
            )
            print(f"  ✅ Создан эксперт: {first} {last}")

    # Добавляем расписание для экспертов
    today = date.today()
    for user in User.objects.filter(profile__user_type='consultant'):
        added = 0
        for i in range(7):  # на неделю вперед
            d = today + timedelta(days=i + 1)
            for hour in [10, 14, 18]:
                obj, created = Schedule.objects.get_or_create(
                    consultant=user,
                    date=d,
                    start_time=time(hour, 0),
                    defaults={'end_time': time(hour + 1, 0), 'is_booked': False}
                )
                if created:
                    added += 1
        if added > 0:
            print(f"  ✅ Добавлено расписание для {user.username}: {added} слотов")

    print(f"\n✨ Готово!")
    print(f"  📊 Экспертов: {ConsultantProfile.objects.count()}")
    print(f"  📊 Категорий: {ConsultationCategory.objects.count()}")
    print(f"  📊 Слотов: {Schedule.objects.count()}")


if __name__ == '__main__':
    seed_database()