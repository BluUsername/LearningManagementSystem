from django.urls import path

from . import views

urlpatterns = [
    path(
        'chat/conversations/',
        views.ConversationListCreateView.as_view(),
        name='conversation-list',
    ),
    path(
        'chat/conversations/<int:pk>/',
        views.ConversationDetailView.as_view(),
        name='conversation-detail',
    ),
    path(
        'chat/conversations/<int:conversation_pk>/messages/',
        views.MessageListCreateView.as_view(),
        name='message-list',
    ),
]
