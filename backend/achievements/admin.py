from django.contrib import admin

from .models import AchievementDefinition, UserAchievement


@admin.register(AchievementDefinition)
class AchievementDefinitionAdmin(admin.ModelAdmin):
    pass


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    pass
