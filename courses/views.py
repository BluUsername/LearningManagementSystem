import logging

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, Enrollment
from .permissions import IsTeacherOrAdmin, IsCourseOwnerOrAdmin, IsStudent
from .serializers import CourseSerializer, EnrollmentSerializer

logger = logging.getLogger(__name__)


class CourseListCreateView(generics.ListCreateAPIView):
    """List all courses or create a new one (teacher/admin only)."""

    queryset = Course.objects.select_related('teacher').filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]
    # #10 - Search and filtering
    filterset_fields = ['teacher', 'category']
    search_fields = ['title', 'description', 'teacher__username', 'category']
    ordering_fields = ['title', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def perform_create(self, serializer: CourseSerializer) -> None:
        course = serializer.save(teacher=self.request.user)
        logger.info(f"Course created: '{course.title}' by {self.request.user.username}")


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a course."""

    queryset = Course.objects.select_related('teacher').all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsCourseOwnerOrAdmin]

    def perform_destroy(self, instance: Course) -> None:
        """#12 - Soft delete: mark as inactive instead of deleting."""
        instance.is_active = False
        instance.save()
        logger.info(f"Course soft-deleted: '{instance.title}'")


class EnrollView(APIView):
    """Enroll the current student in a course."""

    permission_classes = [IsStudent]

    def post(self, request: Request, pk: int) -> Response:
        try:
            course = Course.objects.get(pk=pk, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {'detail': 'Course not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # #11 - Check capacity
        if course.is_full:
            return Response(
                {'detail': 'This course is full.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {'detail': 'Already enrolled in this course.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollment = Enrollment.objects.create(student=request.user, course=course)
        logger.info(f"Student {request.user.username} enrolled in '{course.title}'")
        return Response(
            EnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED,
        )


class UnenrollView(APIView):
    """Unenroll the current student from a course."""

    permission_classes = [IsStudent]

    def delete(self, request: Request, pk: int) -> Response:
        try:
            enrollment = Enrollment.objects.get(student=request.user, course_id=pk)
        except Enrollment.DoesNotExist:
            return Response(
                {'detail': 'Not enrolled in this course.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        logger.info(f"Student {request.user.username} unenrolled from course {pk}")
        enrollment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyEnrollmentsView(generics.ListAPIView):
    """List the current student's enrollments."""

    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.select_related(
            'course', 'course__teacher'
        ).filter(student=self.request.user)
