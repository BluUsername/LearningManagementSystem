"""
Custom exception handler for consistent API error responses.

All error responses follow the format:
{
    "error": {
        "status_code": 400,
        "message": "Human-readable error summary",
        "details": { ... }  # field-level errors or additional info
    }
}
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import APIException


def custom_exception_handler(exc: APIException, context: dict) -> Response | None:
    """Transform DRF exceptions into a consistent error response format."""
    response = exception_handler(exc, context)

    if response is None:
        return None

    # Build a consistent error envelope
    error_data = {
        'error': {
            'status_code': response.status_code,
            'message': _get_error_message(response),
            'details': response.data if isinstance(response.data, dict) else None,
        }
    }

    response.data = error_data
    return response


def _get_error_message(response: Response) -> str:
    """Extract a human-readable message from the response data."""
    data = response.data

    # Single detail string (e.g. {"detail": "Not found."})
    if isinstance(data, dict) and 'detail' in data:
        return str(data['detail'])

    # List of errors
    if isinstance(data, list):
        return '; '.join(str(item) for item in data)

    # Field validation errors — summarise field names
    if isinstance(data, dict):
        fields = ', '.join(data.keys())
        return f'Validation error on: {fields}'

    return 'An error occurred.'
