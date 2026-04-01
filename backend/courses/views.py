import logging

from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Assignment, Course, Enrollment, Submission
from .permissions import (
    IsAssignmentCourseOwnerOrAdmin,
    IsCourseOwnerOrAdmin,
    IsEnrolledOrCourseStaff,
    IsStudent,
    IsTeacherOrAdmin,
)
from .serializers import (
    AssignmentSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    GradeSubmissionSerializer,
    SubmissionSerializer,
)

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


# ---------------------------------------------------------------------------
# Assignment views
# ---------------------------------------------------------------------------

class AssignmentListCreateView(generics.ListCreateAPIView):
    """List assignments for a course, or create one (course owner/admin)."""

    serializer_class = AssignmentSerializer
    permission_classes = [IsEnrolledOrCourseStaff, IsAssignmentCourseOwnerOrAdmin]

    def get_queryset(self):
        return Assignment.objects.select_related('course').annotate(
            _submission_count=Count('submissions'),
        ).filter(
            course_id=self.kwargs['course_pk'],
            course__is_active=True,
        )

    def perform_create(self, serializer: AssignmentSerializer) -> None:
        course = Course.objects.get(pk=self.kwargs['course_pk'], is_active=True)
        assignment = serializer.save(course=course)
        logger.info(
            f"Assignment created: '{assignment.title}' for "
            f"'{course.title}' by {self.request.user.username}"
        )


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an assignment."""

    serializer_class = AssignmentSerializer
    permission_classes = [IsEnrolledOrCourseStaff, IsAssignmentCourseOwnerOrAdmin]

    def get_queryset(self):
        return Assignment.objects.select_related('course').annotate(
            _submission_count=Count('submissions'),
        ).filter(
            course_id=self.kwargs['course_pk'],
            course__is_active=True,
        )


class SubmissionCreateView(APIView):
    """Student submits work for an assignment."""

    permission_classes = [IsStudent]

    def post(self, request: Request, assignment_pk: int) -> Response:
        try:
            assignment = Assignment.objects.select_related('course').get(
                pk=assignment_pk, course__is_active=True,
            )
        except Assignment.DoesNotExist:
            return Response(
                {'detail': 'Assignment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Student must be enrolled in the course
        if not Enrollment.objects.filter(
            student=request.user, course=assignment.course,
        ).exists():
            return Response(
                {'detail': 'You must be enrolled in this course.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # One submission per student per assignment
        if Submission.objects.filter(
            assignment=assignment, student=request.user,
        ).exists():
            return Response(
                {'detail': 'You have already submitted this assignment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content = request.data.get('content', '')
        uploaded_file = request.FILES.get('file')

        # Must provide at least text content or a file
        if not content.strip() and not uploaded_file:
            return Response(
                {'detail': 'Please provide text content or upload a file.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission = Submission.objects.create(
            assignment=assignment,
            student=request.user,
            content=content,
            file=uploaded_file,
        )
        logger.info(
            f"Submission by {request.user.username} for "
            f"'{assignment.title}'"
            f"{' (with file)' if uploaded_file else ''}"
        )
        return Response(
            SubmissionSerializer(submission, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class SubmissionListView(generics.ListAPIView):
    """List submissions for an assignment (teacher sees all, student sees own)."""

    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Submission.objects.select_related(
            'student', 'assignment',
        ).filter(assignment_id=self.kwargs['assignment_pk'])

        # Students can only see their own submission
        if self.request.user.role == 'student':
            qs = qs.filter(student=self.request.user)
        # Teachers can only see submissions for their own courses
        elif self.request.user.role == 'teacher':
            qs = qs.filter(assignment__course__teacher=self.request.user)
        return qs


class SubmissionDetailView(generics.RetrieveAPIView):
    """View a single submission."""

    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Submission.objects.select_related('student', 'assignment')
        if self.request.user.role == 'student':
            qs = qs.filter(student=self.request.user)
        elif self.request.user.role == 'teacher':
            qs = qs.filter(assignment__course__teacher=self.request.user)
        return qs


class GradeSubmissionView(APIView):
    """Teacher or admin grades a student's submission."""

    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, pk: int) -> Response:
        if request.user.role not in ('teacher', 'admin'):
            return Response(
                {'detail': 'Only teachers and admins can grade submissions.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            submission = Submission.objects.select_related(
                'assignment__course',
            ).get(pk=pk)
        except Submission.DoesNotExist:
            return Response(
                {'detail': 'Submission not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Teachers can only grade submissions for their own courses
        course = submission.assignment.course
        if request.user.role == 'teacher' and course.teacher != request.user:
            return Response(
                {'detail': 'You can only grade submissions for your courses.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = GradeSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Validate grade doesn't exceed max points
        if serializer.validated_data['grade'] > submission.assignment.max_points:
            return Response(
                {'detail': f'Grade cannot exceed {submission.assignment.max_points} points.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission.grade = serializer.validated_data['grade']
        submission.feedback = serializer.validated_data['feedback']
        submission.status = 'graded'
        submission.graded_at = timezone.now()
        submission.save()

        logger.info(
            f"Submission graded: {submission.student.username} got "
            f"{submission.grade}/{submission.assignment.max_points} "
            f"on '{submission.assignment.title}'"
        )
        return Response(
            SubmissionSerializer(submission, context={'request': request}).data,
        )


class MySubmissionsView(generics.ListAPIView):
    """List the current student's submissions across all courses."""

    serializer_class = SubmissionSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Submission.objects.select_related(
            'assignment', 'assignment__course',
        ).filter(student=self.request.user)
