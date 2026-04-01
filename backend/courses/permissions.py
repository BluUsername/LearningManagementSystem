from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import Course, Enrollment


class IsTeacherOrAdmin(BasePermission):
    """Allow read access to all authenticated users, write access to teachers and admins."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ('teacher', 'admin')


class IsCourseOwnerOrAdmin(BasePermission):
    """Allow read access to all, write access only to course owner or admin."""

    def has_object_permission(self, request: Request, view: APIView, obj: Course) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'admin' or obj.teacher == request.user


class IsStudent(BasePermission):
    """Allow access only to student users."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_authenticated and request.user.role == 'student'


class IsEnrolledOrCourseStaff(BasePermission):
    """Allow access to enrolled students, the course teacher, or admins."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user.is_authenticated:
            return False
        course_pk = view.kwargs.get('course_pk')
        if request.user.role == 'admin':
            return True
        if request.user.role == 'teacher':
            return Course.objects.filter(pk=course_pk, teacher=request.user).exists()
        return Enrollment.objects.filter(student=request.user, course_id=course_pk).exists()


class IsAssignmentCourseOwnerOrAdmin(BasePermission):
    """Read: any enrolled/staff. Write: course owner or admin only."""

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True  # read access checked by IsEnrolledOrCourseStaff
        course_pk = view.kwargs.get('course_pk')
        return (
            request.user.role == 'admin'
            or Course.objects.filter(pk=course_pk, teacher=request.user).exists()
        )
