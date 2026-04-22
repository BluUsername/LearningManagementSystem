from django.urls import path

from . import views

urlpatterns = [
    path('courses/', views.CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:pk>/enroll/', views.EnrollView.as_view(), name='course-enroll'),
    path('courses/<int:pk>/unenroll/', views.UnenrollView.as_view(), name='course-unenroll'),
    path('enrollments/', views.MyEnrollmentsView.as_view(), name='my-enrollments'),
    # Assignments
    path(
        'courses/<int:course_pk>/assignments/',
        views.AssignmentListCreateView.as_view(),
        name='assignment-list',
    ),
    path(
        'courses/<int:course_pk>/assignments/<int:pk>/',
        views.AssignmentDetailView.as_view(),
        name='assignment-detail',
    ),
    # Submissions
    path(
        'assignments/<int:assignment_pk>/submit/',
        views.SubmissionCreateView.as_view(),
        name='submission-create',
    ),
    path(
        'assignments/<int:assignment_pk>/submissions/',
        views.SubmissionListView.as_view(),
        name='submission-list',
    ),
    path(
        'submissions/<int:pk>/',
        views.SubmissionDetailView.as_view(),
        name='submission-detail',
    ),
    path(
        'submissions/<int:pk>/grade/',
        views.GradeSubmissionView.as_view(),
        name='submission-grade',
    ),
    path('my-submissions/', views.MySubmissionsView.as_view(), name='my-submissions'),
]
