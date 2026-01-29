import type { Comment } from './comment';
import type { CommentAPI } from '../api/CommentAPI';
import type { StickerConfig } from './sticker';

/**
 * UI 구성요소 타입
 */
export type Formation = 'count' | 'write' | 'list' | 'page';

/**
 * 테마 타입
 */
export type Theme = 'light' | 'dark';

/**
 * 지원 언어
 */
export type Locale = 'ko' | 'en';

/**
 * 사용자 정보 (인증용)
 */
export interface UserInfo {
  id: string;
  nickname: string;
  profileUrl?: string;
}

/**
 * 인증 설정
 */
export interface AuthConfig {
  isLoggedIn: () => boolean;
  getUserInfo: () => UserInfo | null;
  onLoginRequired?: () => void;
}

/**
 * 메시지 커스터마이징
 */
export interface Messages {
  commentCount: string;
  placeholder: string;
  submit: string;
  cancel: string;
  reply: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  noComments: string;
  loadMore: string;
  showReplies: string;
  hideReplies: string;
  manager: string;
  today: string;
  daysAgo: string;
  monthsAgo: string;
  yearsAgo: string;
  loginRequired: string;
  like: string;
  stickerButton: string;
  stickerPurchase: string;
  stickerPreviewCancel: string;
}

/**
 * CommentBox 초기화 옵션
 */
export interface CommentBoxOptions {
  // 필수 옵션
  container: string | HTMLElement;
  objectId: string;

  // API 설정
  api?: CommentAPI;
  apiUrl?: string;

  // UI 설정
  pageSize?: number;
  formation?: Formation[];
  isManager?: boolean;

  // 테마 및 스타일
  theme?: Theme;
  responsive?: boolean;
  cssPrefix?: string;

  // 다국어
  locale?: Locale;
  messages?: Partial<Messages>;

  // 스티커
  sticker?: StickerConfig;

  // 인증
  auth?: AuthConfig;

  // 콜백
  onReady?: () => void;
  onError?: (error: Error) => void;
  onCommentAdd?: (comment: Comment) => void;
  onCommentUpdate?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
  onReplyAdd?: (reply: Comment, parentId: string) => void;
  onCommentLike?: (comment: Comment, liked: boolean) => void;
  onDeleteConfirm?: (commentId: string, proceed: () => void) => void;
}

/**
 * 내부에서 사용하는 정규화된 옵션 (모든 필드 필수)
 */
export interface NormalizedOptions {
  container: HTMLElement;
  objectId: string;
  api: CommentAPI;
  apiUrl: string;
  pageSize: number;
  formation: Formation[];
  isManager: boolean;
  theme: Theme;
  responsive: boolean;
  cssPrefix: string;
  locale: Locale;
  messages: Messages;
  sticker: StickerConfig | null;
  auth: AuthConfig | null;
  onReady: (() => void) | null;
  onError: ((error: Error) => void) | null;
  onCommentAdd: ((comment: Comment) => void) | null;
  onCommentUpdate: ((comment: Comment) => void) | null;
  onCommentDelete: ((commentId: string) => void) | null;
  onReplyAdd: ((reply: Comment, parentId: string) => void) | null;
  onCommentLike: ((comment: Comment, liked: boolean) => void) | null;
  onDeleteConfirm: ((commentId: string, proceed: () => void) => void) | null;
}
