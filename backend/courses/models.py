from django.conf import settings
from django.db import models


class Course(models.Model):
    """A course created by a teacher or admin."""

    title = models.CharField(max_length=200)
    description = models.TextField()
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='taught_courses',
    )
    # #11 - Course capacity limit (null = unlimited)
    max_students = models.PositiveIntegerField(null=True, blank=True)
    # #14 - Course category
    category = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # #12 - Soft delete support
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.title

    @property
    def is_full(self) -> bool:
        """Check if course has reached its capacity limit."""
        if self.max_students is None:
            return False
        return self.enrollments.count() >= self.max_students


class Enrollment(models.Model):
    """A student's enrollment in a course with status tracking."""

    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    # #15 - Enrollment status tracking
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='enrolled',
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self) -> str:
        return f"{self.student.username} enrolled in {self.course.title}"
