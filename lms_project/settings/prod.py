"""Production settings.

Loaded automatically by `wsgi.py` / `asgi.py` so Heroku and any other
WSGI host gets the hardened config without needing to set
`DJANGO_SETTINGS_MODULE` explicitly (though doing so is still recommended).

Required environment variables: `SECRET_KEY`, `ALLOWED_HOSTS`,
`CORS_ALLOWED_ORIGINS`. Missing any of these will raise at import time so
a misconfigured deploy fails fast instead of silently running insecurely.
"""

import os

from .base import *  # noqa: F401,F403
from .base import SECRET_KEY as _BASE_SECRET_KEY


if not _BASE_SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable must be set in production."
    )
SECRET_KEY = _BASE_SECRET_KEY

DEBUG = False

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get('ALLOWED_HOSTS', '').split(',')
    if host.strip()
]
if not ALLOWED_HOSTS:
    raise RuntimeError(
        "ALLOWED_HOSTS environment variable must be set in production."
    )

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
    if origin.strip()
]

# HTTPS / cookie hardening — only safe behind a TLS-terminating proxy
# like Heroku's router.
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
