from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Avg, Count
from .models import Profile, ConsultantProfile, ConsultationCategory, Schedule, Consultation, Review
from .serializers import (
    UserSerializer, ProfileSerializer, ConsultantProfileSerializer,
    RegisterSerializer, CategorySerializer, ScheduleSerializer,
    ConsultationSerializer, ReviewSerializer
)
from .permissions import IsClient, IsConsultant, IsAdmin


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class ConsultantListView(generics.ListAPIView):
    serializer_class = ConsultantProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = ConsultantProfile.objects.filter(is_available=True)
        specialization = self.request.query_params.get('specialization', None)
        min_rating = self.request.query_params.get('min_rating', None)

        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))

        return queryset


class ConsultantDetailView(generics.RetrieveAPIView):
    queryset = ConsultantProfile.objects.all()
    serializer_class = ConsultantProfileSerializer
    permission_classes = [permissions.AllowAny]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = ConsultationCategory.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.AllowAny()]


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Для всех пользователей показываем свободные слоты
        queryset = Schedule.objects.filter(is_booked=False)

        # Если пользователь авторизован и консультант - показывает его расписание
        if self.request.user.is_authenticated and self.request.user.profile.user_type == 'consultant':
            return Schedule.objects.filter(consultant=self.request.user)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsConsultant()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(consultant=self.request.user)


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Consultation.objects.none()
        if user.profile.user_type == 'client':
            return Consultation.objects.filter(client=user)
        elif user.profile.user_type == 'consultant':
            return Consultation.objects.filter(consultant=user)
        return Consultation.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [IsClient()]
        elif self.action in ['update', 'partial_update']:
            return [IsConsultant()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        print("=== СОЗДАНИЕ КОНСУЛЬТАЦИИ ===")
        print("Пользователь:", request.user.username if request.user.is_authenticated else "Не авторизован")
        print("Тип пользователя:", request.user.profile.user_type if request.user.is_authenticated else "Нет")
        print("Данные запроса:", request.data)

        schedule_id = request.data.get('schedule')
        if not schedule_id:
            print("Ошибка: нет schedule_id")
            return Response({'error': 'Не указано расписание'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            schedule = Schedule.objects.get(id=schedule_id)
            print(
                f"Расписание найдено: ID={schedule.id}, consultant={schedule.consultant.username}, date={schedule.date}")
        except Schedule.DoesNotExist:
            print(f"Ошибка: расписание с ID={schedule_id} не найдено")
            return Response({'error': 'Расписание не найдено'}, status=status.HTTP_404_NOT_FOUND)

        if schedule.is_booked:
            print("Ошибка: время уже занято")
            return Response({'error': 'Это время уже занято'}, status=status.HTTP_400_BAD_REQUEST)

        # Создаем консультацию
        try:
            consultation = Consultation.objects.create(
                client=request.user,
                consultant=schedule.consultant,
                schedule=schedule,
                category=None,
                status='pending',
                topic=request.data.get('topic', 'Консультация'),
                notes=request.data.get('notes', '')
            )
            print(f"Консультация создана: ID={consultation.id}")
        except Exception as e:
            print(f"Ошибка при создании: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Помечаем слот как занятый
        schedule.is_booked = True
        schedule.save()
        print("Слот помечен как занятый")

        serializer = self.get_serializer(consultation)
        print("Ответ:", serializer.data)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        consultation = self.get_object()
        if request.user != consultation.consultant:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)

        consultation.status = 'confirmed'
        consultation.save()
        return Response({'status': 'confirmed'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        consultation = self.get_object()
        if request.user != consultation.consultant:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)

        consultation.status = 'completed'
        consultation.save()

        consultant_profile = consultation.consultant.consultant_profile
        consultant_profile.total_consultations += 1
        avg_rating = Review.objects.filter(consultant=consultation.consultant).aggregate(Avg('rating'))['rating__avg']
        if avg_rating:
            consultant_profile.rating = avg_rating
        consultant_profile.save()

        return Response({'status': 'completed'})


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Review.objects.filter(is_moderated=True)
        if user.profile.user_type == 'admin':
            return Review.objects.all()
        elif user.profile.user_type == 'consultant':
            return Review.objects.filter(consultant=user)
        return Review.objects.filter(client=user, is_moderated=True)

    def get_permissions(self):
        if self.action == 'create':
            return [IsClient()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        consultation_id = request.data.get('consultation')
        consultation = Consultation.objects.get(id=consultation_id)

        if consultation.client != request.user:
            return Response({'error': 'Вы можете оставить отзыв только о своей консультации'},
                            status=status.HTTP_403_FORBIDDEN)

        if consultation.status != 'completed':
            return Response({'error': 'Отзыв можно оставить только после завершения консультации'},
                            status=status.HTTP_400_BAD_REQUEST)

        if hasattr(consultation, 'review'):
            return Response({'error': 'Отзыв уже оставлен'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client=request.user, consultant=consultation.consultant)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def moderate(self, request, pk=None):
        review = self.get_object()
        review.is_moderated = True
        review.save()
        return Response({'status': 'moderated'})