import logging

from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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

        # Touch updated_at so the conversation sorts to the top
        conversation.save()

        logger.info(
            f"Message added to conversation {conversation.pk} by {request.user.username}"
        )
        return Response(
            ChatMessageSerializer(user_message).data,
            status=status.HTTP_201_CREATED,
        )
