import type { CommentAPI } from '../api/CommentAPI';
import type { Comment } from '../types/comment';
import type { NormalizedOptions } from '../types/options';
import type { StickerData } from '../types/sticker';
import { EventEmitter, EVENTS } from './EventEmitter';
import { formatMessage } from '../i18n';
import {
  containerTemplate,
  headerTemplate,
  editorTemplate,
  stickerPopupTemplate,
  commentItemTemplate,
  replyItemTemplate,
  emptyTemplate,
  loadingTemplate,
  paginationTemplate,
  loginRequiredTemplate,
} from '../ui/templates';
import {
  createElement,
  delegate,
  addEvent,
  empty,
  show,
  hide,
  scrollToElement,
} from '../utils/dom';

interface State {
  comments: Comment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  expandedReplies: Set<string>;
  replyEditors: Set<string>;
  editingComment: string | null;
  stickerPopupVisible: boolean;
}

/**
 * CommentBox 개별 인스턴스
 */
export class CommentBoxInstance {
  private options: NormalizedOptions;
  private api: CommentAPI;
  private emitter: EventEmitter;
  private state: State;
  private container: HTMLElement;
  private elements: {
    header: HTMLElement | null;
    editorWrapper: HTMLElement | null;
    listWrapper: HTMLElement | null;
    paginationWrapper: HTMLElement | null;
  };
  private cleanupFunctions: (() => void)[] = [];

