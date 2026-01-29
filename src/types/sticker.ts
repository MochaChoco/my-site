/**
 * 개별 스티커
 */
export interface Sticker {
  id: string;
  imageUrl: string;
}

/**
 * 스티커 그룹 (팩)
 */
export interface StickerGroup {
  id: string;
  name: string;
  thumbnail: string;
  stickers: Sticker[];
}

/**
 * 스티커 설정 옵션
 */
export interface StickerConfig {
  enabled: boolean;
  groups: StickerGroup[];
  onStickerPurchase?: () => void;
}

/**
 * 댓글에 저장되는 스티커 데이터
 */
export interface StickerData {
  packId: string;
  stickerId: string;
  imageUrl: string;
}
