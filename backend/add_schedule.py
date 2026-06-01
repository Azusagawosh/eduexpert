import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Schedule
from datetime import date, time, timedelta

print("=== Добавляем расписание для консультантов ===\n")

today = date.today()
tutors = User.objects.filter(profile__user_type='consultant')
slots_added = 0

if not tutors.exists():
    print("❌ Нет консультантов в системе!")
    print("Сначала создайте консультантов через админку или shell")
else:
    for tutor in tutors:
        print(f"📚 {tutor.username}:")

        for i in range(7):
            d = today + timedelta(days=i + 1)

            # Утро 10:00
            obj, created = Schedule.objects.get_or_create(
                consultant=tutor,
                date=d,
                start_time=time(10, 0),
                defaults={'end_time': time(11, 0), 'is_booked': False}
            )
            if created:
                slots_added += 1
                print(f"  ✅ {d}: 10:00-11:00")

            # День 14:00
            obj, created = Schedule.objects.get_or_create(
                consultant=tutor,
                date=d,
                start_time=time(14, 0),
                defaults={'end_time': time(15, 0), 'is_booked': False}
            )
            if created:
                slots_added += 1
                print(f"  ✅ {d}: 14:00-15:00")

            # Вечер 18:00
            obj, created = Schedule.objects.get_or_create(
                consultant=tutor,
                date=d,
                start_time=time(18, 0),
                defaults={'end_time': time(19, 0), 'is_booked': False}
            )
            if created:
                slots_added += 1
                print(f"  ✅ {d}: 18:00-19:00")

    print(f"\n✅ Добавлено {slots_added} слотов!")
    print(f"📊 Всего слотов в системе: {Schedule.objects.count()}")

    print("\n📅 Свободные слоты (первые 10):")
    free_slots = Schedule.objects.filter(is_booked=False)[:10]
    for slot in free_slots:
        print(f"  {slot.consultant.username} | {slot.date} {slot.start_time}-{slot.end_time}")