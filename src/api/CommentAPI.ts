import type {
  Comment,
  CreateCommentData,
  UpdateCommentData,
  GetCommentsParams,
  GetCommentsResponse,
  GetRepliesParams,
  GetRepliesResponse,
} from '../types/comment';

/**
 * 댓글 API 인터페이스
 * Mock API와 실제 HTTP API 모두 이 인터페이스를 구현합니다.
 */
export interface CommentAPI {
  /**
   * 댓글 목록 조회
   */
  getComments(params: GetCommentsParams): Promise<GetCommentsResponse>;

  /**
   * 댓글 작성
   */
  createComment(
    objectId: string,
    data: CreateCommentData
  ): Promise<Comment>;

  /**
   * 댓글 수정
   */
  updateComment(
    commentId: string,
    data: UpdateCommentData
  ): Promise<Comment>;

  /**
   * 댓글 삭제
   */
  deleteComment(commentId: string): Promise<void>;

  /**
   * 대댓글 목록 조회
   */
  getReplies(
    parentId: string,
    params: GetRepliesParams
  ): Promise<GetRepliesResponse>;

  /**
   * 대댓글 작성
   */
  createReply(
    parentId: string,
    data: CreateCommentData
  ): Promise<Comment>;

  /**
   * 댓글 좋아요
   */
  likeComment(commentId: string): Promise<Comment>;

  /**
   * 댓글 좋아요 취소
   */
  unlikeComment(commentId: string): Promise<Comment>;
}
