from rest_framework import serializers

from .models import ChatConversation, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'role', 'created_at']


class ChatConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing conversations without loading all messages."""

    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'message_count', 'last_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj: ChatConversation) -> int:
        return obj.messages.count()

    def get_last_message(self, obj: ChatConversation) -> dict | None:
        last = obj.messages.last()
        if last:
            return {'role': last.role, 'content': last.content[:120]}
        return None


class ChatConversationDetailSerializer(serializers.ModelSerializer):
    """Full serializer for a single conversation including all messages."""

    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
