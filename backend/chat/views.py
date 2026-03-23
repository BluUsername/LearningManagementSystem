import logging
import re

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from courses.models import Course, Enrollment
from .models import ChatConversation, ChatMessage
from .serializers import (
    ChatConversationDetailSerializer,
    ChatConversationListSerializer,
    ChatMessageSerializer,
)

logger = logging.getLogger(__name__)

ASSISTANT_WELCOME = (
    "Hi! I'm your LearnHub assistant. I can help you with questions about your "
    "courses, coding concepts, and learning resources. Your conversation history "
    "is saved to your account, so you can always come back and pick up where you "
    "left off — even after closing the app on mobile or switching devices."
)


class ConversationListCreateView(generics.ListCreateAPIView):
    """List all conversations for the current user, or start a new one."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatConversationDetailSerializer
        return ChatConversationListSerializer

    def get_queryset(self):
        return ChatConversation.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        title = request.data.get('title', 'New Conversation')
        conversation = ChatConversation.objects.create(
            user=request.user,
            title=title,
        )
        ChatMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=ASSISTANT_WELCOME,
        )
        logger.info(f"Chat conversation created by {request.user.username}: '{title}'")
        serializer = ChatConversationDetailSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, rename, or delete a conversation."""

    serializer_class = ChatConversationDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatConversation.objects.filter(user=self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    """List messages or post a new user message in a conversation."""

    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(
            conversation__user=self.request.user,
            conversation_id=self.kwargs['conversation_pk'],
        )

    def create(self, request, *args, **kwargs):
        conversation = get_object_or_404(
            ChatConversation,
            pk=self.kwargs['conversation_pk'],
            user=request.user,
        )
        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'detail': 'Message content cannot be empty.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_message = ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            content=content,
        )

        # Auto-title the conversation from the first user message
        if conversation.messages.filter(role='user').count() == 1:
            new_title = content[:80] + ('…' if len(content) > 80 else '')
            conversation.title = new_title

        # Generate and save an assistant response
        bot_reply = _generate_bot_response(content, request.user)
        assistant_message = ChatMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=bot_reply,
        )

        # Touch updated_at so the conversation sorts to the top
        conversation.save()

        logger.info(
            f"Message added to conversation {conversation.pk} by {request.user.username}"
        )
        return Response(
            {
                'user_message': ChatMessageSerializer(user_message).data,
                'assistant_message': ChatMessageSerializer(assistant_message).data,
            },
            status=status.HTTP_201_CREATED,
        )


