from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('categories', views.CategoryViewSet, basename='category')
router.register('schedules', views.ScheduleViewSet, basename='schedule')
router.register('consultations', views.ConsultationViewSet, basename='consultation')
router.register('reviews', views.ReviewViewSet, basename='review')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('consultants/', views.ConsultantListView.as_view(), name='consultant-list'),
    path('consultants/<int:pk>/', views.ConsultantDetailView.as_view(), name='consultant-detail'),
    path('', include(router.urls)),
]
