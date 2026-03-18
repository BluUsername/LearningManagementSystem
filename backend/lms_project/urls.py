from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    return JsonResponse({
        'status': 'online',
        'application': 'LearnHub LMS API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'courses': '/api/courses/',
            'enrollments': '/api/enrollments/',
            'users': '/api/users/',
            'admin': '/admin/',
        },
        'frontend': 'https://thelearnhub.netlify.app',
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('courses.urls')),
]
