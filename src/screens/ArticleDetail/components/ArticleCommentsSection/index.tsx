import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import {
  Avatar,
  SectionTitle,
  SurfaceCard,
  UserBadge,
} from '../../../../components';
import { useArticleComments } from '../../../../features/articles/hooks/useArticleComments';
import type { ArticleComment } from '../../../../features/articles/types/article';
import { useOptionalAuth } from '../../../../features/auth/context/AuthContext';
import { useTheme } from '../../../../hooks/useTheme';
import { CommentControlButton } from '../CommentControlButton';
import * as ArticleDetailStyles from '../../styles';
import * as S from './styles';

const COMMENT_MIN_LENGTH = 2;
const COMMENT_MAX_LENGTH = 1000;

type ArticleCommentsSectionProps = {
  articleId?: string;
  commentsCount?: number;
  onOpenProfile: (userId: string) => void;
};

type CommentActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  testID?: string;
};

function CommentActionButton({
  label,
  onPress,
  disabled = false,
  tone = 'default',
  testID,
}: CommentActionButtonProps) {
  return (
    <S.CommentActionButton
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.84}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <S.CommentActionLabel $tone={tone} $disabled={disabled}>
        {label}
      </S.CommentActionLabel>
    </S.CommentActionButton>
  );
}

function formatCommentDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getCommentsTitle(count?: number) {
  return typeof count === 'number' ? `Comentarios · ${count}` : 'Comentarios';
}

function getCommentValidationMessage(body: string) {
  const length = body.trim().length;
  if (length === 0) return 'Escreva um comentario antes de publicar.';
  if (length < COMMENT_MIN_LENGTH) return 'O comentario esta muito curto.';
  if (length > COMMENT_MAX_LENGTH) return 'O comentario esta muito longo.';
  return null;
}

