// 메인 엔트리포인트
import { CommentBox } from './core/CommentBox';

// 스타일 import (Vite가 CSS로 번들링)
import './ui/styles/index.scss';

// 타입 내보내기
export type {
  Comment,
  CommentAuthor,
  CreateCommentData,
  UpdateCommentData,
  GetCommentsParams,
  GetCommentsResponse,
  GetRepliesParams,
  GetRepliesResponse,
} from './types/comment';

export type {
  CommentBoxOptions,
  NormalizedOptions,
  Formation,
  Theme,
  Locale,
  UserInfo,
  AuthConfig,
  Messages,
} from './types/options';

export type { CommentAPI } from './api/CommentAPI';

// 클래스 및 유틸리티 내보내기
export { CommentBox } from './core/CommentBox';
export type { CommentBoxInstance } from './core/CommentBox';
export { EventEmitter, EVENTS } from './core/EventEmitter';
export { MockAPI } from './api/MockAPI';
export { HttpAPI } from './api/HttpAPI';

// 유틸리티 내보내기 (선택적)
export { sanitize, stripTags, nl2br, processContent } from './utils/sanitize';
export { timeAgo, formatDate, formatDateTime } from './utils/datetime';

// 전역 등록 (UMD 빌드용)
if (typeof window !== 'undefined') {
  (window as typeof window & { CommentBox: typeof CommentBox }).CommentBox = CommentBox;
}

// 기본 내보내기
export default CommentBox;
