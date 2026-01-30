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
 * HTTP 기반 댓글 API 구현
 * Nuxt 서버 API 라우트 또는 실제 백엔드와 통신합니다.
 */
export class HttpAPI implements CommentAPI {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '/api/comments', options?: { headers?: Record<string, string> }) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = options?.headers ?? {};
  }

  private mergeHeaders(extra?: Record<string, string>): Record<string, string> {
    return { ...this.defaultHeaders, ...extra };
  }

  async getComments(params: GetCommentsParams): Promise<GetCommentsResponse> {
    const url = new URL(this.baseUrl, window.location.origin);
    url.searchParams.set('objectId', params.objectId);
    url.searchParams.set('page', String(params.page));
    url.searchParams.set('pageSize', String(params.pageSize));
    if (params.sort) url.searchParams.set('sort', params.sort);

    const res = await fetch(url.toString(), {
      headers: this.mergeHeaders(),
    });
    if (!res.ok) throw new Error(`getComments failed: ${res.status}`);
    return res.json();
  }

  async createComment(
    objectId: string,
    data: CreateCommentData,
  ): Promise<Comment> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.mergeHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ objectId, ...data }),
    });
    if (!res.ok) throw new Error(`createComment failed: ${res.status}`);
    return res.json();
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentData,
  ): Promise<Comment> {
    const res = await fetch(`${this.baseUrl}/${commentId}`, {
      method: 'PUT',
      headers: this.mergeHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`updateComment failed: ${res.status}`);
    return res.json();
  }

  async deleteComment(commentId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${commentId}`, {
      method: 'DELETE',
      headers: this.mergeHeaders(),
    });
    if (!res.ok) throw new Error(`deleteComment failed: ${res.status}`);
  }

  async getReplies(
    parentId: string,
    params: GetRepliesParams,
  ): Promise<GetRepliesResponse> {
    const url = new URL(
      `${this.baseUrl}/${parentId}/replies`,
      window.location.origin,
    );
    url.searchParams.set('page', String(params.page));
    url.searchParams.set('pageSize', String(params.pageSize));

    const res = await fetch(url.toString(), {
      headers: this.mergeHeaders(),
    });
    if (!res.ok) throw new Error(`getReplies failed: ${res.status}`);
    return res.json();
  }

  async createReply(
    parentId: string,
    data: CreateCommentData,
  ): Promise<Comment> {
    const res = await fetch(`${this.baseUrl}/${parentId}/replies`, {
      method: 'POST',
      headers: this.mergeHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`createReply failed: ${res.status}`);
    return res.json();
  }

  async likeComment(commentId: string): Promise<Comment> {
    const res = await fetch(`${this.baseUrl}/${commentId}/like`, {
      method: 'POST',
      headers: this.mergeHeaders(),
    });
    if (!res.ok) throw new Error(`likeComment failed: ${res.status}`);
    return res.json();
  }

  async unlikeComment(commentId: string): Promise<Comment> {
    const res = await fetch(`${this.baseUrl}/${commentId}/unlike`, {
      method: 'POST',
      headers: this.mergeHeaders(),
    });
    if (!res.ok) throw new Error(`unlikeComment failed: ${res.status}`);
    return res.json();
  }
}
