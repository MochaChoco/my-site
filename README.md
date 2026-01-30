# OGQ Comment Box

프레임워크 독립적인 Vanilla JS 댓글 모듈

## 특징

- **프레임워크 독립적**: React, Vue, Angular 등 어떤 프레임워크에서도 사용 가능
- **TypeScript 지원**: 완전한 타입 정의 제공
- **대댓글 지원**: 계층형 댓글 구조
- **인라인 수정**: 댓글/대댓글을 제자리에서 수정 (전체 새로고침 없음)
- **좋아요**: 댓글/대댓글 좋아요 토글 (부분 DOM 업데이트)
- **스티커 지원**: 스티커 단독 전송, 그룹별 팝업, 미리보기 후 전송
- **커스텀 삭제 확인**: 기본 confirm() 또는 소비자 제공 콜백 사용
- **다국어 지원**: 한국어, 영어 기본 제공
- **테마 지원**: 라이트/다크 테마
- **반응형**: 모바일 최적화

## 설치

```bash
npm install @ogqcorp/comment-box
```

> GitHub Packages를 사용하므로 `~/.npmrc` 또는 프로젝트 `.npmrc`에 다음 설정이 필요합니다:
> ```
> //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
> @ogqcorp:registry=https://npm.pkg.github.com
> ```

## 사용법

### 기본 사용

```html
<div id="comment-box"></div>

<script type="module">
  import CommentBox from '@ogqcorp/comment-box';
  import '@ogqcorp/comment-box/style.css';

  CommentBox.init({
    container: '#comment-box',
    objectId: 'article-123',
  });
</script>
```

### UMD (브라우저 직접 로드)

```html
<link rel="stylesheet" href="path/to/comment-box.css">
<script src="path/to/comment-box.umd.js"></script>

<script>
  CommentBox.init({
    container: '#comment-box',
    objectId: 'article-123',
  });
</script>
```

### Vue 3 통합

```vue
<template>
  <div ref="commentBox"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CommentBox from '@ogqcorp/comment-box';
import '@ogqcorp/comment-box/style.css';

const commentBox = ref(null);

onMounted(() => {
  CommentBox.init({
    container: commentBox.value,
    objectId: props.articleId,
    isManager: props.isAuthor,
  });
});

onUnmounted(() => {
  CommentBox.destroy(commentBox.value);
});
</script>
```

### 스티커 기능

```javascript
CommentBox.init({
  container: '#comment-box',
  objectId: 'article-123',
  sticker: {
    enabled: true,
    groups: [
      {
        id: 'pack-1',
        name: '기본 스티커',
        thumbnail: '/stickers/pack1/thumb.png',
        stickers: [
          { id: 'sticker-1', imageUrl: '/stickers/pack1/001.png' },
          { id: 'sticker-2', imageUrl: '/stickers/pack1/002.png' },
        ],
      },
    ],
    // 스티커 그룹이 비어있을 때 호출되는 콜백
    onStickerPurchase: () => {
      window.open('/sticker-store');
    },
  },
});
```

**스티커 동작 방식:**
- 스티커는 텍스트와 혼합 불가 (단독 전송)
- 스티커 선택 시 입력창에 미리보기 표시 → 등록 버튼으로 전송
- 스티커 댓글은 수정 불가 (삭제만 가능)
- `sticker.groups`가 빈 배열이면 "스티커를 구매해보세요" 안내 + `onStickerPurchase` 콜백 호출

### 좋아요 & 커스텀 삭제 확인

```javascript
CommentBox.init({
  container: '#comment-box',
  objectId: 'article-123',

  // 좋아요 콜백
  onCommentLike: (comment, liked) => {
    console.log(liked ? '좋아요' : '좋아요 취소', comment.id);
  },

  // 커스텀 삭제 확인 (기본: browser confirm)
  onDeleteConfirm: (commentId, proceed) => {
    // 자체 모달/다이얼로그 표시
    showCustomModal({
      message: '정말 삭제하시겠습니까?',
      onConfirm: () => proceed(),  // proceed() 호출 시 실제 삭제 실행
    });
  },
});
```

