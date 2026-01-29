import DOMPurify from 'dompurify';

/**
 * XSS 방지를 위한 HTML sanitize
 */
export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * 텍스트에서 HTML 태그 완전 제거
 */
export function stripTags(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * 줄바꿈을 <br> 태그로 변환
 */
export function nl2br(text: string): string {
  return text.replace(/\n/g, '<br>');
}

/**
 * 댓글 내용 처리 (sanitize + nl2br)
 */
export function processContent(content: string): string {
  const sanitized = sanitize(content);
  return nl2br(sanitized);
}

/**
 * HTML attribute 값 이스케이프
 */
export function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
