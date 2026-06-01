from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, ConsultantProfile, ConsultationCategory, Schedule, Consultation, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'user', 'user_type', 'phone', 'avatar', 'bio', 'created_at')


class ConsultantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ConsultantProfile
        fields = ('id', 'user', 'specialization', 'experience_years', 'hourly_rate', 'is_available', 'rating',
                  'total_consultations')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    user_type = serializers.ChoiceField(choices=Profile.USER_TYPES, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'user_type')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.profile.user_type = user_type
        user.profile.save()

        if user_type == 'consultant':
            ConsultantProfile.objects.create(user=user)

        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationCategory
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ('id', 'consultant', 'date', 'start_time', 'end_time', 'is_booked')
        read_only_fields = ('consultant',)


class ConsultationSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.username', read_only=True)
    consultant_name = serializers.CharField(source='consultant.username', read_only=True)
    schedule_date = serializers.DateField(source='schedule.date', read_only=True)
    schedule_start = serializers.TimeField(source='schedule.start_time', read_only=True)
    schedule_end = serializers.TimeField(source='schedule.end_time', read_only=True)

    class Meta:
        model = Consultation
        fields = ('id', 'client', 'consultant', 'client_name', 'consultant_name',
                  'schedule', 'schedule_date', 'schedule_start', 'schedule_end',
                  'category', 'status', 'topic', 'notes', 'created_at')
        read_only_fields = ('client', 'consultant', 'status', 'created_at')


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'consultation', 'client', 'client_name', 'consultant', 'rating', 'comment', 'is_moderated',
                  'created_at')
        read_only_fields = ('client', 'is_moderated')