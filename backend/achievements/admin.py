from django.contrib import admin

from .models import AchievementDefinition, UserAchievement

admin.site.register(AchievementDefinition)
admin.site.register(UserAchievement)
