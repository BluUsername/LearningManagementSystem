from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

from accounts.models import User
from courses.models import Course, Enrollment
from .models import AchievementDefinition, UserAchievement
from .services import check_achievements


class AchievementDefinitionTests(TestCase):
    """Tests for listing achievement definitions."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='student', email='student@example.com',
            password='testpass123', role='student',
        )
        self.token = Token.objects.create(user=self.user)

    def test_list_achievements(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get('/api/achievements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        # Seeded by data migration
        self.assertGreaterEqual(len(results), 10)

    def test_list_achievements_unauthenticated(self):
        response = self.client.get('/api/achievements/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CheckAchievementsTests(TestCase):
    """Tests for the achievement evaluation service and endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='student', email='student@example.com',
            password='testpass123', role='student',
        )
        self.teacher = User.objects.create_user(
            username='teacher', email='teacher@example.com',
            password='testpass123', role='teacher',
        )
        self.student_token = Token.objects.create(user=self.student)
        self.teacher_token = Token.objects.create(user=self.teacher)

    def test_check_awards_general_achievements(self):
        """First check should award general achievements like first_login."""
        newly_earned = check_achievements(self.student)
        earned_keys = [ua.achievement.key for ua in newly_earned]
        self.assertIn('first_login', earned_keys)
        self.assertIn('explorer', earned_keys)
        self.assertIn('community_member', earned_keys)

    def test_check_no_duplicates(self):
        """Calling check twice should not duplicate achievements."""
        check_achievements(self.student)
        first_count = UserAchievement.objects.filter(user=self.student).count()
        check_achievements(self.student)
        second_count = UserAchievement.objects.filter(user=self.student).count()
        self.assertEqual(first_count, second_count)

    def test_enrollment_achievement(self):
        """Enrolling in a course should unlock first_enrollment."""
        course = Course.objects.create(
            title='Test Course', description='Desc', teacher=self.teacher,
        )
        Enrollment.objects.create(student=self.student, course=course)
        newly_earned = check_achievements(self.student)
        earned_keys = [ua.achievement.key for ua in newly_earned]
        self.assertIn('first_enrollment', earned_keys)

    def test_profile_complete_achievement(self):
        """Adding a bio should unlock profile_complete."""
        self.student.bio = 'I love learning!'
        self.student.save()
        newly_earned = check_achievements(self.student)
        earned_keys = [ua.achievement.key for ua in newly_earned]
        self.assertIn('profile_complete', earned_keys)

    def test_teacher_achievements(self):
        """Creating a course should unlock course_creator."""
        Course.objects.create(
            title='My Course', description='Desc', teacher=self.teacher,
        )
        newly_earned = check_achievements(self.teacher)
        earned_keys = [ua.achievement.key for ua in newly_earned]
        self.assertIn('course_creator', earned_keys)

    def test_check_endpoint(self):
        """POST /api/achievements/check/ should return newly earned."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.post('/api/achievements/check/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    def test_my_achievements_endpoint(self):
        """GET /api/achievements/me/ lists earned achievements."""
        check_achievements(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.get('/api/achievements/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    def test_student_does_not_earn_teacher_achievements(self):
        """Students should not earn teacher-category achievements."""
        check_achievements(self.student)
        earned_keys = set(
            UserAchievement.objects.filter(user=self.student).values_list(
                'achievement__key', flat=True,
            )
        )
        self.assertNotIn('course_creator', earned_keys)
        self.assertNotIn('popular_teacher', earned_keys)
        self.assertNotIn('prolific_teacher', earned_keys)
