from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import User


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_student(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newstudent',
            'email': 'student@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': 'student',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['role'], 'student')

    def test_register_teacher(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newteacher',
            'email': 'teacher@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': 'teacher',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'teacher')

    def test_register_password_mismatch(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password2': 'wrongpass123',
            'role': 'student',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        User.objects.create_user(username='existing', email='a@example.com', password='pass1234')
        response = self.client.post('/api/auth/register/', {
            'username': 'existing',
            'email': 'b@example.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': 'student',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com',
            password='testpass123', role='student',
        )

    def test_login_valid(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_login_invalid(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CurrentUserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com',
            password='testpass123', role='student',
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_get_current_user(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['role'], 'student')

    def test_unauthenticated_access(self):
        client = APIClient()
        response = client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin', email='admin@example.com',
            password='testpass123', role='admin',
        )
        self.student = User.objects.create_user(
            username='student', email='student@example.com',
            password='testpass123', role='student',
        )
        self.admin_token = Token.objects.create(user=self.admin)
        self.student_token = Token.objects.create(user=self.student)

    def test_user_list_admin_only(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_user_list_student_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_delete_admin_only(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.delete(f'/api/users/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.student.id).exists())

    def test_user_delete_student_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.delete(f'/api/users/{self.admin.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