## 옵션

```typescript
interface CommentBoxOptions {
  // 필수
  container: string | HTMLElement;  // 마운트할 DOM 요소
  objectId: string;                 // 댓글 대상 ID

  // API 설정
  api?: CommentAPI;                 // 커스텀 API 인스턴스
  apiUrl?: string;                  // API URL

  // UI 설정
  pageSize?: number;                // 페이지당 댓글 수 (기본: 10)
  formation?: Formation[];          // UI 구성 ['count', 'write', 'list', 'page']
  isManager?: boolean;              // 관리자 여부

  // 테마
  theme?: 'light' | 'dark';         // 테마 (기본: light)
  responsive?: boolean;             // 반응형 (기본: true)

  // 다국어
  locale?: 'ko' | 'en';             // 언어 (기본: ko)

  // 스티커
  sticker?: {
    enabled: boolean;                // 스티커 기능 on/off
    groups: StickerGroup[];          // 스티커 그룹 목록
    onStickerPurchase?: () => void;  // 빈 그룹 시 구매 콜백
  };

  // 인증
  auth?: {
    isLoggedIn: () => boolean;
    getUserInfo: () => UserInfo | null;
    onLoginRequired?: () => void;
  };

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
```

## API

### CommentBox

```typescript
// 초기화
const instance = CommentBox.init(options);

// 인스턴스 조회
const instance = CommentBox.getInstance('#comment-box');

// 정리
CommentBox.destroy('#comment-box');

// 모든 인스턴스 정리
CommentBox.destroyAll();
```

### CommentBoxInstance

```typescript
// 새로고침
await instance.refresh();

// 이벤트 리스너
const unsubscribe = instance.on('comment:add', (comment) => {
  console.log('New comment:', comment);
});

instance.on('comment:like', ({ comment, liked }) => {
  console.log(liked ? 'Liked' : 'Unliked', comment.id);
});

// 상태 조회
const state = instance.getState();

// 정리
instance.destroy();
```

---

## 아키텍처

### 프로젝트 구조

```
ogq-comment-box/
├── src/
│   ├── core/                    # 핵심 로직
│   │   ├── CommentBox.ts        # 싱글톤 매니저
│   │   ├── CommentBoxInstance.ts # 개별 인스턴스
│   │   └── EventEmitter.ts      # 이벤트 시스템
│   ├── api/                     # API 레이어
│   │   ├── CommentAPI.ts        # 인터페이스 정의
│   │   ├── MockAPI.ts           # Mock 구현 (메모리)
│   │   └── HttpAPI.ts           # HTTP 구현 (서버 연동)
│   ├── ui/
│   │   ├── templates/           # DOM 템플릿
│   │   └── styles/              # SCSS 스타일
│   ├── utils/                   # 유틸리티
│   │   ├── sanitize.ts          # XSS 방지
│   │   ├── datetime.ts          # 시간 포맷
│   │   └── dom.ts               # DOM 헬퍼
│   ├── i18n/                    # 다국어 (ko, en)
│   ├── types/                   # TypeScript 타입 (sticker.ts 포함)
│   └── index.ts                 # 엔트리포인트
├── dist/                        # 빌드 결과물
├── examples/                    # 데모
└── tests/                       # 테스트
```

### 댓글 생성 흐름 (Mock API 기준)

사용자가 댓글을 작성하고 등록 버튼을 클릭했을 때의 전체 흐름입니다.

#### 1단계: 사용자 액션

```
textarea에 "안녕하세요!" 입력 → "등록" 버튼 클릭
```

#### 2단계: 이벤트 위임으로 클릭 감지

`CommentBoxInstance.ts`의 `setupEventDelegation()`에서 등록된 이벤트 리스너가 클릭을 감지합니다.

