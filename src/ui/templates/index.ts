import type { Comment } from '../../types/comment';
import type { Messages } from '../../types/options';
import type { StickerGroup } from '../../types/sticker';
import { formatMessage } from '../../i18n';
import { timeAgo } from '../../utils/datetime';
import { processContent, escapeAttr } from '../../utils/sanitize';

/**
 * 메인 컨테이너 템플릿
 */
export function containerTemplate(prefix: string): string {
  return `
    <div class="${prefix}-container">
      <div class="${prefix}-header"></div>
      <div class="${prefix}-editor-wrapper"></div>
      <div class="${prefix}-list-wrapper"></div>
      <div class="${prefix}-pagination-wrapper"></div>
    </div>
  `;
}

/**
 * 헤더 (댓글 수) 템플릿
 */
export function headerTemplate(
  prefix: string,
  count: number,
  messages: Messages
): string {
  const text = formatMessage(messages.commentCount, { count });
  return `
    <div class="${prefix}-header-content">
      <span class="${prefix}-count">${text}</span>
    </div>
  `;
}

/**
 * 댓글 에디터 템플릿
 */
export function editorTemplate(
  prefix: string,
  messages: Messages,
  options: {
    mode?: 'create' | 'edit' | 'reply';
    initialValue?: string;
    parentId?: string;
    commentId?: string;
    stickerEnabled?: boolean;
  } = {}
): string {
  const { mode = 'create', initialValue = '', parentId, commentId, stickerEnabled = false } = options;
  const parentAttr = parentId ? `data-parent-id="${parentId}"` : '';
  const commentIdAttr = commentId ? `data-comment-id="${commentId}"` : '';
  const modeClass = mode !== 'create' ? `${prefix}-editor--${mode}` : '';
  const showStickerBtn = stickerEnabled;

  return `
    <div class="${prefix}-editor ${modeClass}" ${parentAttr} ${commentIdAttr}>
      <div class="${prefix}-editor-inner">
        ${showStickerBtn ? `
          <div class="${prefix}-sticker-preview" hidden style="display:none">
            <img class="${prefix}-sticker-preview-img" src="" alt="sticker" />
            <button type="button" class="${prefix}-sticker-preview-cancel ${prefix}-btn ${prefix}-btn--text">${messages.stickerPreviewCancel}</button>
          </div>
        ` : ''}
        <textarea
          class="${prefix}-editor-textarea"
          placeholder="${messages.placeholder}"
          rows="3"
        >${initialValue}</textarea>
        <div class="${prefix}-editor-actions">
          ${showStickerBtn ? `
            <div class="${prefix}-sticker-popup-anchor">
              <button type="button" class="${prefix}-sticker-btn" title="${messages.stickerButton}">
                <svg class="${prefix}-sticker-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
            </div>
          ` : ''}
          <div class="${prefix}-editor-actions-spacer"></div>
          ${
            mode !== 'create'
              ? `<button type="button" class="${prefix}-editor-cancel ${prefix}-btn ${prefix}-btn--text">${messages.cancel}</button>`
              : ''
          }
          <button type="button" class="${prefix}-editor-submit ${prefix}-btn ${prefix}-btn--primary">${messages.submit}</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 스티커 팝업 템플릿
 */
export function stickerPopupTemplate(
  prefix: string,
  groups: StickerGroup[],
  messages: Messages
): string {
  if (groups.length === 0) {
    return `
      <div class="${prefix}-sticker-popup">
        <div class="${prefix}-sticker-popup-empty">
          <p class="${prefix}-sticker-popup-empty-text">${messages.stickerPurchase}</p>
          <button type="button" class="${prefix}-sticker-purchase-btn ${prefix}-btn ${prefix}-btn--primary">
            ${messages.stickerPurchase}
          </button>
        </div>
      </div>
    `;
  }

  const tabs = groups.map((group, index) => `
    <button type="button"
      class="${prefix}-sticker-tab ${index === 0 ? `${prefix}-sticker-tab--active` : ''}"
      data-group-id="${group.id}"
      title="${group.name}">
      <img src="${group.thumbnail}" alt="${group.name}" class="${prefix}-sticker-tab-img" />
    </button>
  `).join('');

  const panels = groups.map((group, index) => `
    <div class="${prefix}-sticker-panel"
      data-group-id="${group.id}"
      ${index !== 0 ? 'hidden' : ''}>
      <div class="${prefix}-sticker-grid">
        ${group.stickers.map(sticker => `
          <button type="button"
            class="${prefix}-sticker-item"
            data-sticker-id="${sticker.id}"
            data-pack-id="${group.id}"
            data-image-url="${sticker.imageUrl}">
            <img src="${sticker.imageUrl}" alt="sticker" class="${prefix}-sticker-item-img" loading="lazy" />
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="${prefix}-sticker-popup">
      <div class="${prefix}-sticker-tabs">
        ${tabs}
      </div>
      <div class="${prefix}-sticker-panels">
        ${panels}
      </div>
    </div>
  `;
}

/**
 * 개별 댓글 템플릿
 */
export function commentItemTemplate(
  prefix: string,
  comment: Comment,
  messages: Messages,
  options: {
    isOwner?: boolean;
    showManagerBadge?: boolean;
  } = {}
): string {
  const { isOwner = false, showManagerBadge = false } = options;
  const isSticker = !!comment.sticker;
  const content = isSticker
    ? `<img src="${comment.sticker!.imageUrl}" alt="sticker" class="${prefix}-sticker-comment-img" />`
    : processContent(comment.content);
  const time = timeAgo(comment.createdAt, messages);
  const managerBadge =
    showManagerBadge && comment.author.isManager
      ? `<span class="${prefix}-badge ${prefix}-badge--manager">${messages.manager}</span>`
      : '';
  const profileImg = comment.author.profileUrl
    ? `<img src="${comment.author.profileUrl}" alt="${comment.author.nickname}" class="${prefix}-avatar-img">`
    : `<span class="${prefix}-avatar-placeholder">${comment.author.nickname.charAt(0)}</span>`;

  const ownerActions = isOwner
    ? `
      ${!isSticker ? `
        <button type="button" class="${prefix}-action-btn" data-action="edit" data-comment-id="${comment.id}">
          ${messages.edit}
        </button>
      ` : ''}
      <button type="button" class="${prefix}-action-btn ${prefix}-action-btn--danger" data-action="delete" data-comment-id="${comment.id}">
        ${messages.delete}
      </button>
    `
    : '';

  const replyToggle =
    comment.replyCount > 0
      ? `
      <button type="button" class="${prefix}-reply-toggle" data-comment-id="${comment.id}">
        ${formatMessage(messages.showReplies, { count: comment.replyCount })}
      </button>
    `
      : '';

  return `
    <div class="${prefix}-comment-item" data-comment-id="${comment.id}">
      <div class="${prefix}-comment-main">
        <div class="${prefix}-avatar">
          ${profileImg}
        </div>
        <div class="${prefix}-comment-body">
          <div class="${prefix}-comment-header">
            <span class="${prefix}-author">${comment.author.nickname}</span>
            ${managerBadge}
            <span class="${prefix}-time">${time}</span>
          </div>
          <div class="${prefix}-comment-content" data-raw-content="${escapeAttr(comment.content)}">${content}</div>
          <div class="${prefix}-comment-footer">
            <button type="button"
              class="${prefix}-like-btn ${comment.isLiked ? `${prefix}-like-btn--active` : ''}"
              data-comment-id="${comment.id}">
              <span class="${prefix}-like-icon">${comment.isLiked ? '&#9829;' : '&#9825;'}</span>
              <span class="${prefix}-like-count">${comment.likeCount > 0 ? comment.likeCount : ''}</span>
            </button>
            <button type="button" class="${prefix}-action-btn" data-action="reply" data-comment-id="${comment.id}">
              ${messages.reply}
            </button>
            ${ownerActions}
          </div>
        </div>
      </div>
      ${replyToggle}
      <div class="${prefix}-replies" data-parent-id="${comment.id}" hidden></div>
      <div class="${prefix}-reply-editor-wrapper" data-parent-id="${comment.id}" hidden></div>
    </div>
  `;
}

/**
 * 대댓글 템플릿
 */
export function replyItemTemplate(
  prefix: string,
  reply: Comment,
  messages: Messages,
  options: {
    isOwner?: boolean;
    showManagerBadge?: boolean;
  } = {}
): string {
  const { isOwner = false, showManagerBadge = false } = options;
  const isSticker = !!reply.sticker;
  const content = isSticker
    ? `<img src="${reply.sticker!.imageUrl}" alt="sticker" class="${prefix}-sticker-comment-img" />`
    : processContent(reply.content);
  const time = timeAgo(reply.createdAt, messages);
  const managerBadge =
    showManagerBadge && reply.author.isManager
      ? `<span class="${prefix}-badge ${prefix}-badge--manager">${messages.manager}</span>`
      : '';
  const profileImg = reply.author.profileUrl
    ? `<img src="${reply.author.profileUrl}" alt="${reply.author.nickname}" class="${prefix}-avatar-img">`
    : `<span class="${prefix}-avatar-placeholder">${reply.author.nickname.charAt(0)}</span>`;

  const ownerActions = isOwner
    ? `
      ${!isSticker ? `
        <button type="button" class="${prefix}-action-btn" data-action="edit" data-comment-id="${reply.id}">
          ${messages.edit}
        </button>
      ` : ''}
      <button type="button" class="${prefix}-action-btn ${prefix}-action-btn--danger" data-action="delete" data-comment-id="${reply.id}">
        ${messages.delete}
      </button>
    `
    : '';

  return `
    <div class="${prefix}-reply-item" data-comment-id="${reply.id}" data-parent-id="${reply.parentId}">
      <div class="${prefix}-avatar ${prefix}-avatar--small">
        ${profileImg}
      </div>
      <div class="${prefix}-comment-body">
        <div class="${prefix}-comment-header">
          <span class="${prefix}-author">${reply.author.nickname}</span>
          ${managerBadge}
          <span class="${prefix}-time">${time}</span>
        </div>
        <div class="${prefix}-comment-content" data-raw-content="${escapeAttr(reply.content)}">${content}</div>
        <div class="${prefix}-comment-footer">
          <button type="button"
            class="${prefix}-like-btn ${reply.isLiked ? `${prefix}-like-btn--active` : ''}"
            data-comment-id="${reply.id}">
            <span class="${prefix}-like-icon">${reply.isLiked ? '&#9829;' : '&#9825;'}</span>
            <span class="${prefix}-like-count">${reply.likeCount > 0 ? reply.likeCount : ''}</span>
          </button>
          ${ownerActions}
        </div>
      </div>
    </div>
  `;
}

/**
 * 빈 상태 템플릿
 */
export function emptyTemplate(prefix: string, messages: Messages): string {
  return `
    <div class="${prefix}-empty">
      <p class="${prefix}-empty-text">${messages.noComments}</p>
    </div>
  `;
}

/**
 * 로딩 템플릿
 */
export function loadingTemplate(prefix: string): string {
  return `
    <div class="${prefix}-loading">
      <div class="${prefix}-spinner"></div>
    </div>
  `;
}

/**
 * 페이지네이션 템플릿
 */
export function paginationTemplate(
  prefix: string,
  currentPage: number,
  totalPages: number
): string {
  if (totalPages <= 1) {
    return '';
  }

  const pages: string[] = [];

  // 이전 버튼
  pages.push(`
    <button
      type="button"
      class="${prefix}-page-btn ${prefix}-page-prev"
      data-page="${currentPage - 1}"
      ${currentPage === 0 ? 'disabled' : ''}
    >
      &lt;
    </button>
  `);

  // 페이지 번호들
  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  if (startPage > 0) {
    pages.push(`
      <button type="button" class="${prefix}-page-btn" data-page="0">1</button>
    `);
    if (startPage > 1) {
      pages.push(`<span class="${prefix}-page-ellipsis">...</span>`);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? `${prefix}-page-btn--active` : '';
    pages.push(`
      <button type="button" class="${prefix}-page-btn ${activeClass}" data-page="${i}">
        ${i + 1}
      </button>
    `);
  }

  if (endPage < totalPages - 1) {
    if (endPage < totalPages - 2) {
      pages.push(`<span class="${prefix}-page-ellipsis">...</span>`);
    }
    pages.push(`
      <button type="button" class="${prefix}-page-btn" data-page="${totalPages - 1}">
        ${totalPages}
      </button>
    `);
  }

  // 다음 버튼
  pages.push(`
    <button
      type="button"
      class="${prefix}-page-btn ${prefix}-page-next"
      data-page="${currentPage + 1}"
      ${currentPage === totalPages - 1 ? 'disabled' : ''}
    >
      &gt;
    </button>
  `);

  return `
    <div class="${prefix}-pagination">
      ${pages.join('')}
    </div>
  `;
}

/**
 * 에러 메시지 템플릿
 */
export function errorTemplate(prefix: string, message: string): string {
  return `
    <div class="${prefix}-error">
      <p class="${prefix}-error-text">${message}</p>
    </div>
  `;
}

/**
 * 로그인 필요 메시지 템플릿
 */
export function loginRequiredTemplate(
  prefix: string,
  messages: Messages
): string {
  return `
    <div class="${prefix}-login-required">
      <p class="${prefix}-login-text">${messages.loginRequired}</p>
    </div>
  `;
}
