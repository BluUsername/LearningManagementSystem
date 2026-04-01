from django.conf import settings
from django.db import models


class AchievementDefinition(models.Model):
    """Defines an achievement that users can earn."""

    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    ]

    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=7)  # hex color, e.g. '#42a5f5'
    category = models.CharField(
        max_length=10, choices=CATEGORY_CHOICES, default='general',
    )
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'key']

    def __str__(self) -> str:
        return self.name


class UserAchievement(models.Model):
    """Records that a user has earned a specific achievement."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements',
    )
    achievement = models.ForeignKey(
        AchievementDefinition,
        on_delete=models.CASCADE,
        related_name='user_achievements',
    )
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-earned_at']

    def __str__(self) -> str:
        return f"{self.user.username} earned {self.achievement.name}"
