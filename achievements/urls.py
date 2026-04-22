from django.urls import path

from . import views

urlpatterns = [
    path('achievements/', views.AchievementListView.as_view(), name='achievement-list'),
    path('achievements/me/', views.MyAchievementsView.as_view(), name='my-achievements'),
    path('achievements/check/', views.CheckAchievementsView.as_view(), name='check-achievements'),
]
