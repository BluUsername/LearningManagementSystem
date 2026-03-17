from rest_framework import serializers

from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
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