export function ArticleCommentsSection({
  articleId,
  commentsCount: articleCommentsCount,
  onOpenProfile,
}: ArticleCommentsSectionProps) {
  const { theme } = useTheme();
  const auth = useOptionalAuth();
  const currentUser = auth?.user ?? null;
  const isAuthenticated = auth?.isAuthenticated === true;
  const {
    comments,
    total,
    hasLoaded,
    hasMore,
    isLoading,
    isLoadingMore,
    isCreating,
    errorMessage,
    isUpdatingComment,
    isDeletingComment,
    isModeratingComment,
    refresh,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
    moderateComment,
  } = useArticleComments({ articleId });
  const [composerBody, setComposerBody] = useState('');
  const [composerMessage, setComposerMessage] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const currentArticleIdRef = useRef(articleId);

  useEffect(() => setComposerMessage(null), [composerBody]);
  useEffect(() => setEditingMessage(null), [editingBody]);
  useEffect(() => {
    currentArticleIdRef.current = articleId;
    setComposerBody('');
    setComposerMessage(null);
    setEditingCommentId(null);
    setEditingBody('');
    setEditingMessage(null);
    setActionMessage(null);
  }, [articleId]);

  const commentsCount = hasLoaded ? total : articleCommentsCount;

  function startEditing(comment: ArticleComment) {
    setActionMessage(null);
    setEditingCommentId(comment.id);
    setEditingBody(comment.body);
    setEditingMessage(null);
  }

  function cancelEditing() {
    setEditingCommentId(null);
    setEditingBody('');
    setEditingMessage(null);
  }

  async function publishComment() {
    setActionMessage(null);
    const requestedArticleId = articleId;
    const validationMessage = getCommentValidationMessage(composerBody);
    if (validationMessage) {
      setComposerMessage(validationMessage);
      return;
    }

    try {
      await createComment(composerBody.trim());
      if (currentArticleIdRef.current === requestedArticleId)
        setComposerBody('');
    } catch {
      if (currentArticleIdRef.current === requestedArticleId) {
        setComposerMessage('Nao foi possivel publicar o comentario.');
      }
    }
  }

  async function saveEditedComment(commentId: string) {
    const requestedArticleId = articleId;
    const validationMessage = getCommentValidationMessage(editingBody);
    if (validationMessage) {
      setEditingMessage(validationMessage);
      return;
    }

    try {
      await updateComment(commentId, editingBody.trim());
      if (currentArticleIdRef.current === requestedArticleId) cancelEditing();
    } catch {
      if (currentArticleIdRef.current === requestedArticleId) {
        setEditingMessage('Nao foi possivel atualizar o comentario.');
      }
    }
  }

  async function removeComment(commentId: string) {
    const requestedArticleId = articleId;
    try {
      await deleteComment(commentId);
      if (
        currentArticleIdRef.current === requestedArticleId &&
        editingCommentId === commentId
      ) {
        cancelEditing();
      }
    } catch {
      if (currentArticleIdRef.current === requestedArticleId) {
        setActionMessage('Nao foi possivel remover o comentario.');
      }
    }
  }

  function requestRemoveComment(commentId: string) {
    setActionMessage(null);
    Alert.alert('Comentarios', 'Remover este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removeComment(commentId).catch(() => undefined),
      },
    ]);
  }

  async function hideComment(commentId: string) {
    setActionMessage(null);
    const requestedArticleId = articleId;
    try {
      await moderateComment(commentId, 'HIDDEN');
      if (
        currentArticleIdRef.current === requestedArticleId &&
        editingCommentId === commentId
      ) {
        cancelEditing();
      }
    } catch {
      if (currentArticleIdRef.current === requestedArticleId) {
        setActionMessage('Nao foi possivel atualizar o comentario.');
      }
    }
  }

  return (
    <SurfaceCard>
      <S.CommentsSection>
        <SectionTitle
          title={getCommentsTitle(commentsCount)}
          subtitle="Compartilhe uma observacao ou duvida sobre este conteudo."
        />

        {isAuthenticated ? (
          <S.CommentComposerCard>
            <S.CommentInput
              value={composerBody}
              onChangeText={setComposerBody}
              placeholder="Escreva seu comentario"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isCreating}
              testID="comment-composer-input"
            />
            <S.CommentComposerFooter>
              <S.CommentHelperText
                $tone={composerMessage ? 'danger' : 'default'}
              >
                {composerMessage ??
                  `${composerBody.trim().length}/${COMMENT_MAX_LENGTH}`}
              </S.CommentHelperText>
              <CommentControlButton
                label="Publicar comentario"
                onPress={publishComment}
                loading={isCreating}
                disabled={isCreating}
                testID="comment-submit-button"
              />
            </S.CommentComposerFooter>
          </S.CommentComposerCard>
        ) : (
          <S.CommentsPromptCard>
            <S.CommentsPromptTitle>Entre para comentar.</S.CommentsPromptTitle>
            <S.CommentsPromptText>
              Acompanhe esta leitura e compartilhe sua duvida quando entrar.
            </S.CommentsPromptText>
          </S.CommentsPromptCard>
        )}

        {isLoading && comments.length === 0 ? (
          <S.CommentsStatusCard>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <S.CommentsStatusText>
              Carregando comentarios...
            </S.CommentsStatusText>
          </S.CommentsStatusCard>
        ) : null}

        {!isLoading && errorMessage && comments.length === 0 ? (
          <S.CommentsPromptCard>
            <S.CommentsPromptTitle>
              Nao foi possivel carregar os comentarios.
            </S.CommentsPromptTitle>
            <S.CommentsPromptText>
              Tente novamente em instantes.
            </S.CommentsPromptText>
            <CommentControlButton
              label="Tentar novamente"
              onPress={() => refresh().catch(() => undefined)}
              variant="secondary"
              testID="comments-retry-button"
            />
          </S.CommentsPromptCard>
        ) : null}

        {!isLoading && comments.length === 0 && !errorMessage ? (
          <S.CommentsPromptCard>
            <S.CommentsPromptTitle>
              Nenhum comentario ainda.
            </S.CommentsPromptTitle>
            <S.CommentsPromptText>
              Seja o primeiro a comentar este artigo.
            </S.CommentsPromptText>
            {!isAuthenticated ? (
              <S.CommentsPromptExtra>
                Entre para comentar.
              </S.CommentsPromptExtra>
            ) : null}
          </S.CommentsPromptCard>
        ) : null}

        {comments.length > 0 ? (
          <S.CommentList>
            {comments.map(comment => {
              const isEditing = editingCommentId === comment.id;
              const canEdit = currentUser?.id === comment.author.id;
              const canDelete = canEdit || currentUser?.role === 'ADMIN';
              const canModerate = currentUser?.role === 'ADMIN';
              const isUpdating = isUpdatingComment(comment.id);
              const isDeleting = isDeletingComment(comment.id);
              const isModerating = isModeratingComment(comment.id);
              const isBusy = isUpdating || isDeleting || isModerating;
              const createdDate = formatCommentDate(comment.createdAt);

              return (
                <S.CommentCard key={comment.id}>
                  <S.CommentHeader>
                    <S.CommentIdentity
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir perfil de ${comment.author.name}`}
                      disabled={!comment.author.id}
                      onPress={() => onOpenProfile(comment.author.id)}
                    >
                      <Avatar
                        label={comment.author.name}
                        imageUrl={comment.author.avatarUrl}
                        size={36}
                      />
                      <S.CommentMeta>
                        <ArticleDetailStyles.IdentityNameRow>
                          <S.CommentAuthor>
                            {comment.author.name}
                          </S.CommentAuthor>
                          <UserBadge badge={comment.author.specialBadge} />
                        </ArticleDetailStyles.IdentityNameRow>
                        {createdDate ? (
                          <S.CommentDate>{createdDate}</S.CommentDate>
                        ) : null}
                      </S.CommentMeta>
                    </S.CommentIdentity>
                    {canEdit || canDelete || canModerate ? (
                      <S.CommentActionsRow>
                        {canEdit && !isEditing ? (
                          <CommentActionButton
                            label="Editar"
                            onPress={() => startEditing(comment)}
                            disabled={isBusy}
                            testID={`comment-action-edit-${comment.id}`}
                          />
                        ) : null}
                        {canModerate && comment.status !== 'HIDDEN' ? (
                          <CommentActionButton
                            label={isModerating ? 'Ocultando...' : 'Ocultar'}
                            onPress={() => hideComment(comment.id)}
                            disabled={isBusy}
                            testID={`comment-action-hide-${comment.id}`}
                          />
                        ) : null}
                        {canDelete ? (
                          <CommentActionButton
                            label={isDeleting ? 'Removendo...' : 'Remover'}
                            onPress={() => requestRemoveComment(comment.id)}
                            disabled={isBusy}
                            tone="danger"
                            testID={`comment-action-remove-${comment.id}`}
                          />
                        ) : null}
                      </S.CommentActionsRow>
                    ) : null}
                  </S.CommentHeader>

                  {isEditing ? (
                    <S.CommentEditShell>
                      <S.CommentInput
                        value={editingBody}
                        onChangeText={setEditingBody}
                        placeholder="Atualize seu comentario"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!isUpdating}
                        testID={`comment-edit-input-${comment.id}`}
                      />
                      <S.CommentEditFooter>
                        <S.CommentHelperText
                          $tone={editingMessage ? 'danger' : 'default'}
                        >
                          {editingMessage ??
                            `${
                              editingBody.trim().length
                            }/${COMMENT_MAX_LENGTH}`}
                        </S.CommentHelperText>
                        <S.CommentEditActions>
                          <CommentControlButton
                            label="Cancelar"
                            onPress={cancelEditing}
                            disabled={isUpdating}
                            variant="secondary"
                            testID={`comment-cancel-button-${comment.id}`}
                          />
                          <CommentControlButton
                            label="Salvar"
                            onPress={() => saveEditedComment(comment.id)}
                            loading={isUpdating}
                            disabled={isUpdating}
                            testID={`comment-save-button-${comment.id}`}
                          />
                        </S.CommentEditActions>
                      </S.CommentEditFooter>
                    </S.CommentEditShell>
                  ) : (
                    <S.CommentBody>{comment.body}</S.CommentBody>
                  )}
                </S.CommentCard>
              );
            })}
          </S.CommentList>
        ) : null}

        {errorMessage && comments.length > 0 ? (
          <S.CommentHelperText $tone="danger">
            {errorMessage}
          </S.CommentHelperText>
        ) : null}
        {actionMessage ? (
          <S.CommentHelperText $tone="danger">
            {actionMessage}
          </S.CommentHelperText>
        ) : null}

        {hasMore ? (
          <S.LoadMoreWrap>
            <CommentControlButton
              label={
                isLoadingMore ? 'Carregando...' : 'Carregar mais comentarios'
              }
              onPress={() => loadMore().catch(() => undefined)}
              disabled={isLoadingMore}
              loading={isLoadingMore}
              variant="secondary"
              testID="comments-load-more-button"
            />
          </S.LoadMoreWrap>
        ) : null}
      </S.CommentsSection>
    </SurfaceCard>
  );
}
