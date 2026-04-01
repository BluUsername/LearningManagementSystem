"""
Achievement evaluation service.

Contains the logic for checking which achievements a user qualifies for
and awarding any newly earned ones. This is the single place where
achievement criteria are defined — the equivalent of the frontend's
`check()` callbacks, but server-side and persistent.
"""
import logging

from .models import AchievementDefinition, UserAchievement

logger = logging.getLogger(__name__)


def _get_user_stats(user) -> dict:
    """Gather the stats needed to evaluate achievement criteria."""
    from courses.models import Enrollment, Submission

    stats = {
        'enrollment_count': 0,
        'course_count': 0,
        'total_students': 0,
        'has_bio': bool(user.bio and user.bio.strip()),
        'submission_count': 0,
        'graded_count': 0,
    }

    if user.role == 'student':
        stats['enrollment_count'] = Enrollment.objects.filter(
            student=user,
        ).count()
        stats['submission_count'] = Submission.objects.filter(
            student=user,
        ).count()
        stats['graded_count'] = Submission.objects.filter(
            student=user, status='graded',
        ).count()

    elif user.role == 'teacher':
        taught = user.taught_courses.filter(is_active=True)
        stats['course_count'] = taught.count()
        stats['total_students'] = Enrollment.objects.filter(
            course__in=taught,
        ).count()

    return stats


# Registry of check functions keyed by achievement `key`.
# Each function receives (stats, user) and returns True if earned.
ACHIEVEMENT_CHECKS = {
    'first_login':       lambda stats, user: True,
    'profile_complete':  lambda stats, user: stats['has_bio'],
    'first_enrollment':  lambda stats, user: stats['enrollment_count'] >= 1,
    'three_courses':     lambda stats, user: stats['enrollment_count'] >= 3,
    'five_courses':      lambda stats, user: stats['enrollment_count'] >= 5,
    'course_creator':    lambda stats, user: stats['course_count'] >= 1,
    'popular_teacher':   lambda stats, user: stats['total_students'] >= 5,
    'prolific_teacher':  lambda stats, user: stats['course_count'] >= 3,
    'explorer':          lambda stats, user: True,
    'community_member':  lambda stats, user: True,
    'first_submission':  lambda stats, user: stats['submission_count'] >= 1,
    'first_graded':      lambda stats, user: stats['graded_count'] >= 1,
}


def check_achievements(user) -> list:
    """
    Evaluate all achievement criteria for a user and award new ones.

    Returns a list of newly earned UserAchievement instances.
    """
    stats = _get_user_stats(user)

    # Get achievement keys the user already has
    earned_keys = set(
        UserAchievement.objects.filter(user=user).values_list(
            'achievement__key', flat=True,
        )
    )

    # Filter to role-appropriate achievements the user hasn't earned yet
    role_categories = ['general']
    if user.role == 'student':
        role_categories.append('student')
    elif user.role == 'teacher':
        role_categories.append('teacher')

    candidates = AchievementDefinition.objects.filter(
        category__in=role_categories,
    ).exclude(key__in=earned_keys)

    newly_earned = []
    for definition in candidates:
        check_fn = ACHIEVEMENT_CHECKS.get(definition.key)
        if check_fn and check_fn(stats, user):
            ua, created = UserAchievement.objects.get_or_create(
                user=user, achievement=definition,
            )
            if created:
                newly_earned.append(ua)
                logger.info(
                    f"Achievement unlocked: {user.username} earned "
                    f"'{definition.name}'"
                )

    return newly_earned
