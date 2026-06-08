import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  type GestureResponderEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArticleBlockRenderer,
  ArticleReactionButton,
  Avatar,
  BackButton,
  CompactProductCard,
  EmptyStateCard,
  SafeScreen,
  SavedArticleButton,
  ScreenContainer,
  SectionTitle,
  SurfaceCard,
} from '../../components';
import { getArticleCategoryLabel } from '../../features/articles/mappers/article.mapper';
import { useArticleById } from '../../features/articles/hooks/useArticleById';
import { useArticleComments } from '../../features/articles/hooks/useArticleComments';
import { useArticleReaction } from '../../features/articles/hooks/useArticleReaction';
import { useToggleArticleSaved } from '../../features/articles/hooks/useToggleArticleSaved';
import { getArticleContentParagraphs } from '../../features/articles/utils/articleBlocks';
import type {
  ArticleComment,
  ArticleDetail,
} from '../../features/articles/types/article';
import { useOptionalAuth } from '../../features/auth/context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { AppStackParamList } from '../../types/navigation';
import * as S from './styles';

type ArticleDetailScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'ArticleDetail'
>;

const COMMENT_MIN_LENGTH = 2;
const COMMENT_MAX_LENGTH = 1000;

function formatPublishedDate(dateValue?: string) {
  if (!dateValue) {
    return undefined;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCommentDate(dateValue?: string) {
  return formatPublishedDate(dateValue);
}

function getReadingLabel(readingTimeMinutes?: number) {
  if (!readingTimeMinutes) {
    return undefined;
  }

  return `${readingTimeMinutes} min de leitura`;
}

function getFallbackBadge(article: ArticleDetail) {
  const source = article.title.trim() || article.author.name.trim() || 'H';

  return source.charAt(0).toUpperCase();
}

function getUsefulSummary(reactionsCount: number) {
  if (reactionsCount <= 0) {
    return 'Se este conteudo ajudou, voce pode marcar como util.';
  }

  if (reactionsCount === 1) {
    return '1 pessoa achou util.';
  }

  return `${reactionsCount} pessoas acharam util.`;
}

function getCommentsTitle(commentsCount?: number) {
  if (typeof commentsCount !== 'number') {
    return 'Comentarios';
  }

  return `Comentarios · ${commentsCount}`;
}

function getCommentValidationMessage(body: string) {
  const trimmedBody = body.trim();

  if (trimmedBody.length === 0) {
    return 'Escreva um comentario antes de publicar.';
  }

  if (trimmedBody.length < COMMENT_MIN_LENGTH) {
    return 'O comentario esta muito curto.';
  }

  if (trimmedBody.length > COMMENT_MAX_LENGTH) {
    return 'O comentario esta muito longo.';
  }

  return null;
}

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

type CommentControlButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
};

function CommentControlButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  testID,
}: CommentControlButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <S.CommentControlButton
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.88}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      $variant={variant}
      $disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? theme.colors.textOnPrimary
              : theme.colors.primaryStrong
          }
        />
      ) : (
        <S.CommentControlLabel
          $variant={variant}
          $disabled={isDisabled}
        >
          {label}
        </S.CommentControlLabel>
      )}
    </S.CommentControlButton>
  );
}

