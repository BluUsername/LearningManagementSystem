from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AchievementDefinition, UserAchievement
from .serializers import AchievementDefinitionSerializer, UserAchievementSerializer
from .services import check_achievements


class AchievementListView(generics.ListAPIView):
    """List all achievement definitions."""

    queryset = AchievementDefinition.objects.all()
    serializer_class = AchievementDefinitionSerializer
    permission_classes = [IsAuthenticated]


class MyAchievementsView(generics.ListAPIView):
    """List the current user's earned achievements."""

    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.select_related(
            'achievement',
        ).filter(user=self.request.user)


class CheckAchievementsView(APIView):
    """Evaluate and award any new achievements for the current user."""

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        newly_earned = check_achievements(request.user)
        serializer = UserAchievementSerializer(newly_earned, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