  constructor(options: NormalizedOptions) {
    this.options = options;
    this.api = options.api;
    this.emitter = new EventEmitter();
    this.container = options.container;
    this.elements = {
      header: null,
      editorWrapper: null,
      listWrapper: null,
      paginationWrapper: null,
    };
    this.state = {
      comments: [],
      totalCount: 0,
      currentPage: 0,
      totalPages: 0,
      isLoading: false,
      error: null,
      expandedReplies: new Set(),
      replyEditors: new Set(),
      editingComment: null,
      stickerPopupVisible: false,
    };

    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.renderContainer();
      this.setupEventDelegation();
      await this.loadComments();
      this.emitter.emit(EVENTS.READY);
      this.options.onReady?.();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private renderContainer(): void {
    const prefix = this.options.cssPrefix;
    const { formation, theme, responsive } = this.options;

    // 메인 컨테이너 생성
    const containerHtml = containerTemplate(prefix);
    const containerEl = createElement<HTMLElement>(containerHtml);

    // 테마 및 반응형 클래스 추가
    if (theme === 'dark') {
      containerEl.classList.add(`${prefix}-container--dark`);
    }
    if (responsive) {
      containerEl.classList.add(`${prefix}-container--responsive`);
    }

    // 기존 내용 비우고 새 컨테이너 추가
    empty(this.container);
    this.container.appendChild(containerEl);

    // 요소 참조 저장
    this.elements.header = containerEl.querySelector(`.${prefix}-header`);
    this.elements.editorWrapper = containerEl.querySelector(
      `.${prefix}-editor-wrapper`
    );
    this.elements.listWrapper = containerEl.querySelector(
      `.${prefix}-list-wrapper`
    );
    this.elements.paginationWrapper = containerEl.querySelector(
      `.${prefix}-pagination-wrapper`
    );

    // formation에 따라 요소 표시/숨김
    if (!formation.includes('count') && this.elements.header) {
      hide(this.elements.header);
    }
    if (!formation.includes('write') && this.elements.editorWrapper) {
      hide(this.elements.editorWrapper);
    }
    if (!formation.includes('page') && this.elements.paginationWrapper) {
      hide(this.elements.paginationWrapper);
    }
  }

  private setupEventDelegation(): void {
    const prefix = this.options.cssPrefix;

    // 에디터 제출
    const cleanupSubmit = delegate(
      this.container,
      `.${prefix}-editor-submit`,
      'click',
      (_, target) => {
        const editor = target.closest(`.${prefix}-editor`) as HTMLElement;
        this.handleEditorSubmit(editor);
      }
    );
    this.cleanupFunctions.push(cleanupSubmit);

    // 에디터 취소
    const cleanupCancel = delegate(
      this.container,
      `.${prefix}-editor-cancel`,
      'click',
      (_, target) => {
        const editor = target.closest(`.${prefix}-editor`) as HTMLElement;
        this.handleEditorCancel(editor);
      }
    );
    this.cleanupFunctions.push(cleanupCancel);

    // 댓글 액션 (답글, 수정, 삭제)
    const cleanupAction = delegate(
      this.container,
      `.${prefix}-action-btn`,
      'click',
      (_, target) => {
        const action = target.dataset.action;
        const commentId = target.dataset.commentId;
        if (action && commentId) {
          this.handleAction(action, commentId);
        }
      }
    );
    this.cleanupFunctions.push(cleanupAction);

    // 대댓글 토글
    const cleanupReplyToggle = delegate(
      this.container,
      `.${prefix}-reply-toggle`,
      'click',
      (_, target) => {
        const commentId = target.dataset.commentId;
        if (commentId) {
          this.toggleReplies(commentId);
        }
      }
    );
    this.cleanupFunctions.push(cleanupReplyToggle);

    // 좋아요 버튼
    const cleanupLike = delegate(
      this.container,
      `.${prefix}-like-btn`,
      'click',
      (_, target) => {
        const commentId = target.dataset.commentId;
        if (commentId) {
          this.toggleLike(commentId, target as HTMLElement);
        }
      }
    );
    this.cleanupFunctions.push(cleanupLike);

    // 페이지네이션
    const cleanupPage = delegate(
      this.container,
      `.${prefix}-page-btn`,
      'click',
      (_, target) => {
        const page = target.dataset.page;
        const isDisabled = (target as HTMLButtonElement).disabled;
        if (page !== undefined && !isDisabled) {
          this.goToPage(parseInt(page, 10));
        }
      }
    );
    this.cleanupFunctions.push(cleanupPage);

    // 스티커 버튼 클릭 → 팝업 토글
    const cleanupStickerBtn = delegate(
      this.container,
      `.${prefix}-sticker-btn`,
      'click',
      (_, target) => {
        const anchor = target.closest(`.${prefix}-sticker-popup-anchor`) as HTMLElement;
        if (anchor) {
          this.toggleStickerPopup(anchor);
        }
      }
    );
    this.cleanupFunctions.push(cleanupStickerBtn);

    // 스티커 그룹 탭 클릭
    const cleanupStickerTab = delegate(
      this.container,
      `.${prefix}-sticker-tab`,
      'click',
      (_, target) => {
        this.handleStickerTabClick(target as HTMLElement);
      }
    );
    this.cleanupFunctions.push(cleanupStickerTab);

    // 스티커 아이템 클릭 → 미리보기
    const cleanupStickerItem = delegate(
      this.container,
      `.${prefix}-sticker-item`,
      'click',
      (_, target) => {
        this.handleStickerSelect(target as HTMLElement);
      }
    );
    this.cleanupFunctions.push(cleanupStickerItem);

    // 스티커 미리보기 취소
    const cleanupStickerCancel = delegate(
      this.container,
      `.${prefix}-sticker-preview-cancel`,
      'click',
      (_, target) => {
        const editor = target.closest(`.${prefix}-editor`) as HTMLElement;
        if (editor) {
          this.clearStickerPreview(editor);
        }
      }
    );
    this.cleanupFunctions.push(cleanupStickerCancel);

    // 스티커 구매 버튼 클릭
    const cleanupStickerPurchase = delegate(
      this.container,
      `.${prefix}-sticker-purchase-btn`,
      'click',
      () => {
        this.options.sticker?.onStickerPurchase?.();
        this.closeStickerPopup();
      }
    );
    this.cleanupFunctions.push(cleanupStickerPurchase);

    // 팝업 외부 클릭 시 닫기
    const cleanupOutsideClick = addEvent(
      document.body as HTMLElement,
      'click',
      (e: Event) => {
        if (!this.state.stickerPopupVisible) return;
        const popup = this.container.querySelector(`.${prefix}-sticker-popup`);
        const target = e.target as Node;
        if (!popup) return;
        if (popup.contains(target)) return;

        // 모든 스티커 버튼 확인 (메인/답글/수정 에디터)
        const btns = this.container.querySelectorAll(`.${prefix}-sticker-btn`);
        for (const btn of btns) {
          if (btn.contains(target)) return;
        }

        this.closeStickerPopup();
      }
    );
    this.cleanupFunctions.push(cleanupOutsideClick);
  }

  private async loadComments(): Promise<void> {
    const { objectId, pageSize } = this.options;

    this.setState({ isLoading: true, error: null });
    this.renderLoading();

    try {
      const response = await this.api.getComments({
        objectId,
        page: this.state.currentPage,
        pageSize,
      });

      this.setState({
        comments: response.comments,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / pageSize),
        isLoading: false,
      });

      this.render();
      this.emitter.emit(EVENTS.COMMENTS_LOADED, response);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private render(): void {
    this.renderHeader();
    this.renderEditor();
    this.renderList();
    this.renderPagination();
  }

  private renderHeader(): void {
    if (!this.elements.header) return;
    const { cssPrefix, messages } = this.options;

    this.elements.header.innerHTML = headerTemplate(
      cssPrefix,
      this.state.totalCount,
      messages
    );
  }

  private renderEditor(): void {
    if (!this.elements.editorWrapper) return;
    const { cssPrefix, messages, auth, sticker } = this.options;

    // 로그인 확인
    if (auth && !auth.isLoggedIn()) {
      this.elements.editorWrapper.innerHTML = loginRequiredTemplate(
        cssPrefix,
        messages
      );
      return;
    }

    this.elements.editorWrapper.innerHTML = editorTemplate(cssPrefix, messages, {
      stickerEnabled: sticker?.enabled ?? false,
    });
  }

  private renderList(): void {
    if (!this.elements.listWrapper) return;
    const { cssPrefix, messages, isManager, auth } = this.options;
    const { comments } = this.state;

    if (comments.length === 0) {
      this.elements.listWrapper.innerHTML = emptyTemplate(cssPrefix, messages);
      return;
    }

    const currentUserId = auth?.getUserInfo()?.id;

    const commentsHtml = comments
      .map((comment) =>
        commentItemTemplate(cssPrefix, comment, messages, {
          isOwner: currentUserId === comment.author.id,
          showManagerBadge: isManager,
        })
      )
      .join('');

    this.elements.listWrapper.innerHTML = commentsHtml;

    // 확장된 대댓글 복원
    this.state.expandedReplies.forEach((commentId) => {
      this.loadReplies(commentId);
    });
  }

  private renderLoading(): void {
    if (!this.elements.listWrapper) return;
    this.elements.listWrapper.innerHTML = loadingTemplate(this.options.cssPrefix);
  }

  private renderPagination(): void {
    if (!this.elements.paginationWrapper) return;
    const { cssPrefix } = this.options;
    const { currentPage, totalPages } = this.state;

    this.elements.paginationWrapper.innerHTML = paginationTemplate(
      cssPrefix,
      currentPage,
      totalPages
    );
  }

  private async handleEditorSubmit(editor: HTMLElement): Promise<void> {
    const { cssPrefix, auth, objectId } = this.options;
    const textarea = editor.querySelector(
      `.${cssPrefix}-editor-textarea`
    ) as HTMLTextAreaElement;
    const preview = editor.querySelector(
      `.${cssPrefix}-sticker-preview`
    ) as HTMLElement;

    // 스티커 미리보기가 표시 중인지 확인
    const stickerData: StickerData | undefined =
      preview && !preview.hasAttribute('hidden')
        ? {
            packId: preview.dataset.stickerPackId!,
            stickerId: preview.dataset.stickerId!,
            imageUrl: preview.dataset.stickerImageUrl!,
          }
        : undefined;

    const content = stickerData ? '' : (textarea?.value.trim() || '');

    // 텍스트도 스티커도 없으면 무시
    if (!content && !stickerData) return;

    // 로그인 확인
    if (auth && !auth.isLoggedIn()) {
      auth.onLoginRequired?.();
      return;
    }

    const parentId = editor.dataset.parentId;
    const isReply = !!parentId;
    const isEdit = editor.classList.contains(`${cssPrefix}-editor--edit`);

    try {
      if (isEdit) {
        const commentId = editor.dataset.commentId;
        if (commentId) {
          const updated = await this.api.updateComment(commentId, { content });
          this.setState({ editingComment: null });
          this.emitter.emit(EVENTS.COMMENT_UPDATE, updated);
          this.options.onCommentUpdate?.(updated);
        }
      } else if (isReply && parentId) {
        const userInfo = auth?.getUserInfo();
        const reply = await this.api.createReply(parentId, {
          content,
          sticker: stickerData,
          author: userInfo
            ? {
                id: userInfo.id,
                nickname: userInfo.nickname,
                profileUrl: userInfo.profileUrl,
                isManager: this.options.isManager,
              }
            : undefined,
        });
        this.emitter.emit(EVENTS.REPLY_ADD, { reply, parentId });
        this.options.onReplyAdd?.(reply, parentId);
      } else {
        const userInfo = auth?.getUserInfo();
        const comment = await this.api.createComment(objectId, {
          content,
          sticker: stickerData,
          author: userInfo
            ? {
                id: userInfo.id,
                nickname: userInfo.nickname,
                profileUrl: userInfo.profileUrl,
                isManager: this.options.isManager,
              }
            : undefined,
        });
        this.emitter.emit(EVENTS.COMMENT_ADD, comment);
        this.options.onCommentAdd?.(comment);
      }

      // 새로고침
      await this.loadComments();
      if (textarea) textarea.value = '';
      this.clearStickerPreview(editor);

      // 답글 에디터인 경우 숨기기
      if (isReply && parentId) {
        this.hideReplyEditor(parentId);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleEditorCancel(editor: HTMLElement): void {
    const parentId = editor.dataset.parentId;
    if (parentId) {
      this.hideReplyEditor(parentId);
    }

    const commentId = editor.dataset.commentId;
    if (commentId) {
      this.cancelEdit(commentId);
    }
  }

  private handleAction(action: string, commentId: string): void {
    switch (action) {
      case 'reply':
        this.showReplyEditor(commentId);
        break;
      case 'edit':
        this.startEdit(commentId);
        break;
      case 'delete':
        this.deleteComment(commentId);
        break;
    }
  }

  private showReplyEditor(parentId: string): void {
    const { cssPrefix, messages, sticker } = this.options;

    // 수정 중인 댓글이 있으면 먼저 취소
    if (this.state.editingComment) {
      this.cancelEdit(this.state.editingComment);
    }

    const wrapper = this.container.querySelector(
      `.${cssPrefix}-reply-editor-wrapper[data-parent-id="${parentId}"]`
    ) as HTMLElement;

    if (!wrapper) return;

    wrapper.innerHTML = editorTemplate(cssPrefix, messages, {
      mode: 'reply',
      parentId,
      stickerEnabled: sticker?.enabled ?? false,
    });
    show(wrapper);

    const textarea = wrapper.querySelector(
      `.${cssPrefix}-editor-textarea`
    ) as HTMLTextAreaElement;
    textarea?.focus();

    this.state.replyEditors.add(parentId);
  }

  private hideReplyEditor(parentId: string): void {
    const { cssPrefix } = this.options;
    const wrapper = this.container.querySelector(
      `.${cssPrefix}-reply-editor-wrapper[data-parent-id="${parentId}"]`
    ) as HTMLElement;

    if (wrapper) {
      empty(wrapper);
      hide(wrapper);
    }

    this.state.replyEditors.delete(parentId);
  }

  private async toggleReplies(commentId: string): Promise<void> {
    const { cssPrefix, messages } = this.options;
    const { expandedReplies } = this.state;

    const repliesEl = this.container.querySelector(
      `.${cssPrefix}-replies[data-parent-id="${commentId}"]`
    ) as HTMLElement;
    const toggleBtn = this.container.querySelector(
      `.${cssPrefix}-reply-toggle[data-comment-id="${commentId}"]`
    ) as HTMLButtonElement;

    if (!repliesEl || !toggleBtn) return;

    if (expandedReplies.has(commentId)) {
      // 접기
      hide(repliesEl);
      expandedReplies.delete(commentId);

      const comment = this.state.comments.find((c) => c.id === commentId);
      if (comment) {
        toggleBtn.textContent = formatMessage(messages.showReplies, {
          count: comment.replyCount,
        });
      }
    } else {
      // 펼치기
      expandedReplies.add(commentId);
      toggleBtn.textContent = messages.hideReplies;
      await this.loadReplies(commentId);
      show(repliesEl);
    }

    this.emitter.emit(EVENTS.REPLY_TOGGLE, { commentId, expanded: expandedReplies.has(commentId) });
  }

  private async loadReplies(parentId: string): Promise<void> {
    const { cssPrefix, messages, isManager, auth } = this.options;
    const repliesEl = this.container.querySelector(
      `.${cssPrefix}-replies[data-parent-id="${parentId}"]`
    ) as HTMLElement;

    if (!repliesEl) return;

    repliesEl.innerHTML = loadingTemplate(cssPrefix);
    show(repliesEl);

    try {
      const response = await this.api.getReplies(parentId, {
        page: 0,
        pageSize: 50,
      });

      const currentUserId = auth?.getUserInfo()?.id;

      const repliesHtml = response.replies
        .map((reply) =>
          replyItemTemplate(cssPrefix, reply, messages, {
            isOwner: currentUserId === reply.author.id,
            showManagerBadge: isManager,
          })
        )
        .join('');

      repliesEl.innerHTML = repliesHtml || emptyTemplate(cssPrefix, messages);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private startEdit(commentId: string): void {
    const { cssPrefix, messages, sticker } = this.options;

    // 이미 수정 중인 댓글이 있으면 먼저 취소
    if (this.state.editingComment) {
      this.cancelEdit(this.state.editingComment);
    }

    // 열려있는 답글 에디터가 있으면 닫기
    for (const parentId of this.state.replyEditors) {
      this.hideReplyEditor(parentId);
    }

    // 댓글 DOM 요소 탐색
    const commentEl = this.container.querySelector(
      `[data-comment-id="${commentId}"]`
    ) as HTMLElement;
    if (!commentEl) return;

    const contentEl = commentEl.querySelector(
      `.${cssPrefix}-comment-content`
    ) as HTMLElement;
    const footerEl = commentEl.querySelector(
      `.${cssPrefix}-comment-footer`
    ) as HTMLElement;
    if (!contentEl) return;

    // 원본 HTML 저장 (취소 시 복원용)
    contentEl.dataset.originalHtml = contentEl.innerHTML;

    // data-raw-content에서 원본 텍스트 읽기
    const rawContent = contentEl.dataset.rawContent || '';

    // 에디터로 교체
    contentEl.innerHTML = editorTemplate(cssPrefix, messages, {
      mode: 'edit',
      initialValue: rawContent,
      commentId,
      stickerEnabled: sticker?.enabled ?? false,
    });

    // footer 숨기기
    if (footerEl) {
      hide(footerEl);
    }

    // textarea focus
    const textarea = contentEl.querySelector(
      `.${cssPrefix}-editor-textarea`
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    this.setState({ editingComment: commentId });
  }

  private cancelEdit(commentId: string): void {
    const { cssPrefix } = this.options;

    const commentEl = this.container.querySelector(
      `[data-comment-id="${commentId}"]`
    ) as HTMLElement;

    if (commentEl) {
      const contentEl = commentEl.querySelector(
        `.${cssPrefix}-comment-content`
      ) as HTMLElement;
      const footerEl = commentEl.querySelector(
        `.${cssPrefix}-comment-footer`
      ) as HTMLElement;

      // 원본 HTML 복원
      if (contentEl?.dataset.originalHtml) {
        contentEl.innerHTML = contentEl.dataset.originalHtml;
        delete contentEl.dataset.originalHtml;
      }

      // footer 다시 표시
      if (footerEl) {
        show(footerEl);
      }
    }

    this.setState({ editingComment: null });
  }

  private async toggleLike(commentId: string, buttonEl: HTMLElement): Promise<void> {
    const { cssPrefix, auth } = this.options;

    // 로그인 확인
    if (auth && !auth.isLoggedIn()) {
      auth.onLoginRequired?.();
      return;
    }

    const isActive = buttonEl.classList.contains(`${cssPrefix}-like-btn--active`);

    try {
      const updated = isActive
        ? await this.api.unlikeComment(commentId)
        : await this.api.likeComment(commentId);

      // 버튼만 부분 업데이트 (전체 render 없음)
      if (updated.isLiked) {
        buttonEl.classList.add(`${cssPrefix}-like-btn--active`);
      } else {
        buttonEl.classList.remove(`${cssPrefix}-like-btn--active`);
      }

      const iconEl = buttonEl.querySelector(`.${cssPrefix}-like-icon`);
      const countEl = buttonEl.querySelector(`.${cssPrefix}-like-count`);

      if (iconEl) {
        iconEl.innerHTML = updated.isLiked ? '&#9829;' : '&#9825;';
      }
      if (countEl) {
        countEl.textContent = updated.likeCount > 0 ? String(updated.likeCount) : '';
      }

      // state.comments 배열 내 해당 댓글 업데이트
      const comments = this.state.comments.map((c) =>
        c.id === commentId ? { ...c, likeCount: updated.likeCount, isLiked: updated.isLiked } : c
      );
      this.setState({ comments });

      this.emitter.emit(EVENTS.COMMENT_LIKE, { comment: updated, liked: updated.isLiked });
      this.options.onCommentLike?.(updated, updated.isLiked);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async deleteComment(commentId: string): Promise<void> {
    const { messages, onDeleteConfirm } = this.options;

    const executeDelete = async () => {
      try {
        await this.api.deleteComment(commentId);
        this.emitter.emit(EVENTS.COMMENT_DELETE, commentId);
        this.options.onCommentDelete?.(commentId);
        await this.loadComments();
      } catch (error) {
        this.handleError(error as Error);
      }
    };

    if (onDeleteConfirm) {
      onDeleteConfirm(commentId, () => executeDelete());
    } else {
      if (confirm(messages.confirmDelete)) {
        await executeDelete();
      }
    }
  }

  private async goToPage(page: number): Promise<void> {
    if (page < 0 || page >= this.state.totalPages) return;

    this.setState({ currentPage: page });
    await this.loadComments();

    // 스크롤 이동
    scrollToElement(this.container);
    this.emitter.emit(EVENTS.PAGE_CHANGE, page);
  }

  // =============================================
  // 스티커 관련 메서드
  // =============================================

  private toggleStickerPopup(anchor: HTMLElement): void {
    const { cssPrefix, sticker, messages } = this.options;
    if (!sticker) return;

    if (this.state.stickerPopupVisible) {
      this.closeStickerPopup();
      return;
    }

    // 기존 팝업 제거
    const existingPopup = anchor.querySelector(`.${cssPrefix}-sticker-popup`);
    if (existingPopup) existingPopup.remove();

    // 팝업 생성 및 삽입
    const popupHtml = stickerPopupTemplate(cssPrefix, sticker.groups || [], messages);
    anchor.insertAdjacentHTML('beforeend', popupHtml);

    this.setState({ stickerPopupVisible: true });
  }

  private closeStickerPopup(): void {
    const { cssPrefix } = this.options;
    const popup = this.container.querySelector(`.${cssPrefix}-sticker-popup`);
    if (popup) popup.remove();
    this.setState({ stickerPopupVisible: false });
  }

  private handleStickerTabClick(tabEl: HTMLElement): void {
    const { cssPrefix } = this.options;
    const popup = tabEl.closest(`.${cssPrefix}-sticker-popup`);
    if (!popup) return;

    const groupId = tabEl.dataset.groupId;

    // 활성 탭 업데이트
    popup.querySelectorAll(`.${cssPrefix}-sticker-tab`).forEach((tab) => {
      tab.classList.remove(`${cssPrefix}-sticker-tab--active`);
    });
    tabEl.classList.add(`${cssPrefix}-sticker-tab--active`);

    // 패널 전환
    popup.querySelectorAll(`.${cssPrefix}-sticker-panel`).forEach((panel) => {
      const panelEl = panel as HTMLElement;
      if (panelEl.dataset.groupId === groupId) {
        show(panelEl);
      } else {
        hide(panelEl);
      }
    });
  }

  private handleStickerSelect(stickerEl: HTMLElement): void {
    const { cssPrefix } = this.options;
    const packId = stickerEl.dataset.packId!;
    const stickerId = stickerEl.dataset.stickerId!;
    const imageUrl = stickerEl.dataset.imageUrl!;

    // 팝업이 속한 에디터 찾기
    const anchor = stickerEl.closest(`.${cssPrefix}-sticker-popup-anchor`);
    const editor = anchor?.closest(`.${cssPrefix}-editor`) as HTMLElement;
    if (!editor) return;

    // textarea 숨기고 미리보기 표시
    const textarea = editor.querySelector(`.${cssPrefix}-editor-textarea`) as HTMLTextAreaElement;
    const preview = editor.querySelector(`.${cssPrefix}-sticker-preview`) as HTMLElement;
    const previewImg = editor.querySelector(`.${cssPrefix}-sticker-preview-img`) as HTMLImageElement;

    if (textarea) {
      hide(textarea);
      textarea.disabled = true;
    }
    if (preview && previewImg) {
      previewImg.src = imageUrl;
      preview.dataset.stickerPackId = packId;
      preview.dataset.stickerId = stickerId;
      preview.dataset.stickerImageUrl = imageUrl;
      show(preview);
    }

    this.closeStickerPopup();
  }

  private clearStickerPreview(editor: HTMLElement): void {
    const { cssPrefix } = this.options;
    const textarea = editor.querySelector(`.${cssPrefix}-editor-textarea`) as HTMLElement;
    const preview = editor.querySelector(`.${cssPrefix}-sticker-preview`) as HTMLElement;

    if (preview) {
      hide(preview);
      delete preview.dataset.stickerPackId;
      delete preview.dataset.stickerId;
      delete preview.dataset.stickerImageUrl;
      const img = preview.querySelector(`.${cssPrefix}-sticker-preview-img`) as HTMLImageElement;
      if (img) img.src = '';
    }
    if (textarea) {
      show(textarea);
      (textarea as HTMLTextAreaElement).disabled = false;
    }
  }

  private setState(partial: Partial<State>): void {
    this.state = { ...this.state, ...partial };
    this.emitter.emit(EVENTS.STATE_CHANGE, this.state);
  }

  private handleError(error: Error): void {
    console.error('[CommentBox Error]', error);
    this.setState({ error, isLoading: false });
    this.emitter.emit(EVENTS.ERROR, error);
    this.options.onError?.(error);
  }

  // Public API

  /**
   * 댓글 목록 새로고침
   */
  async refresh(): Promise<void> {
    await this.loadComments();
  }

  /**
   * 이벤트 리스너 등록
   */
  on<T = unknown>(event: string, handler: (data: T) => void): () => void {
    return this.emitter.on(event, handler);
  }

  /**
   * 현재 상태 조회
   */
  getState(): Readonly<State> {
    return { ...this.state };
  }

  /**
   * 인스턴스 정리
   */
  destroy(): void {
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = [];
    this.emitter.removeAllListeners();
    empty(this.container);
  }
}