export function ArticleDetailScreen({
  navigation,
  route,
}: ArticleDetailScreenProps) {
  const { theme } = useTheme();
  const auth = useOptionalAuth();
  const articleId = route.params?.articleId;
  const { article, isLoading, isNotFound, retry } = useArticleById({
    articleId,
  });
  const {
    comments,
    total: totalComments,
    hasLoaded: hasLoadedComments,
    hasMore,
    isLoading: isCommentsLoading,
    isLoadingMore,
    isCreating,
    errorMessage: commentsErrorMessage,
    isUpdatingComment,
    isDeletingComment,
    isModeratingComment,
    refresh: refreshComments,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
    moderateComment,
  } = useArticleComments({
    articleId,
  });
  const [hasImageError, setHasImageError] = useState(false);
  const [composerBody, setComposerBody] = useState('');
  const [composerMessage, setComposerMessage] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [commentsActionMessage, setCommentsActionMessage] =
    useState<string | null>(null);
  const coverImageUrl = article?.coverImageUrl ?? article?.imageUrl ?? null;
  const currentUser = auth?.user ?? null;
  const isAuthenticated = auth?.isAuthenticated === true;

  useEffect(() => {
    setHasImageError(false);
  }, [coverImageUrl]);

  useEffect(() => {
    setComposerMessage(null);
  }, [composerBody]);

  useEffect(() => {
    setEditingMessage(null);
  }, [editingBody]);

  useEffect(() => {
    setCommentsActionMessage(null);
  }, [articleId]);

  const categoryLabel = article
    ? getArticleCategoryLabel(article.category)
    : undefined;
  const publishedDate = formatPublishedDate(article?.publishedAt);
  const readingLabel = getReadingLabel(article?.readingTimeMinutes);
  const relatedProducts = article?.relatedProducts ?? [];
  const { isSaved, isSubmitting, toggleSaved } = useToggleArticleSaved({
    article: article ?? {
      id: articleId ?? '',
      title: '',
      slug: '',
      summary: '',
      category: 'TIPS',
      imageUrl: null,
      tags: [],
      author: {
        id: '',
        name: '',
        avatarUrl: null,
      },
    },
    onError: message => {
      Alert.alert('Leituras salvas', message);
    },
    onRequireAuth: () => {
      Alert.alert('Leituras salvas', 'Entre para salvar leituras.');
    },
  });
  const {
    isReacted,
    reactionsCount,
    isLoading: isReactionLoading,
    toggleReaction,
  } = useArticleReaction({
    article: article ?? {
      id: articleId ?? '',
      isReacted: false,
      reactionsCount: 0,
    },
    onError: message => {
      Alert.alert('Util', message);
    },
    onRequireAuth: () => {
      Alert.alert('Util', 'Entre para marcar artigos como uteis.');
    },
  });
  const contentParagraphs = useMemo(() => {
    if (!article) {
      return [];
    }

    return getArticleContentParagraphs(article.content, article.summary);
  }, [article]);
  const shouldShowImage = Boolean(coverImageUrl) && !hasImageError;
  const hasBlocks = (article?.blocks?.length ?? 0) > 0;
  const shouldShowCount =
    typeof article?.commentsCount === 'number' || hasLoadedComments;
  const commentsCount = hasLoadedComments
    ? totalComments
    : article?.commentsCount;
  const commentsTitle = getCommentsTitle(commentsCount);

  function handleGoBack() {
    navigation.goBack();
  }

  function handleRetry() {
    retry();
  }

  function handleRetryComments() {
    refreshComments().catch(() => undefined);
  }

  function handleOpenRelatedProduct(productId: string) {
    navigation.navigate('ProductDetail', { productId });
  }

  function handleToggleSaved(event: GestureResponderEvent) {
    event.stopPropagation?.();
    toggleSaved().catch(() => undefined);
  }

  function handleToggleReaction() {
    Promise.resolve(toggleReaction()).catch(() => undefined);
  }

  function handleComposerTextChange(value: string) {
    setComposerBody(value);
  }

  async function handlePublishComment() {
    setCommentsActionMessage(null);

    const validationMessage = getCommentValidationMessage(composerBody);

    if (validationMessage) {
      setComposerMessage(validationMessage);
      return;
    }

    try {
      await createComment(composerBody.trim());
      setComposerBody('');
    } catch {
      setComposerMessage('Nao foi possivel publicar o comentario.');
    }
  }

  function handleStartEditing(comment: ArticleComment) {
    setCommentsActionMessage(null);
    setEditingCommentId(comment.id);
    setEditingBody(comment.body);
    setEditingMessage(null);
  }

  function handleCancelEditing() {
    setEditingCommentId(null);
    setEditingBody('');
    setEditingMessage(null);
  }

  async function handleSaveEditedComment(commentId: string) {
    const validationMessage = getCommentValidationMessage(editingBody);

    if (validationMessage) {
      setEditingMessage(validationMessage);
      return;
    }

    try {
      await updateComment(commentId, editingBody.trim());
      handleCancelEditing();
    } catch {
      setEditingMessage('Nao foi possivel atualizar o comentario.');
    }
  }

  async function confirmDeleteComment(commentId: string) {
    try {
      await deleteComment(commentId);

      if (editingCommentId === commentId) {
        handleCancelEditing();
      }
    } catch {
      setCommentsActionMessage('Nao foi possivel remover o comentario.');
    }
  }

  function handleRequestDeleteComment(commentId: string) {
    setCommentsActionMessage(null);
    Alert.alert('Comentarios', 'Remover este comentario?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          confirmDeleteComment(commentId).catch(() => undefined);
        },
      },
    ]);
  }

  async function handleHideComment(commentId: string) {
    setCommentsActionMessage(null);

    try {
      await moderateComment(commentId, 'HIDDEN');

      if (editingCommentId === commentId) {
        handleCancelEditing();
      }
    } catch {
      setCommentsActionMessage('Nao foi possivel atualizar o comentario.');
    }
  }

  function handleLoadMoreComments() {
    setCommentsActionMessage(null);
    loadMore().catch(() => undefined);
  }

  if (isLoading) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={handleGoBack} />
            </S.HeaderRow>

            <SurfaceCard>
              <S.StatusContent>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <SectionTitle
                  title="Carregando leitura"
                  subtitle="Aguarde um instante."
                />
              </S.StatusContent>
            </SurfaceCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  if (!article) {
    return (
      <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
        <ScreenContainer scrollable>
          <S.Content>
            <S.HeaderRow>
              <BackButton onPress={handleGoBack} />
            </S.HeaderRow>

            <EmptyStateCard
              title={
                isNotFound
                  ? 'Esta leitura nao esta disponivel.'
                  : 'Nao foi possivel carregar o artigo.'
              }
              description={
                isNotFound
                  ? 'Volte e escolha outra leitura.'
                  : 'Tente novamente em instantes.'
              }
            >
              <CommentControlButton
                label={isNotFound ? 'Voltar' : 'Tentar novamente'}
                onPress={isNotFound ? handleGoBack : handleRetry}
              />
            </EmptyStateCard>
          </S.Content>
        </ScreenContainer>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen edges={['top', 'left', 'right', 'bottom']}>
      <ScreenContainer scrollable>
        <S.Content>
          <S.HeaderRow>
            <BackButton onPress={handleGoBack} />
          </S.HeaderRow>

          {shouldShowImage ? (
            <S.HeroMedia>
              <S.HeroImage
                source={{ uri: coverImageUrl ?? undefined }}
                accessibilityLabel={
                  article.coverImageAlt ?? article.title ?? 'Capa da leitura'
                }
                onError={() => setHasImageError(true)}
              />
            </S.HeroMedia>
          ) : (
            <S.HeroMedia>
              <S.HeroFallback>
                <S.HeroFallbackBadge>
                  <S.HeroFallbackBadgeText>
                    {getFallbackBadge(article)}
                  </S.HeroFallbackBadgeText>
                </S.HeroFallbackBadge>
                <S.HeroFallbackText>Leitura HortiVia</S.HeroFallbackText>
              </S.HeroFallback>
            </S.HeroMedia>
          )}

          <SurfaceCard>
            <S.IntroCard>
              <S.IntroTopRow>
                <S.CategoryPill>
                  <S.CategoryPillText>{categoryLabel}</S.CategoryPillText>
                </S.CategoryPill>
                <SavedArticleButton
                  isSaved={isSaved}
                  isLoading={isSubmitting}
                  onPress={handleToggleSaved}
                  size="md"
                  showLabel
                />
              </S.IntroTopRow>

              <S.IntroCopy>
                <S.Title>{article.title}</S.Title>
                {article.subtitle ? (
                  <S.Subtitle>{article.subtitle}</S.Subtitle>
                ) : null}
                <S.Summary>{article.summary}</S.Summary>
              </S.IntroCopy>

              <S.UtilityRow>
                <S.UtilityCopy>
                  <S.UtilityTitle>Este artigo foi util?</S.UtilityTitle>
                  <S.UtilityDescription>
                    {getUsefulSummary(reactionsCount)}
                  </S.UtilityDescription>
                </S.UtilityCopy>
                <ArticleReactionButton
                  testID="article-detail-reaction-button"
                  isActive={isReacted}
                  count={reactionsCount}
                  isLoading={isReactionLoading}
                  onPress={handleToggleReaction}
                  size="md"
                />
              </S.UtilityRow>

              <S.Divider />

              <S.MetaRow>
                <S.AuthorRow>
                  <Avatar label={article.author.name} size={40} />
                  <S.AuthorCopy>
                    <S.AuthorName numberOfLines={1} ellipsizeMode="tail">
                      {article.author.name}
                    </S.AuthorName>
                    <S.AuthorLabel numberOfLines={1} ellipsizeMode="tail">
                      Leitura educativa
                    </S.AuthorLabel>
                  </S.AuthorCopy>
                </S.AuthorRow>

                <S.MetaInfoWrap>
                  {publishedDate ? (
                    <S.MetaInfoChip>
                      <S.MetaInfoText>{publishedDate}</S.MetaInfoText>
                    </S.MetaInfoChip>
                  ) : null}
                  {readingLabel ? (
                    <S.MetaInfoChip>
                      <S.MetaInfoText>{readingLabel}</S.MetaInfoText>
                    </S.MetaInfoChip>
                  ) : null}
                </S.MetaInfoWrap>
              </S.MetaRow>
            </S.IntroCard>
          </SurfaceCard>

          <S.BodySection>
            {hasBlocks ? (
              <S.BlocksList>
                {article.blocks.map(block => (
                  <ArticleBlockRenderer key={block.id} block={block} />
                ))}
              </S.BlocksList>
            ) : (
              <S.BlocksList>
                {contentParagraphs.map(paragraph => (
                  <S.Paragraph key={paragraph}>{paragraph}</S.Paragraph>
                ))}
              </S.BlocksList>
            )}
          </S.BodySection>

          {article.tags.length ? (
            <SurfaceCard>
              <S.TagsCard>
                <SectionTitle
                  title="Temas relacionados"
                  subtitle="Assuntos desta leitura."
                />
                <S.TagsRow>
                  {article.tags.map(tag => (
                    <S.TagChip key={tag}>
                      <S.TagText>{tag}</S.TagText>
                    </S.TagChip>
                  ))}
                </S.TagsRow>
              </S.TagsCard>
            </SurfaceCard>
          ) : null}

          {relatedProducts.length > 0 ? (
            <SurfaceCard>
              <S.RelatedSectionCard>
                <SectionTitle
                  title="Produtos relacionados"
                  subtitle="Alimentos ligados a este conteudo."
                />
                <S.RelatedScroll
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: theme.layout.screenPadding,
                  }}
                >
                  {relatedProducts.map(product => (
                    <S.RelatedCardShell key={product.id}>
                      <CompactProductCard
                        product={product}
                        onPress={() => handleOpenRelatedProduct(product.id)}
                      />
                    </S.RelatedCardShell>
                  ))}
                </S.RelatedScroll>
              </S.RelatedSectionCard>
            </SurfaceCard>
          ) : null}

          <SurfaceCard>
            <S.CommentsSection>
              <SectionTitle
                title={commentsTitle}
                subtitle="Compartilhe uma observacao ou duvida sobre este conteudo."
              />

              {isAuthenticated ? (
                <S.CommentComposerCard>
                  <S.CommentInput
                    value={composerBody}
                    onChangeText={handleComposerTextChange}
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
                      onPress={handlePublishComment}
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

              {isCommentsLoading && comments.length === 0 ? (
                <S.CommentsStatusCard>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <S.CommentsStatusText>
                    Carregando comentarios...
                  </S.CommentsStatusText>
                </S.CommentsStatusCard>
              ) : null}

              {!isCommentsLoading &&
              commentsErrorMessage &&
              comments.length === 0 ? (
                <S.CommentsPromptCard>
                  <S.CommentsPromptTitle>
                    Nao foi possivel carregar os comentarios.
                  </S.CommentsPromptTitle>
                  <S.CommentsPromptText>
                    Tente novamente em instantes.
                  </S.CommentsPromptText>
                  <CommentControlButton
                    label="Tentar novamente"
                    onPress={handleRetryComments}
                    variant="secondary"
                    testID="comments-retry-button"
                  />
                </S.CommentsPromptCard>
              ) : null}

              {!isCommentsLoading &&
              comments.length === 0 &&
              !commentsErrorMessage ? (
                <S.CommentsPromptCard>
                  <S.CommentsPromptTitle>
                    Nenhum comentario ainda.
                  </S.CommentsPromptTitle>
                  <S.CommentsPromptText>
                    Seja o primeiro a comentar este artigo.
                  </S.CommentsPromptText>
                  {!isAuthenticated ? (
                    <S.CommentsPromptExtra>Entre para comentar.</S.CommentsPromptExtra>
                  ) : null}
                </S.CommentsPromptCard>
              ) : null}

              {comments.length > 0 ? (
                <S.CommentList>
                  {comments.map(comment => {
                    const isEditing = editingCommentId === comment.id;
                    const canEdit = currentUser?.id === comment.author.id;
                    const canDelete =
                      canEdit || currentUser?.role === 'ADMIN';
                    const canModerate = currentUser?.role === 'ADMIN';
                    const isUpdating = isUpdatingComment(comment.id);
                    const isDeleting = isDeletingComment(comment.id);
                    const isModerating = isModeratingComment(comment.id);
                    const isBusy = isUpdating || isDeleting || isModerating;
                    const createdDate = formatCommentDate(comment.createdAt);

                    return (
                      <S.CommentCard key={comment.id}>
                        <S.CommentHeader>
                          <S.CommentMeta>
                            <S.CommentAuthor>{comment.author.name}</S.CommentAuthor>
                            {createdDate ? (
                              <S.CommentDate>{createdDate}</S.CommentDate>
                            ) : null}
                          </S.CommentMeta>
                          {canEdit || canDelete || canModerate ? (
                            <S.CommentActionsRow>
                              {canEdit && !isEditing ? (
                                <CommentActionButton
                                  label="Editar"
                                  onPress={() => handleStartEditing(comment)}
                                  disabled={isBusy}
                                  testID={`comment-action-edit-${comment.id}`}
                                />
                              ) : null}
                              {canModerate && comment.status !== 'HIDDEN' ? (
                                <CommentActionButton
                                  label={isModerating ? 'Ocultando...' : 'Ocultar'}
                                  onPress={() => handleHideComment(comment.id)}
                                  disabled={isBusy}
                                  testID={`comment-action-hide-${comment.id}`}
                                />
                              ) : null}
                              {canDelete ? (
                                <CommentActionButton
                                  label={isDeleting ? 'Removendo...' : 'Remover'}
                                  onPress={() => handleRequestDeleteComment(comment.id)}
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
                                  `${editingBody.trim().length}/${COMMENT_MAX_LENGTH}`}
                              </S.CommentHelperText>
                              <S.CommentEditActions>
                                <CommentControlButton
                                  label="Cancelar"
                                  onPress={handleCancelEditing}
                                  disabled={isUpdating}
                                  variant="secondary"
                                  testID={`comment-cancel-button-${comment.id}`}
                                />
                                <CommentControlButton
                                  label="Salvar"
                                  onPress={() => handleSaveEditedComment(comment.id)}
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

              {commentsErrorMessage && comments.length > 0 ? (
                <S.CommentHelperText $tone="danger">
                  {commentsErrorMessage}
                </S.CommentHelperText>
              ) : null}

              {commentsActionMessage ? (
                <S.CommentHelperText $tone="danger">
                  {commentsActionMessage}
                </S.CommentHelperText>
              ) : null}

              {hasMore ? (
                <S.LoadMoreWrap>
                  <CommentControlButton
                    label={
                      isLoadingMore
                        ? 'Carregando...'
                        : 'Carregar mais comentarios'
                    }
                    onPress={handleLoadMoreComments}
                    disabled={isLoadingMore}
                    loading={isLoadingMore}
                    variant="secondary"
                    testID="comments-load-more-button"
                  />
                </S.LoadMoreWrap>
              ) : null}
            </S.CommentsSection>
          </SurfaceCard>
        </S.Content>
      </ScreenContainer>
    </SafeScreen>
  );
}
