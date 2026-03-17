from django.urls import path

from . import views

urlpatterns = [
    path('courses/', views.CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:pk>/enroll/', views.EnrollView.as_view(), name='course-enroll'),
    path('courses/<int:pk>/unenroll/', views.UnenrollView.as_view(), name='course-unenroll'),
    path('enrollments/', views.MyEnrollmentsView.as_view(), name='my-enrollments'),
]
