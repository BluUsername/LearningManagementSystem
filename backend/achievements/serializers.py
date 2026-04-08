from rest_framework import serializers

from .models import AchievementDefinition, UserAchievement


class AchievementDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for achievement definitions."""

    class Meta:
        model = AchievementDefinition
        fields = [
            'id', 'key', 'name', 'description',
            'icon', 'color', 'category', 'sort_order',
        ]


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for a user's earned achievements."""

    achievement = AchievementDefinitionSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'earned_at']
        read_only_fields = ['id', 'earned_at']
