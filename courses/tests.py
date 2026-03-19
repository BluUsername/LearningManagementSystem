from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

from accounts.models import User
from .models import Course, Enrollment


class CourseListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(
            username='teacher', email='teacher@example.com',
            password='testpass123', role='teacher',
        )
        self.student = User.objects.create_user(
            username='student', email='student@example.com',
            password='testpass123', role='student',
        )
        self.teacher_token = Token.objects.create(user=self.teacher)
        self.student_token = Token.objects.create(user=self.student)

        self.course = Course.objects.create(
            title='Test Course', description='A test course', teacher=self.teacher,
        )

    def test_list_courses_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Paginated response: results are in response.data['results']
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    def test_list_courses_unauthenticated(self):
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CourseCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(
            username='teacher', email='teacher@example.com',
            password='testpass123', role='teacher',
        )
        self.student = User.objects.create_user(
            username='student', email='student@example.com',
            password='testpass123', role='student',
        )
        self.admin = User.objects.create_user(
            username='admin', email='admin@example.com',
            password='testpass123', role='admin',
        )
        self.teacher_token = Token.objects.create(user=self.teacher)
        self.student_token = Token.objects.create(user=self.student)
        self.admin_token = Token.objects.create(user=self.admin)

    def test_create_course_teacher(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.teacher_token.key}')
        response = self.client.post('/api/courses/', {
            'title': 'New Course',
            'description': 'A comprehensive course on the subject matter',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['teacher'], self.teacher.id)

    def test_create_course_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.post('/api/courses/', {
            'title': 'Admin Course',
            'description': 'A course created by the admin user',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_course_student_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.post('/api/courses/', {
            'title': 'Student Course',
            'description': 'This course should not be created',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CourseUpdateDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher1 = User.objects.create_user(
            username='teacher1', email='t1@example.com',
            password='testpass123', role='teacher',
        )
        self.teacher2 = User.objects.create_user(
            username='teacher2', email='t2@example.com',
            password='testpass123', role='teacher',
        )
        self.admin = User.objects.create_user(
            username='admin', email='admin@example.com',
            password='testpass123', role='admin',
        )
        self.t1_token = Token.objects.create(user=self.teacher1)
        self.t2_token = Token.objects.create(user=self.teacher2)
        self.admin_token = Token.objects.create(user=self.admin)

        self.course = Course.objects.create(
            title='Course 1', description='A test course description', teacher=self.teacher1,
        )

    def test_update_course_owner(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.t1_token.key}')
        response = self.client.put(f'/api/courses/{self.course.id}/', {
            'title': 'Updated Title',
            'description': 'An updated course description',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_update_course_non_owner_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.t2_token.key}')
        response = self.client.put(f'/api/courses/{self.course.id}/', {
            'title': 'Hacked Title',
            'description': 'This should not be allowed',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_course_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.delete(f'/api/courses/{self.course.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(id=self.course.id).exists())


class EnrollmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(
            username='teacher', email='teacher@example.com',
            password='testpass123', role='teacher',
        )
        self.student = User.objects.create_user(
            username='student', email='student@example.com',
            password='testpass123', role='student',
        )
        self.teacher_token = Token.objects.create(user=self.teacher)
        self.student_token = Token.objects.create(user=self.student)

        self.course = Course.objects.create(
            title='Test Course', description='A test course description', teacher=self.teacher,
        )

    def test_enroll_student(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(student=self.student, course=self.course).exists()
        )

    def test_enroll_duplicate(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unenroll_student(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.delete(f'/api/courses/{self.course.id}/unenroll/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Enrollment.objects.filter(student=self.student, course=self.course).exists()
        )

    def test_enroll_teacher_forbidden(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.teacher_token.key}')
        response = self.client.post(f'/api/courses/{self.course.id}/enroll/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_my_enrollments(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.student_token.key}')
        response = self.client.get('/api/enrollments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Paginated response: results are in response.data['results']
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
