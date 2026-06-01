from django.contrib import admin
from .models import Profile, ConsultantProfile, ConsultationCategory, Schedule, Consultation, Review

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_type', 'phone', 'created_at')
    list_filter = ('user_type',)
    search_fields = ('user__username', 'user__email', 'phone')
    raw_id_fields = ('user',)

@admin.register(ConsultantProfile)
class ConsultantProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'experience_years', 'hourly_rate', 'is_available', 'rating')
    list_filter = ('is_available', 'specialization')
    search_fields = ('user__username', 'specialization')
    raw_id_fields = ('user',)

@admin.register(ConsultationCategory)
class ConsultationCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('consultant', 'date', 'start_time', 'end_time', 'is_booked')
    list_filter = ('is_booked', 'date')
    search_fields = ('consultant__username',)
    raw_id_fields = ('consultant',)

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('client', 'consultant', 'schedule', 'status', 'topic', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('client__username', 'consultant__username', 'topic')
    raw_id_fields = ('client', 'consultant', 'schedule', 'category')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('client', 'consultant', 'rating', 'is_moderated', 'created_at')
    list_filter = ('rating', 'is_moderated')
    search_fields = ('client__username', 'consultant__username', 'comment')
    raw_id_fields = ('client', 'consultant', 'consultation')
    