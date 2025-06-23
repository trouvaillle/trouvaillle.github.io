---
layout: none
permalink: /app/dev-hunter/buildingThemes.js
date: 2025-06-24 03:51:00 +0900
---
// 건물 테마/타입/색상/랜덤 규칙 정의 (모듈)
export const buildingThemes = [
  {
    name: '도심',
    types: [
      { type: '오피스', color: [0x3a3a3a, 0x4a90e2, 0xcccccc], minH: 4, maxH: 12, minW: 1.5, maxW: 3, minD: 1.5, maxD: 3 },
      { type: '카페', color: [0xc68642, 0x8d5524, 0xffe4b5], minH: 1.5, maxH: 2.5, minW: 1.2, maxW: 2, minD: 1.2, maxD: 2 },
      { type: '상가', color: [0xeeeeee, 0x333333, 0xffcc00], minH: 2, maxH: 4, minW: 1.5, maxW: 3, minD: 1.5, maxD: 3 }
    ]
  },
  {
    name: '주택가',
    types: [
      { type: '단독주택', color: [0xf5deb3, 0xdeb887, 0x8b5c2a], minH: 1, maxH: 2, minW: 1.5, maxW: 2.5, minD: 1.5, maxD: 2.5 },
      { type: '연립주택', color: [0xfaf0e6, 0x8b7b5c, 0x6b4226], minH: 1.5, maxH: 2.5, minW: 2, maxW: 3, minD: 1.5, maxD: 2.5 }
    ]
  },
  {
    name: '아파트',
    types: [
      { type: '아파트동', color: [0xcccccc, 0xeeeeee, 0x888888], minH: 6, maxH: 15, minW: 2, maxW: 4, minD: 1.5, maxD: 3 }
    ]
  },
  {
    name: '쇼핑몰/상가',
    types: [
      { type: '쇼핑몰', color: [0xffe4e1, 0x8ecae6, 0x219ebc], minH: 2, maxH: 5, minW: 3, maxW: 6, minD: 2, maxD: 4 },
      { type: '상가', color: [0xf7b801, 0xf18701, 0x6a4c93], minH: 2, maxH: 4, minW: 2, maxW: 4, minD: 1.5, maxD: 3 }
    ]
  },
  {
    name: '학교/캠퍼스',
    types: [
      { type: '학교', color: [0xfafafa, 0x1976d2, 0x388e3c], minH: 2, maxH: 4, minW: 3, maxW: 6, minD: 2, maxD: 4 },
      { type: '체육관', color: [0x607d8b, 0xffb300, 0x8bc34a], minH: 2, maxH: 3, minW: 2, maxW: 4, minD: 2, maxD: 4 }
    ]
  },
  {
    name: '공원/녹지',
    types: [
      { type: '파빌리온', color: [0x388e3c, 0x8bc34a, 0xcddc39], minH: 1, maxH: 2, minW: 2, maxW: 3, minD: 2, maxD: 3 },
      { type: '화장실', color: [0x607d8b, 0xffffff, 0x90a4ae], minH: 1, maxH: 1.5, minW: 1, maxW: 2, minD: 1, maxD: 2 }
    ]
  },
  {
    name: '산업단지',
    types: [
      { type: '공장', color: [0x757575, 0x616161, 0xbdbdbd], minH: 2, maxH: 5, minW: 3, maxW: 6, minD: 2, maxD: 5 },
      { type: '창고', color: [0x90a4ae, 0xcfd8dc, 0x607d8b], minH: 2, maxH: 4, minW: 2, maxW: 5, minD: 2, maxD: 4 }
    ]
  },
  {
    name: '항구/해안가',
    types: [
      { type: '컨테이너', color: [0x1976d2, 0xff3d00, 0x43a047], minH: 1, maxH: 2, minW: 2, maxW: 4, minD: 2, maxD: 4 },
      { type: '등대', color: [0xffffff, 0xff1744, 0x1976d2], minH: 3, maxH: 6, minW: 1, maxW: 2, minD: 1, maxD: 2 }
    ]
  },
  {
    name: '산악/언덕',
    types: [
      { type: '산장', color: [0x8d5524, 0xc68642, 0xf5deb3], minH: 1, maxH: 2, minW: 1.5, maxW: 2.5, minD: 1.5, maxD: 2.5 },
      { type: '펜션', color: [0x607d8b, 0x90a4ae, 0xffffff], minH: 1.5, maxH: 3, minW: 2, maxW: 3, minD: 1.5, maxD: 2.5 }
    ]
  },
  {
    name: '전통시장',
    types: [
      { type: '시장상가', color: [0xffe082, 0xff7043, 0x8d5524], minH: 1, maxH: 2, minW: 1.5, maxW: 3, minD: 1.5, maxD: 2.5 },
      { type: '포장마차', color: [0xff1744, 0xfff176, 0x43a047], minH: 0.8, maxH: 1.2, minW: 1, maxW: 1.5, minD: 1, maxD: 1.5 }
    ]
  },
  {
    name: '병원/의료지구',
    types: [
      { type: '병원', color: [0xffffff, 0xe57373, 0x90caf9], minH: 3, maxH: 6, minW: 2, maxW: 4, minD: 2, maxD: 4 },
      { type: '약국', color: [0x43a047, 0xffffff, 0xff1744], minH: 1, maxH: 2, minW: 1, maxW: 2, minD: 1, maxD: 2 }
    ]
  },
  {
    name: '호텔/리조트',
    types: [
      { type: '호텔', color: [0x1976d2, 0xffe082, 0xffffff], minH: 4, maxH: 8, minW: 2, maxW: 4, minD: 2, maxD: 4 },
      { type: '리조트', color: [0xfff176, 0x43a047, 0x8bc34a], minH: 2, maxH: 5, minW: 2, maxW: 4, minD: 2, maxD: 4 }
    ]
  },
  {
    name: '박물관/공공기관',
    types: [
      { type: '박물관', color: [0x607d8b, 0xffffff, 0xff7043], minH: 2, maxH: 4, minW: 2, maxW: 4, minD: 2, maxD: 4 },
      { type: '도서관', color: [0x8bc34a, 0x607d8b, 0xffffff], minH: 2, maxH: 3, minW: 2, maxW: 3, minD: 2, maxD: 3 }
    ]
  },
  {
    name: '테마파크',
    types: [
      { type: '회전목마', color: [0xfff176, 0xff1744, 0x1976d2], minH: 2, maxH: 3, minW: 2, maxW: 3, minD: 2, maxD: 3 },
      { type: '놀이기구', color: [0x43a047, 0xffe082, 0x8bc34a], minH: 2, maxH: 4, minW: 2, maxW: 4, minD: 2, maxD: 4 }
    ]
  },
  {
    name: '고급주택가',
    types: [
      { type: '빌라', color: [0xf5deb3, 0x607d8b, 0x8bc34a], minH: 2, maxH: 3, minW: 2, maxW: 3, minD: 2, maxD: 3 },
      { type: '맨션', color: [0xcccccc, 0x607d8b, 0xffffff], minH: 3, maxH: 5, minW: 2, maxW: 4, minD: 2, maxD: 4 }
    ]
  },
  {
    name: '농촌/전원',
    types: [
      { type: '농가', color: [0xf5deb3, 0x8bc34a, 0xdeb887], minH: 1, maxH: 2, minW: 1.5, maxW: 2.5, minD: 1.5, maxD: 2.5 },
      { type: '곡물창고', color: [0xffe082, 0xdeb887, 0x8d5524], minH: 1, maxH: 2, minW: 1.5, maxW: 2.5, minD: 1.5, maxD: 2.5 }
    ]
  },
  {
    name: '철도역/터미널',
    types: [
      { type: '역사', color: [0x607d8b, 0xffffff, 0xff7043], minH: 2, maxH: 4, minW: 2, maxW: 4, minD: 2, maxD: 4 },
      { type: '터미널', color: [0x1976d2, 0xffe082, 0x43a047], minH: 2, maxH: 4, minW: 2, maxW: 4, minD: 2, maxD: 4 }
    ]
  },
  {
    name: '종교지구',
    types: [
      { type: '교회', color: [0xffffff, 0x607d8b, 0xff7043], minH: 2, maxH: 4, minW: 2, maxW: 3, minD: 2, maxD: 3 },
      { type: '사찰', color: [0xdeb887, 0x8d5524, 0x607d8b], minH: 2, maxH: 3, minW: 2, maxW: 3, minD: 2, maxD: 3 }
    ]
  },
  {
    name: '군사/경찰/소방',
    types: [
      { type: '경찰서', color: [0x1976d2, 0xffffff, 0x607d8b], minH: 2, maxH: 3, minW: 2, maxW: 3, minD: 2, maxD: 3 },
      { type: '소방서', color: [0xff1744, 0xffffff, 0x607d8b], minH: 2, maxH: 3, minW: 2, maxW: 3, minD: 2, maxD: 3 }
    ]
  },
  {
    name: '공사장/재개발',
    types: [
      { type: '공사장', color: [0xffe082, 0xff7043, 0x607d8b], minH: 1, maxH: 2, minW: 2, maxW: 4, minD: 2, maxD: 4 },
      { type: '크레인', color: [0xf7b801, 0xf18701, 0x6a4c93], minH: 3, maxH: 6, minW: 0.5, maxW: 1, minD: 0.5, maxD: 1 }
    ]
  }
]; 