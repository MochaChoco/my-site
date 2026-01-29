import type { CommentAPI } from './CommentAPI';
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
 * Mock API 구현
 * 개발 및 테스트용으로 사용됩니다.
 */
export class MockAPI implements CommentAPI {
  private comments: Comment[] = [];
  private delay: number;
  private idCounter: number = 1;
  private likedComments: Set<string> = new Set();

  constructor(initialData?: Comment[], delay: number = 300) {
    this.comments = initialData || this.generateMockData();
    this.delay = delay;
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
  }

  private generateId(): string {
    return `comment-${this.idCounter++}`;
  }

  private generateMockData(): Comment[] {
    return [];
  }

  async getComments(params: GetCommentsParams): Promise<GetCommentsResponse> {
    await this.simulateDelay();

    const filtered = this.comments.filter(
      (c) => c.objectId === params.objectId && c.parentId === null && !c.isDeleted
    );

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      if (params.sort === 'popular') {
        return b.replyCount - a.replyCount;
      }
      return b.createdAt - a.createdAt; // latest (기본)
    });

    const start = params.page * params.pageSize;
    const end = start + params.pageSize;
    const paginated = sorted.slice(start, end).map((c) => ({
      ...c,
      isLiked: this.likedComments.has(c.id),
    }));

    return {
      comments: paginated,
      totalCount: filtered.length,
      hasNext: end < filtered.length,
      currentPage: params.page,
    };
  }

  async createComment(
    objectId: string,
    data: CreateCommentData
  ): Promise<Comment> {
    await this.simulateDelay();

    const now = Math.floor(Date.now() / 1000);
    const newComment: Comment = {
      id: this.generateId(),
      objectId,
      parentId: null,
      content: data.content,
      author: data.author || {
        id: 'anonymous',
        nickname: '익명',
        isManager: false,
      },
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      replyCount: 0,
      likeCount: 0,
      isLiked: false,
    };

    this.comments.unshift(newComment);
    return newComment;
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentData
  ): Promise<Comment> {
    await this.simulateDelay();

    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment not found: ${commentId}`);
    }

    comment.content = data.content;
    comment.updatedAt = Math.floor(Date.now() / 1000);

    return comment;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.simulateDelay();

    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment not found: ${commentId}`);
    }

    comment.isDeleted = true;

    // 부모 댓글의 replyCount 감소
    if (comment.parentId) {
      const parent = this.comments.find((c) => c.id === comment.parentId);
      if (parent && parent.replyCount > 0) {
        parent.replyCount--;
      }
    }
  }

  async getReplies(
    parentId: string,
    params: GetRepliesParams
  ): Promise<GetRepliesResponse> {
    await this.simulateDelay();

    const replies = this.comments.filter(
      (c) => c.parentId === parentId && !c.isDeleted
    );

    const sorted = [...replies].sort((a, b) => a.createdAt - b.createdAt);

    const start = params.page * params.pageSize;
    const end = start + params.pageSize;
    const paginated = sorted.slice(start, end).map((c) => ({
      ...c,
      isLiked: this.likedComments.has(c.id),
    }));

    return {
      replies: paginated,
      totalCount: replies.length,
      hasNext: end < replies.length,
    };
  }

  async createReply(
    parentId: string,
    data: CreateCommentData
  ): Promise<Comment> {
    await this.simulateDelay();

    const parent = this.comments.find((c) => c.id === parentId);
    if (!parent) {
      throw new Error(`Parent comment not found: ${parentId}`);
    }

    const now = Math.floor(Date.now() / 1000);
    const newReply: Comment = {
      id: this.generateId(),
      objectId: parent.objectId,
      parentId,
      content: data.content,
      author: data.author || {
        id: 'anonymous',
        nickname: '익명',
        isManager: false,
      },
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      replyCount: 0,
      likeCount: 0,
      isLiked: false,
    };

    this.comments.push(newReply);
    parent.replyCount++;

    return newReply;
  }

  async likeComment(commentId: string): Promise<Comment> {
    await this.simulateDelay();

    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment not found: ${commentId}`);
    }

    if (!this.likedComments.has(commentId)) {
      this.likedComments.add(commentId);
      comment.likeCount++;
    }

    return { ...comment, isLiked: true };
  }

  async unlikeComment(commentId: string): Promise<Comment> {
    await this.simulateDelay();

    const comment = this.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment not found: ${commentId}`);
    }

    if (this.likedComments.has(commentId)) {
      this.likedComments.delete(commentId);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    }

    return { ...comment, isLiked: false };
  }

  /**
   * Mock 데이터 리셋 (테스트용)
   */
  reset(): void {
    this.comments = this.generateMockData();
    this.idCounter = 100;
    this.likedComments.clear();
  }

  /**
   * 현재 모든 댓글 조회 (테스트용)
   */
  getAllComments(): Comment[] {
    return [...this.comments];
  }
}
