from rest_framework import serializers

from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=200, min_length=3)
    description = serializers.CharField(max_length=5000, min_length=10)
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    enrollment_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'teacher', 'teacher_name',
                  'enrollment_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'teacher', 'created_at', 'updated_at']

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']
