# PushPush — 구현 계획

## 1. 아키텍쳐 개요

- 순수 HTML + CSS + JavaScript (Canvas 2D)
- 객체지향: `Game`, `Stage`, `Player`, `Board`, `Renderer`, `InputManager`, `AssetLoader`, `LevelSelect` 클래스로 분리
- game state machine: `welcome` → `playing` → `clear` / `gameover` → (재시작) → `playing`

## 2. 파일 구조 (기존 유지)

```
pushpush/
  pushpush.html    ← 구조, Jekyll front matter 유지
  styles.css       ← 레이아웃/스타일
  script.js        ← 모든 게임 로직 (class PushPush)
  pushpush.dat     ← 맵 데이터 (8450 bytes, stride=13, height=13, 50 stages)
  PLAN.md
  PREP_PLAN.md     ← 본 파일
```

## 3. 주요 클래스 설계

### PushPush (entry point)
- `AssetLoader`로 이미지/데이터 로딩
- `InputManager` 바인딩
- `LevelSelect` UI 생성
- main loop (`requestAnimationFrame`)
- state machine 전환

### AssetLoader
- pushpush.dat fetch + Uint8Array 파싱
- cell 이미지 (pushpush0~5.jpg), background.jpg, pushend.jpg, start1~6.jpg 프리로드 (Image 객체)

### Board
- 13×13 셀 배열 관리
- cell read/write
- 특정 타입 셀 카운트 (house empty / filled)
- 승리 조건 검사 (house empty === 0)
- gameover 조건 검사 (모든 ball(1,3)이 이동 불가)

### Player
- 현재 좌표 (row, col)
- `move(direction, board)`: 이동/푸시 시도
  - 이동 가능 여부 판단 (wall=4 불가)
  - ball(1) 또는 house(filled=3)이면: 밀기 시도
    - 밀린 공이 벽/다른 공이면 실패
    - 밀린 공이 empty(5) → ball(1), house(empty=2) → house(filled=3)
    - 원래 ball 위치: → 빈칸(5), 단 house(filled)였으면 → house(empty=2)
  - player 이동 가능하면 이동, 원래 자리 → empty(5)

### LevelSelect
- 페이지 좌상단 레벨 번호 표시 / 드롭다운 또는 grid
- 접근 가능 레벨: 1 ~ max(마지막 클리어 레벨, 마지막 플레이 레벨)
- localStorage에 `lastCleared`, `lastPlayed` 저장

### Renderer
- Canvas 2D 기준
- background.jpg를 캔버스에 그리고, 그 위에 cell 이미지를 offset 계산하여 그림
- welcome 상태: start1~6.jpg 무한 루프 (setInterval로 전환, click/key로 playing)
- gameover 상태: 보드 중앙에 pushend.jpg (반투명 overlay)
- clear 상태: 1초간 "Clear!" 텍스트 표시 후 자동 다음 레벨

### InputManager
- keyboard: wasd / arrow keys → player.move()
- mouse: 클릭 위치가 player 인접 셀(상하좌우, 거리 1)이면 해당 방향으로 move
- welcome/clear/gameover: click/key → 상태 전환

## 4. 게임 상태 흐름

```
[welcome]
  │ click/key ↓
[playing]
  │ 승리 ↓                    │ 패배 ↓
[clear] (1초 후)            [gameover]
  │ click/key ↓              │ click/key ↓
[playing: next level]       [playing: current level restart]
```

## 5. 세부 구현 규칙

| 항목 | 내용 |
|------|------|
| 왼쪽 상단 | 레벨 선택 UI + 현재 레벨 표시 + Reset 버튼 |
| 이동 | wasd / 방향키 / 인접 셀 클릭 |
| 푸시 규칙 | ball(1) → empty(5) 또는 house(empty=2) 가능. filled(3)도 pushable. |
| 푸시 후 빈자리 | ball이 떠난 자리는 empty(5). 단 filled house(3)였으면 empty house(2). |
| 승리 | 모든 house(empty=2)가 house(filled=3)로 변경됨 |
| 게임오버 | 움직일 수 있는 ball(1 또는 3)이 하나도 없음 (player 이동 불가와 별개) |
| 레벨 진행 | 클리어 시 1초 간 "Clear!" 표시 후 다음 레벨 자동 로드 |
| 레벨 선택 | 1 ~ max(lastCleared, lastPlayed) 까지 자유 이동, 이후는 잠김 |
| 저장 | localStorage key: `pushpush_lastCleared`, `pushpush_lastPlayed` |

## 6. 렌더링 순서 (z-index descending)

1. background.jpg (캔버스 전체, 고정)
2. cell images (pushpush0~5.jpg) — background 위에 중앙 정렬
3. pushend.jpg (gameover 시, 보드 영역 중앙)
4. UI 오버레이 (레벨 표시, Clear! 텍스트 등)

## 7. 데이터 포맷

`pushpush.dat`:
- 8450 bytes, stride=13, height=13, stage count=50
- stage s의 (r, c) cell = `data[s * 169 + r * 13 + c]`
- cell value: 0=player, 1=ball, 2=house(empty), 3=house(filled), 4=wall, 5=empty

## 8. 구현 순서

1. `AssetLoader` — dat 파일 로드 + 이미지 로드
2. `Board` — 맵 데이터 관리 + cell 연산
3. `Renderer` — Canvas 배경/셀 렌더링
4. `Player` — 이동/푸시 로직
5. `InputManager` — 키보드 + 마우스
6. `PushPush` — state machine + game loop 연결
7. `LevelSelect` — 레벨 선택 UI + localStorage
8. welcome/clear/gameover 화면 구현
9. 테스트 및 디버깅