```typescript
// .cb-editor-submit 버튼 클릭 시
delegate(container, '.cb-editor-submit', 'click', (_, target) => {
  const editor = target.closest('.cb-editor');
  this.handleEditorSubmit(editor);  // 다음 단계로 이동
});
```

#### 3단계: handleEditorSubmit() 실행

```typescript
private async handleEditorSubmit(editor: HTMLElement): Promise<void> {
  // 1) textarea에서 내용 추출
  const content = textarea?.value.trim();  // "안녕하세요!"

  // 2) 로그인 확인 (auth가 설정된 경우)
  if (auth && !auth.isLoggedIn()) {
    auth.onLoginRequired?.();
    return;
  }

  // 3) API 호출
  const comment = await this.api.createComment(objectId, {
    content: "안녕하세요!",
    author: userInfo,
  });

  // 4) 목록 새로고침
  await this.loadComments();
  textarea.value = '';
}
```

#### 4단계: MockAPI.createComment() 실행

```typescript
async createComment(objectId: string, data: CreateCommentData): Promise<Comment> {
  // 1) 네트워크 지연 시뮬레이션 (300ms)
  await this.simulateDelay();

  // 2) 새 댓글 객체 생성
  const newComment: Comment = {
    id: this.generateId(),        // "comment-100"
    objectId,                     // "notice-123"
    parentId: null,
    content: data.content,        // "안녕하세요!"
    author: data.author || { id: 'anonymous', nickname: '익명' },
    createdAt: now,
    replyCount: 0,
    likeCount: 0,
    isLiked: false,
  };

  // 3) 메모리 배열 맨 앞에 추가
  this.comments.unshift(newComment);

  return newComment;
}
```

**MockAPI 내부 상태 변화:**

```javascript
// Before
this.comments = [
  { id: 'comment-1', content: '첫 번째 댓글...', ... },
  { id: 'comment-2', content: '두 번째 댓글...', ... },
];

// After
this.comments = [
  { id: 'comment-100', content: '안녕하세요!', ... },  // NEW
  { id: 'comment-1', content: '첫 번째 댓글...', ... },
  { id: 'comment-2', content: '두 번째 댓글...', ... },
];
```

#### 5단계: loadComments()로 목록 새로고침

```typescript
private async loadComments(): Promise<void> {
  // 1) MockAPI.getComments() 호출
  const response = await this.api.getComments({
    objectId,
    page: 0,
    pageSize: 10,
  });

  // 2) 상태 업데이트
  this.setState({
    comments: response.comments,
    totalCount: response.totalCount,
  });

  // 3) 화면 렌더링
  this.render();
}
```

#### 6단계: MockAPI.getComments() 실행

```typescript
async getComments(params): Promise<GetCommentsResponse> {
  // 1) 필터링: objectId 일치 + parentId가 null (일반 댓글만)
  const filtered = this.comments.filter(
    (c) => c.objectId === params.objectId && c.parentId === null
  );

  // 2) 최신순 정렬
  const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);

  // 3) 페이지네이션
  const paginated = sorted.slice(0, params.pageSize);

  return {
    comments: paginated,
    totalCount: filtered.length,
    hasNext: false,
    currentPage: 0,
  };
}
```

#### 7단계: render()로 화면 갱신

```typescript
private render(): void {
  this.renderHeader();      // "댓글 N개"
  this.renderEditor();      // 입력 폼 (비워진 상태)
  this.renderList();        // 댓글 목록
  this.renderPagination();  // 페이지네이션
}
```

#### 8단계: renderList()에서 HTML 생성

```typescript
private renderList(): void {
  const commentsHtml = comments.map((comment) =>
    commentItemTemplate(prefix, comment, messages, options)
  ).join('');

  this.elements.listWrapper.innerHTML = commentsHtml;
}
```

#### 최종 결과: 화면에 표시되는 HTML

