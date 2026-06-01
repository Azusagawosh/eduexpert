from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    USER_TYPES = (
        ('client', 'Клиент'),
        ('consultant', 'Консультант'),
        ('admin', 'Администратор'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='client')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"


class ConsultantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='consultant_profile')
    specialization = models.CharField(max_length=200, blank=True)
    experience_years = models.IntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    total_consultations = models.IntegerField(default=0)

    # Дополнительные поля для репетиторов
    education = models.TextField(blank=True)
    teaching_methods = models.TextField(blank=True)
    free_first_lesson = models.BooleanField(default=False)
    lesson_duration = models.IntegerField(default=60)
    students_count = models.IntegerField(default=0)
    online_platforms = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.specialization}"


class ConsultationCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Schedule(models.Model):
    consultant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ['consultant', 'date', 'start_time']

    def __str__(self):
        return f"{self.consultant.username} - {self.date} {self.start_time}"


class Consultation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Ожидает подтверждения'),
        ('confirmed', 'Подтверждена'),
        ('completed', 'Завершена'),
        ('cancelled', 'Отменена'),
    )

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_consultations')
    consultant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultant_consultations')
    schedule = models.OneToOneField(Schedule, on_delete=models.CASCADE, related_name='consultation')
    category = models.ForeignKey(ConsultationCategory, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    topic = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.username} - {self.consultant.username} - {self.schedule.date}"


class Review(models.Model):
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='review')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    consultant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_moderated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.username} -> {self.consultant.username}: {self.rating}★"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
    