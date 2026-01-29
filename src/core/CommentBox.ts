import type { CommentBoxOptions, NormalizedOptions, Formation } from '../types/options';
import { CommentBoxInstance } from './CommentBoxInstance';
import { MockAPI } from '../api/MockAPI';
import { getMessages } from '../i18n';
import { resolveContainer } from '../utils/dom';

/**
 * CommentBox 싱글톤 매니저
 * 여러 인스턴스를 관리합니다.
 */
class CommentBoxManager {
  private instances: Map<string, CommentBoxInstance> = new Map();

  /**
   * 새 CommentBox 인스턴스 생성
   */
  init(options: CommentBoxOptions): CommentBoxInstance {
    const normalized = this.normalizeOptions(options);
    const key = this.getContainerKey(normalized.container);

    // 기존 인스턴스가 있으면 정리
    if (this.instances.has(key)) {
      this.destroy(normalized.container);
    }

    const instance = new CommentBoxInstance(normalized);
    this.instances.set(key, instance);

    return instance;
  }

  /**
   * 특정 인스턴스 정리
   */
  destroy(container: string | HTMLElement): void {
    const element = resolveContainer(container);
    if (!element) return;

    const key = this.getContainerKey(element);
    const instance = this.instances.get(key);

    if (instance) {
      instance.destroy();
      this.instances.delete(key);
    }
  }

  /**
   * 모든 인스턴스 정리
   */
  destroyAll(): void {
    this.instances.forEach((instance) => instance.destroy());
    this.instances.clear();
  }

  /**
   * 특정 인스턴스 조회
   */
  getInstance(container: string | HTMLElement): CommentBoxInstance | undefined {
    const element = resolveContainer(container);
    if (!element) return undefined;

    const key = this.getContainerKey(element);
    return this.instances.get(key);
  }

  /**
   * 옵션 정규화 (기본값 적용)
   */
  private normalizeOptions(options: CommentBoxOptions): NormalizedOptions {
    const container = resolveContainer(options.container);
    if (!container) {
      throw new Error(
        `[CommentBox] Container not found: ${options.container}`
      );
    }

    const locale = options.locale || 'ko';
    const defaultMessages = getMessages(locale);

    const defaultFormation: Formation[] = ['count', 'write', 'list', 'page'];

    return {
      container,
      objectId: options.objectId,
      api: options.api || new MockAPI(),
      apiUrl: options.apiUrl || '/api/comments',
      pageSize: options.pageSize || 10,
      formation: options.formation || defaultFormation,
      isManager: options.isManager || false,
      theme: options.theme || 'light',
      responsive: options.responsive !== false,
      cssPrefix: options.cssPrefix || 'cb',
      locale,
      messages: { ...defaultMessages, ...options.messages },
      sticker: options.sticker
        ? {
            enabled: options.sticker.enabled,
            groups: options.sticker.groups || [],
            onStickerPurchase: options.sticker.onStickerPurchase,
          }
        : null,
      auth: options.auth || null,
      onReady: options.onReady || null,
      onError: options.onError || null,
      onCommentAdd: options.onCommentAdd || null,
      onCommentUpdate: options.onCommentUpdate || null,
      onCommentDelete: options.onCommentDelete || null,
      onReplyAdd: options.onReplyAdd || null,
      onCommentLike: options.onCommentLike || null,
      onDeleteConfirm: options.onDeleteConfirm || null,
    };
  }

  /**
   * 컨테이너 고유 키 생성
   */
  private getContainerKey(container: HTMLElement): string {
    // data-cb-id 속성이 있으면 사용
    let key = container.dataset.cbId;
    if (!key) {
      // 없으면 새로 생성
      key = `cb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      container.dataset.cbId = key;
    }
    return key;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const CommentBox = new CommentBoxManager();

export { CommentBox, CommentBoxManager };
export type { CommentBoxInstance };