```html
<div class="cb-comment-item" data-comment-id="comment-100">
  <div class="cb-comment-main">
    <div class="cb-avatar">
      <span class="cb-avatar-placeholder">익</span>
    </div>
    <div class="cb-comment-body">
      <div class="cb-comment-header">
        <span class="cb-author">익명</span>
        <span class="cb-time">오늘</span>
      </div>
      <div class="cb-comment-content" data-raw-content="안녕하세요!">안녕하세요!</div>
      <div class="cb-comment-footer">
        <button class="cb-like-btn" data-comment-id="comment-100">
          <span class="cb-like-icon">&#9825;</span>
          <span class="cb-like-count"></span>
        </button>
        <button class="cb-action-btn" data-action="reply">답글</button>
      </div>
    </div>
  </div>
</div>
```

### 전체 흐름 다이어그램

```
[사용자] "안녕하세요!" 입력 → 등록 클릭
         │
         ▼
[이벤트 위임] .cb-editor-submit 클릭 감지
         │
         ▼
[handleEditorSubmit] textarea 값 추출
         │
         ▼
[MockAPI.createComment]
  ├─ 새 Comment 객체 생성 (id: comment-100)
  ├─ this.comments 배열 맨 앞에 추가
  └─ 생성된 댓글 반환
         │
         ▼
[loadComments]
  ├─ MockAPI.getComments() 호출
  ├─ 필터링 + 정렬 + 페이지네이션
  └─ state.comments 업데이트
         │
         ▼
[render → renderList]
  ├─ commentItemTemplate()으로 HTML 생성
  └─ listWrapper.innerHTML에 삽입
         │
         ▼
[화면] 새 댓글이 목록 최상단에 표시됨
```

---

## API 연동

### 내장 API 구현체

| 클래스 | 설명 | 데이터 저장 |
|--------|------|-------------|
| `MockAPI` | 개발/데모용 Mock | 메모리 (페이지 새로고침 시 초기화) |
| `HttpAPI` | HTTP 서버 연동 | 서버 (브라우저 간 공유, 영속적) |

### HttpAPI 사용

`HttpAPI`는 `CommentAPI` 인터페이스를 `fetch()`로 구현한 HTTP 클라이언트입니다.

```typescript
import CommentBox, { HttpAPI } from '@ogqcorp/comment-box';

CommentBox.init({
  container: '#comment-box',
  objectId: 'article-123',
  api: new HttpAPI('/api/comments'),
});
```

#### 커스텀 헤더

`HttpAPI` 생성자의 두 번째 인자로 `headers`를 전달하면 모든 요청에 포함됩니다.
좋아요 기능을 사용자별로 구분하려면 서버에서 사용자를 식별할 수 있는 헤더를 전달해야 합니다.

```typescript
const api = new HttpAPI('/api/comments', {
  headers: {
    'X-User-Id': currentUser.id,        // 좋아요 사용자 식별용
    'Authorization': `Bearer ${token}`,  // 인증 헤더 등 자유롭게 추가 가능
  },
});

CommentBox.init({
  container: '#comment-box',
  objectId: 'article-123',
  api,
});
```

> **좋아요 동작 방식**: 서버는 `X-User-Id` 헤더로 사용자를 식별하여 좋아요 중복 방지 및 `isLiked` 상태를 사용자별로 반환합니다. 이 헤더가 없으면 좋아요 API가 `401`을 반환하고, 댓글 조회 시 `isLiked`가 항상 `false`로 내려옵니다.

`HttpAPI`는 다음 엔드포인트를 호출합니다:

