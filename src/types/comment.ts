/**
 * 댓글 작성자 정보
 */
export interface CommentAuthor {
  id: string;
  nickname: string;
  profileUrl?: string;
  isManager?: boolean;
}

/**
 * 댓글 데이터
 */
export interface Comment {
  id: string;
  objectId: string;
  parentId: string | null;
  content: string;
  author: CommentAuthor;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
}

/**
 * 댓글 생성 요청 데이터
 */
export interface CreateCommentData {
  content: string;
  author?: CommentAuthor;
}

/**
 * 댓글 수정 요청 데이터
 */
export interface UpdateCommentData {
  content: string;
}

/**
 * 댓글 목록 조회 파라미터
 */
export interface GetCommentsParams {
  objectId: string;
  page: number;
  pageSize: number;
  sort?: 'latest' | 'popular';
}

/**
 * 댓글 목록 응답
 */
export interface GetCommentsResponse {
  comments: Comment[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
}

/**
 * 대댓글 목록 조회 파라미터
 */
export interface GetRepliesParams {
  page: number;
  pageSize: number;
}

/**
 * 대댓글 목록 응답
 */
export interface GetRepliesResponse {
  replies: Comment[];
  totalCount: number;
  hasNext: boolean;
}