def _generate_bot_response(message: str, user) -> str:
    """Generate a context-aware bot response based on keyword matching.

    This is a rule-based assistant that can be swapped out for an AI model
    (e.g. Claude API) in the future by replacing this single function.
    """
    msg = message.lower().strip()

    # Greeting patterns
    if re.search(r'\b(hello|hi|hey|howdy|greetings|good morning|good afternoon|good evening)\b', msg):
        return (
            f"Hey {user.first_name or user.username}! 👋 Welcome to LearnHub. "
            "How can I help you today? You can ask me about:\n\n"
            "• Your enrolled courses\n"
            "• How to find or enrol in courses\n"
            "• Your account and profile\n"
            "• Platform features (leaderboard, achievements, settings)\n"
            "• General learning tips"
        )

    # Course-related queries
    if re.search(r'\b(course|courses|class|classes|lesson|lessons)\b', msg):
        if re.search(r'\b(find|search|browse|discover|available|explore|new)\b', msg):
            return (
                "To browse courses, head to **All Courses** in the navigation bar. "
                "From there you can:\n\n"
                "• Search by title, description, or teacher name\n"
                "• Filter by specific teachers using the chips below the search bar\n"
                "• Sort by newest or alphabetical order\n\n"
                "Found a course you like? Click **Enrol** to add it to your dashboard!"
            )
        if re.search(r'\b(enrol|enroll|join|sign up|register for)\b', msg):
            return (
                "To enrol in a course:\n\n"
                "1. Go to **All Courses** from the navigation bar\n"
                "2. Find a course you're interested in\n"
                "3. Click the **Enrol** button on the course card\n\n"
                "Once enrolled, the course will appear on your dashboard. "
                "You can unenrol at any time from the course detail page."
            )
        if re.search(r'\b(create|make|build|add|new)\b', msg):
            if user.role == 'teacher' or user.role == 'admin':
                return (
                    "To create a new course:\n\n"
                    "1. Go to your **Dashboard**\n"
                    "2. Click the **Create Course** button\n"
                    "3. Enter a title and description\n"
                    "4. Click **Create** to publish it\n\n"
                    "Students will immediately be able to find and enrol in your new course!"
                )
            return (
                "Only teachers and admins can create courses. "
                "If you're interested in teaching, you could register a new account "
                "with the **Teacher** role, or ask an admin to change your role."
            )
        # Fetch real course data for the user
        if re.search(r'\b(my|enrolled|taking|studying)\b', msg):
            if user.role == 'student':
                enrollments = Enrollment.objects.filter(student=user).select_related('course')
                if enrollments.exists():
                    course_list = '\n'.join(
                        f"• **{e.course.title}** (by {e.course.teacher.username})"
                        for e in enrollments[:10]
                    )
                    return (
                        f"You're currently enrolled in {enrollments.count()} course(s):\n\n"
                        f"{course_list}\n\n"
                        "Visit your **Dashboard** to see them all, or go to **All Courses** "
                        "to discover more!"
                    )
                return (
                    "You're not enrolled in any courses yet! Head to **All Courses** "
                    "to browse what's available and click **Enrol** to get started."
                )
            if user.role == 'teacher':
                courses = Course.objects.filter(teacher=user, is_active=True)
                if courses.exists():
                    course_list = '\n'.join(
                        f"• **{c.title}** ({c.enrollment_count} students)"
                        for c in courses[:10]
                    )
                    return (
                        f"You've created {courses.count()} course(s):\n\n"
                        f"{course_list}\n\n"
                        "Visit your **Dashboard** to manage them."
                    )
                return (
                    "You haven't created any courses yet. Go to your **Dashboard** "
                    "and click **Create Course** to get started!"
                )
        # General course info
        total_courses = Course.objects.filter(is_active=True).count()
        return (
            f"LearnHub currently has **{total_courses}** active courses available. "
            "You can browse them all from **All Courses** in the navigation bar. "
            "Use the search bar to find courses by title, description, or teacher name."
        )

    # Profile/account queries
    if re.search(r'\b(profile|account|bio|name|settings|edit profile)\b', msg):
        return (
            "You can manage your profile by clicking your **username** in the navigation "
            "bar or visiting the **Profile** page. From there you can:\n\n"
            "• Update your first and last name\n"
            "• Add a bio to tell others about yourself\n"
            "• View your account information\n\n"
            "For theme and notification preferences, check out the **Settings** page."
        )

    # Leaderboard queries
    if re.search(r'\b(leaderboard|ranking|top|best|popular)\b', msg):
        return (
            "The **Leaderboard** shows the most popular courses and top teachers on "
            "LearnHub, ranked by student enrolments. Check it out from the navigation "
            "bar — you might discover some great courses you haven't tried yet!"
        )

    # Achievement queries
    if re.search(r'\b(achievement|achievements|badge|badges|unlock|progress)\b', msg):
        return (
            "LearnHub has a fun **Achievements** system! You can earn badges by:\n\n"
            "• Logging in for the first time (Welcome Aboard!)\n"
            "• Browsing the course catalogue (Explorer)\n"
            "• Enrolling in courses (Eager Learner, Knowledge Seeker)\n"
            "• Completing your profile (Identity Established)\n"
            "• Being part of the community (Community Member)\n\n"
            "Visit the **Achievements** page to see your progress!"
        )

    # Help/support queries
    if re.search(r'\b(help|support|faq|question|problem|issue|bug|contact)\b', msg):
        return (
            "For common questions, check out our **Help & FAQ** page — it covers topics "
            "like getting started, account management, and course navigation.\n\n"
            "If you need further help, there's a contact form at the bottom of the "
            "Help page where you can reach the team."
        )

    # Thank you
    if re.search(r'\b(thanks|thank you|cheers|ta|appreciate)\b', msg):
        return (
            f"You're welcome, {user.first_name or user.username}! 😊 "
            "Feel free to ask if you need anything else. Happy learning!"
        )

    # Goodbye
    if re.search(r'\b(bye|goodbye|see you|later|cya)\b', msg):
        return (
            f"See you later, {user.first_name or user.username}! 👋 "
            "Your chat history is saved, so you can pick up right where you left off. "
            "Happy learning!"
        )

    # Who are you / what can you do
    if re.search(r'\b(who are you|what are you|what can you do|what do you do)\b', msg):
        return (
            "I'm the **LearnHub Assistant** — a chatbot built to help you navigate "
            "the platform! I can help with:\n\n"
            "• Finding and enrolling in courses\n"
            "• Checking your enrolled courses and progress\n"
            "• Understanding platform features\n"
            "• Account and profile questions\n\n"
            "I'm a rule-based assistant right now, but I'm designed so that an AI "
            "model (like Claude) could be plugged in to make me even smarter in the future!"
        )

    # Default fallback
    return (
        "Thanks for your message! I'm not quite sure how to help with that specific "
        "question, but here are some things I can assist with:\n\n"
        "• **Courses** — finding, enrolling, or creating courses\n"
        "• **Profile** — updating your name, bio, or settings\n"
        "• **Leaderboard** — seeing top courses and teachers\n"
        "• **Achievements** — checking your badges and progress\n"
        "• **Help** — finding answers to common questions\n\n"
        "Try asking something like \"How do I enrol in a course?\" or \"Show me my courses\"!"
    )
