from rest_framework import serializers

from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for course data with computed fields."""

    title = serializers.CharField(max_length=200, min_length=3)
    description = serializers.CharField(max_length=5000, min_length=10)
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'teacher', 'teacher_name',
            'category', 'max_students',  # #11, #14
            'enrollment_count', 'is_full',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'teacher', 'created_at', 'updated_at']

    def get_enrollment_count(self, obj: Course) -> int:
        return obj.enrollments.count()


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for enrollment data with nested course info."""

    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'status', 'enrolled_at']  # #15 - status field
        read_only_fields = ['id', 'enrolled_at']