| 메서드 | HTTP 요청 |
|--------|-----------|
| `getComments()` | `GET /api/comments?objectId=...&page=0&pageSize=10&sort=latest` |
| `createComment()` | `POST /api/comments` |
| `updateComment()` | `PUT /api/comments/:id` |
| `deleteComment()` | `DELETE /api/comments/:id` |
| `getReplies()` | `GET /api/comments/:id/replies?page=0&pageSize=10` |
| `createReply()` | `POST /api/comments/:id/replies` |
| `likeComment()` | `POST /api/comments/:id/like` |
| `unlikeComment()` | `POST /api/comments/:id/unlike` |

### Nuxt 3 서버 API와 함께 사용 (로컬 테스트)

nom-market-front에 Nuxt 서버 API 라우트와 JSON 파일 저장소를 구성하면, 서버 없이도 브라우저 간 데이터가 공유되는 테스트 환경을 만들 수 있습니다.

```
nom-market-front/src/server/
├── data/comments.json           # 댓글 데이터 (JSON 파일)
├── utils/commentStore.ts        # 파일 읽기/쓰기 유틸
└── api/comments/
    ├── index.get.ts             # GET  /api/comments
    ├── index.post.ts            # POST /api/comments
    ├── [id].put.ts              # PUT  /api/comments/:id
    ├── [id].delete.ts           # DELETE /api/comments/:id
    └── [id]/
        ├── replies.get.ts       # GET  /api/comments/:id/replies
        ├── replies.post.ts      # POST /api/comments/:id/replies
        ├── like.post.ts         # POST /api/comments/:id/like
        └── unlike.post.ts       # POST /api/comments/:id/unlike
```

```vue
<!-- Vue 3 (Nuxt) 통합 예시 -->
<script setup>
let CommentBox = null;
let HttpAPI = null;
if (import.meta.client) {
  const mod = await import('@ogqcorp/comment-box');
  CommentBox = mod.default || mod.CommentBox;
  HttpAPI = mod.HttpAPI;
  await import('@ogqcorp/comment-box/style.css');
}

function initCommentBox() {
  const userId = isAuthorizedUser.value
    ? getAuthUser.value.customerId
    : undefined;

  CommentBox.init({
    container: '#comment-box',
    objectId: 'article-123',
    api: HttpAPI
      ? new HttpAPI('/api/comments', {
          headers: userId ? { 'X-User-Id': userId } : {},
        })
      : undefined,
  });
}
</script>
```

### 커스텀 API 구현

다른 백엔드를 사용하려면 `CommentAPI` 인터페이스를 직접 구현합니다.

```typescript
interface CommentAPI {
  getComments(params: GetCommentsParams): Promise<GetCommentsResponse>;
  createComment(objectId: string, data: CreateCommentData): Promise<Comment>;
  updateComment(commentId: string, data: UpdateCommentData): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  getReplies(parentId: string, params: GetRepliesParams): Promise<GetRepliesResponse>;
  createReply(parentId: string, data: CreateCommentData): Promise<Comment>;
  likeComment(commentId: string): Promise<Comment>;
  unlikeComment(commentId: string): Promise<Comment>;
}
```

```typescript
import CommentBox from '@ogqcorp/comment-box';
import type { CommentAPI } from '@ogqcorp/comment-box';

class MyCustomAPI implements CommentAPI {
  // ... 인터페이스 메서드 구현
}

CommentBox.init({
  container: '#comment-box',
  objectId: 'article-123',
  api: new MyCustomAPI(),
});
```

---

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 타입 체크
npm run typecheck
```

### 배포 (GitHub Packages)

```bash
# 버전 올리기
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0

# GitHub Packages에 배포 (빌드 자동 실행)
npm publish

# 소비자 프로젝트에서 설치
npm install @ogqcorp/comment-box
```

> `~/.npmrc`에 GitHub Packages 인증 설정이 필요합니다:
> ```
> //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
> @ogqcorp:registry=https://npm.pkg.github.com
> ```

### npm link로 로컬 개발

```bash
# ogq-comment-box 폴더에서
npm link

# 소비자 프로젝트 폴더에서
npm link @ogqcorp/comment-box
```

---

## 라이선스

MIT
