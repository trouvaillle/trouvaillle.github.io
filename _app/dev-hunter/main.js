---
layout: none
permalink: /app/dev-hunter/main.js
date: 2025-06-24 03:51:00 +0900
---
import * as THREE from 'https://esm.sh/three@0.153.0';
import { EffectComposer } from 'https://esm.sh/three@0.153.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.153.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.153.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { buildingThemes } from './buildingThemes.js';

// Dev Hunter 3D - Main Game Logic
// (최종 마무리: 구조/주석/UX/성능/상태관리 개선)

// === Three.js 기본 세팅 ===
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x232526);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

// === 로딩 인디케이터 추가 ===
const loadingEl = document.createElement('div');
loadingEl.id = 'loading-indicator';
loadingEl.style.position = 'absolute';
loadingEl.style.top = '50%';
loadingEl.style.left = '50%';
loadingEl.style.transform = 'translate(-50%, -50%)';
loadingEl.style.width = '80px';
loadingEl.style.height = '80px';
loadingEl.style.border = '10px solid #eee';
loadingEl.style.borderTop = '10px solid #00bfff';
loadingEl.style.borderRadius = '50%';
loadingEl.style.animation = 'spin 1s linear infinite';
loadingEl.style.zIndex = '100';
document.getElementById('game-container').appendChild(loadingEl);
// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// === 카메라/조명/환경맵 ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, -12);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.35);
dirLight.position.set(5, 10, -5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

// 기존 CubeTextureLoader 부분을 equirectangular 환경맵으로 대체
const textureLoader = new THREE.TextureLoader();
textureLoader.load('../assets/img/dev-hunter/goegap_road_1k.jpg', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
  // 로딩 인디케이터 숨기고 게임 시작
  loadingEl.style.display = 'none';
  requestAnimationFrame(animate);
});

// === 도로/자동차/오브젝트 ===
const roadWidth = 8;
const roadLength = 200;
const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.4, roughness: 0.6 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.receiveShadow = true;
scene.add(road);

// 자동차(박스) → 실제 자동차 3D 모델로 교체
function createCarModel(h = 0.6, s = 0.7, v = 0.8) {
  // HSV → RGB 변환 함수
  function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
  }
  const car = new THREE.Group();
  const scale = 0.85;
  // 차체 색상 HSV → RGB
  const bodyColor = hsvToRgb(h, s, v);
  // ... 이하 기존 부품 생성 코드에서 color: 0x1565c0 → color: bodyColor 로 대체 ...
  const bodyMain = new THREE.Mesh(
    new THREE.BoxGeometry(1.6*scale, 0.38*scale, 3.2*scale),
    new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.35 })
  );
  bodyMain.position.set(0, 0.34*scale, 0);
  bodyMain.castShadow = true;
  car.add(bodyMain);

  // 본네트(Hood)
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.5*scale, 0.22*scale, 0.7*scale),
    new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.35 })
  );
  hood.position.set(0, 0.28*scale, 1.15*scale);
  hood.castShadow = true;
  car.add(hood);

  // 루프(Roof)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.1*scale, 0.28*scale, 1.1*scale),
    new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.5, roughness: 0.2 })
  );
  roof.position.set(0, 0.54*scale, -0.2*scale);
  roof.castShadow = true;
  car.add(roof);

  // 트렁크(Trunk)
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(1.4*scale, 0.22*scale, 0.7*scale),
    new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.35 })
  );
  trunk.position.set(0, 0.28*scale, -1.15*scale);
  trunk.castShadow = true;
  car.add(trunk);

  // 도어(Doors) - 양쪽
  for (let side of [-1, 1]) {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.04*scale, 0.32*scale, 1.2*scale),
      new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.35 })
    );
    door.position.set(side * 0.8*scale, 0.34*scale, -0.2*scale);
    door.castShadow = true;
    car.add(door);
  }

  // 휠/타이어 4개
  for (let side of [-1, 1]) {
    for (let front of [-1, 1]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28*scale, 0.28*scale, 0.18*scale, 18),
        new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.7 })
      );
      wheel.position.set(side * 0.7*scale, 0.13*scale, front * 1.1*scale);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      car.add(wheel);
      // 휠캡
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13*scale, 0.13*scale, 0.07*scale, 16),
        new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.9, roughness: 0.3 })
      );
      cap.position.set(side * 0.7*scale, 0.13*scale, front * 1.1*scale);
      cap.rotation.z = Math.PI / 2;
      car.add(cap);
    }
  }

  // 헤드라이트(Headlights)
  for (let side of [-0.45, 0.45]) {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.18*scale, 0.09*scale, 0.08*scale),
      new THREE.MeshStandardMaterial({ color: 0xfffde7, emissive: 0xffffcc, emissiveIntensity: 0.7 })
    );
    headlight.position.set(side*scale, 0.41*scale, 1.55*scale);
    car.add(headlight);
  }

  // 테일라이트(Taillights)
  for (let side of [-0.45, 0.45]) {
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.18*scale, 0.09*scale, 0.08*scale),
      new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.5 })
    );
    taillight.position.set(side*scale, 0.41*scale, -1.55*scale);
    car.add(taillight);
  }

  // 윈도우(앞/뒤/좌/우)
  const glassMat = new THREE.MeshStandardMaterial({ color: bodyColor, transparent: true, opacity: 0.55, metalness: 0.2, roughness: 0.1 });
  // 앞유리
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.05*scale, 0.22*scale, 0.04*scale), glassMat);
  frontGlass.position.set(0, 0.58*scale, 0.6*scale);
  frontGlass.rotation.x = -Math.PI/12;
  car.add(frontGlass);
  // 뒷유리
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.05*scale, 0.22*scale, 0.04*scale), glassMat);
  rearGlass.position.set(0, 0.58*scale, -0.7*scale);
  rearGlass.rotation.x = Math.PI/13;
  car.add(rearGlass);
  // 좌/우 사이드 윈도우
  for (let side of [-1, 1]) {
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04*scale, 0.22*scale, 1.05*scale), glassMat);
    sideGlass.position.set(side * 0.55*scale, 0.58*scale, -0.2*scale);
    car.add(sideGlass);
  }

  // 앞/뒤 범퍼
  const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(1.2*scale, 0.13*scale, 0.18*scale),
    new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.6, roughness: 0.5 })
  );
  frontBumper.position.set(0, 0.22*scale, 1.68*scale);
  car.add(frontBumper);
  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(1.2*scale, 0.13*scale, 0.18*scale),
    new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.6, roughness: 0.5 })
  );
  rearBumper.position.set(0, 0.22*scale, -1.68*scale);
  car.add(rearBumper);

  // 그릴(Grille)
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(0.5*scale, 0.09*scale, 0.04*scale),
    new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.7, roughness: 0.4 })
  );
  grille.position.set(0, 0.33*scale, 1.62*scale);
  car.add(grille);

  // 머플러(Muffler)
  const muffler = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04*scale, 0.04*scale, 0.18*scale, 10),
    new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.8, roughness: 0.3 })
  );
  muffler.position.set(-0.35*scale, 0.13*scale, -1.7*scale);
  muffler.rotation.x = Math.PI/2;
  car.add(muffler);

  // 번호판(License plate)
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.32*scale, 0.08*scale, 0.01*scale),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  plate.position.set(0, 0.22*scale, -1.78*scale);
  car.add(plate);

  // 사이드미러(Side mirror)
  for (let side of [-1, 1]) {
    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.12*scale, 0.06*scale, 0.18*scale),
      new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.7, roughness: 0.4 })
    );
    mirror.position.set(side * 0.92*scale, 0.48*scale, 0.55*scale);
    car.add(mirror);
  }

  // 도어 핸들(Door handle)
  for (let side of [-1, 1]) {
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.16*scale, 0.03*scale, 0.04*scale),
      new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.8, roughness: 0.3 })
    );
    handle.position.set(side * 0.82*scale, 0.41*scale, -0.2*scale);
    car.add(handle);
  }

  return car;
}

// 기존 car Mesh 대신 실제 자동차 모델로 생성
// 플레이어 자동차 HSV(파랑 계열 예시)
const playerHSV = { h: 0.6, s: 0.7, v: 0.8 };
const car = createCarModel(playerHSV.h, playerHSV.s, playerHSV.v);
const laneXs = [-3, -1, 1, 3];
car.position.set(laneXs[Math.floor(Math.random() * laneXs.length)], 0, -roadLength/2 + 4);
car.castShadow = true;
car.receiveShadow = false;
scene.add(car);

// 자동차 헤드라이트(SpotLight)
const headlight = new THREE.SpotLight(0xffffff, 0.2, 18, Math.PI / 7, 0.4, 1.2);
headlight.position.set(0, 0.45, -roadLength/2 + 5.2);
headlight.target.position.set(0, 0.1, -roadLength/2 + 8);
headlight.castShadow = true;
scene.add(headlight);
scene.add(headlight.target);

// === 게임 상태 ===
let isGameOver = false;
let timer = 0;
const startZ = car.position.z;
car.speed = 0;
const MAX_SPEED = 0.7;
const ACCEL = 0.015;
const DECEL = 0.03;

// === 무한 맵 확장 파라미터 ===
let lastGeneratedZ = car.position.z;
const OBSTACLE_INTERVAL = 10; // 장애물 생성 간격
const BGOBJ_INTERVAL = 7;    // 배경 오브젝트 생성 간격
const CLEANUP_DIST = 30;     // 이 거리만큼 뒤로 가면 제거
const PRELOAD_DIST = 250; // 미래 도로/배경/AI 미리 생성 거리

// === 무한 도로 타일 ===
const ROAD_TILE_LENGTH = 40;
const roadTiles = [];
let lastRoadTileZ = car.position.z - ROAD_TILE_LENGTH / 2;
const bgObjects = [];

// === 건물 테마/타입/색상/랜덤 규칙 정의 ===
let currentThemeIdx = 0; // 추후 지역별로 바꿀 수 있음
let roadTileCount = 0;

function spawnRoadTile(z) {
  const roadGeometry = new THREE.PlaneGeometry(roadWidth, ROAD_TILE_LENGTH);
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.4, roughness: 0.6 });
  const tile = new THREE.Mesh(roadGeometry, roadMaterial);
  tile.rotation.x = -Math.PI / 2;
  tile.position.z = z;
  tile.receiveShadow = true;
  scene.add(tile);
  roadTiles.push(tile);

  // === 연석(Curb) 추가 ===
  const curbWidth = 0.2;
  const curbHeight = 0.3;
  const curbColor = 0x888888;
  for (let side of [-1, 1]) {
    const curbGeo = new THREE.BoxGeometry(curbWidth, curbHeight, ROAD_TILE_LENGTH);
    const curbMat = new THREE.MeshStandardMaterial({ color: curbColor });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(side * (roadWidth/2 + curbWidth/2), curbHeight/2, z);
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);
    bgObjects.push(curb);
  }

  // === 잔디(Green Strip) 추가 ===
  const grassWidth = 1.2;
  const grassColor = 0x3cb043;
  for (let side of [-1, 1]) {
    const grassGeo = new THREE.PlaneGeometry(grassWidth, ROAD_TILE_LENGTH);
    const grassMat = new THREE.MeshStandardMaterial({ color: grassColor });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(side * (roadWidth/2 + curbWidth + grassWidth/2), 0.01, z);
    grass.receiveShadow = true;
    scene.add(grass);
    bgObjects.push(grass);
  }

  // === 도보(Sidewalk) 추가 ===
  const sidewalkWidth = 4.0;
  const sidewalkColor = 0xe0e0e0;
  for (let side of [-1, 1]) {
    const sidewalkGeo = new THREE.PlaneGeometry(sidewalkWidth, ROAD_TILE_LENGTH);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: sidewalkColor });
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth/2), 0.015, z);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);
    bgObjects.push(sidewalk);
  }

  // === 콘크리트 포장(Concrete) 추가 ===
  const concreteWidth = 8.0;
  const concreteColor = 0xb0b0b0;
  for (let side of [-1, 1]) {
    const concreteGeo = new THREE.PlaneGeometry(concreteWidth, ROAD_TILE_LENGTH);
    const concreteMat = new THREE.MeshStandardMaterial({ color: concreteColor });
    const concrete = new THREE.Mesh(concreteGeo, concreteMat);
    concrete.rotation.x = -Math.PI / 2;
    concrete.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + concreteWidth/2), 0.02, z);
    concrete.receiveShadow = true;
    scene.add(concrete);
    bgObjects.push(concrete);
  }

  // === 콘크리트 포장 바깥쪽 넓은 잔디(Grass Outer) 추가 ===
  const grassOuterWidth = 30;
  const grassOuterColor = 0x3cb043;
  for (let side of [-1, 1]) {
    const grassOuterGeo = new THREE.PlaneGeometry(grassOuterWidth, ROAD_TILE_LENGTH);
    const grassOuterMat = new THREE.MeshStandardMaterial({ color: grassOuterColor });
    const grassOuter = new THREE.Mesh(grassOuterGeo, grassOuterMat);
    grassOuter.rotation.x = -Math.PI / 2;
    grassOuter.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + concreteWidth + grassOuterWidth/2), 0, z);
    grassOuter.receiveShadow = true;
    scene.add(grassOuter);
    bgObjects.push(grassOuter);
  }

  // === 3차선 차선 라인 추가 ===
  const laneXs = [-2, 0, 2]; // 3차선 중심 x좌표
  const laneLength = 1.5; // 점선 길이
  const laneGap = 1.5;    // 점선 간격
  const laneCount = Math.floor(ROAD_TILE_LENGTH / (laneLength + laneGap));
  // 중앙선(노란 점선)
  for (let i = 0; i < laneCount; i++) {
    const lineGeo = new THREE.BoxGeometry(0.12, laneLength, 0.01);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    const zPos = -ROAD_TILE_LENGTH/2 + i * (laneLength + laneGap) + laneLength/2;
    line.position.set(0, zPos, 0.012);
    line.rotation.x = 0
    tile.add(line);
  }
  // 좌/우 차선(흰 점선)
  for (let lane of [-1, 1]) {
    for (let i = 0; i < laneCount; i++) {
      const lineGeo = new THREE.BoxGeometry(0.08, laneLength, 0.01);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeo, lineMat);
      const zPos = -ROAD_TILE_LENGTH/2 + i * (laneLength + laneGap) + laneLength/2;
      line.position.set(lane * 2, zPos, 0.012);
      line.rotation.x = 0;
      tile.add(line);
    }
  }

  // === 가로수(나무) 무한 생성 ===
  const treeInterval = 4; // 가로수 간격
  for (let dz = -ROAD_TILE_LENGTH/2; dz < ROAD_TILE_LENGTH/2; dz += treeInterval) {
    const zTree = z + dz;
    // 왼쪽
    const treeL = createTree(-roadWidth/2 - 1.5 - Math.random()*0.5, zTree + Math.random()*2-1);
    bgObjects.push(treeL);
    // 오른쪽
    const treeR = createTree(roadWidth/2 + 1.5 + Math.random()*0.5, zTree + Math.random()*2-1);
    bgObjects.push(treeR);
  }

  // === 행인(Pedestrian) 추가 ===
  const pedestrianCount = Math.floor(Math.random() * 3); // 0~2명
  for (let side of [-1, 1]) {
    for (let i = 0; i < pedestrianCount; i++) {
      // 도보 위 x좌표 범위 내 무작위 위치
      const pedX = side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth/2) + (Math.random() - 0.5) * (sidewalkWidth - 0.5);
      const pedZ = z + (Math.random() - 0.5) * (ROAD_TILE_LENGTH - 2);
      // 행인: 몸통(Cylinder) + 머리(Sphere)
      const pedGroup = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeecc });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.25;
      pedGroup.add(body);
      const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffe0b0 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.58;
      pedGroup.add(head);
      pedGroup.position.set(pedX, 0, pedZ);
      pedGroup.userData = { type: 'pedestrian', side, speed: 0.01 + Math.random() * 0.02 };
      scene.add(pedGroup);
      bgObjects.push(pedGroup);
    }
  }

  // === 건물(Building) 추가 ===
  // 도보 바깥쪽에 테마별 랜덤 건물 배치
  const theme = buildingThemes[currentThemeIdx % buildingThemes.length];
  const buildingCount = 2 + Math.floor(Math.random() * 2); // 좌/우 각 2~3개
  for (let side of [-1, 1]) {
    for (let i = 0; i < buildingCount; i++) {
      // 테마/타입 랜덤 선택
      const btype = theme.types[Math.floor(Math.random() * theme.types.length)];
      const color = btype.color[Math.floor(Math.random() * btype.color.length)];
      const h = btype.minH + Math.random() * (btype.maxH - btype.minH);
      const w = btype.minW + Math.random() * (btype.maxW - btype.minW);
      const d = btype.minD + Math.random() * (btype.maxD - btype.minD);
      const bx = side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + w/2 + 0.2);
      const bz = z + (Math.random() - 0.5) * (ROAD_TILE_LENGTH - 2);
      const buildingGeo = new THREE.BoxGeometry(w, h, d);
      const buildingMat = new THREE.MeshStandardMaterial({ color });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(bx, h/2, bz);
      building.castShadow = true;
      building.receiveShadow = true;
      building.userData = { type: 'building', theme: theme.name, btype: btype.type };
      scene.add(building);
      bgObjects.push(building);

      // === 건물 장식: 간판 ===
      if (["상가", "카페", "쇼핑몰", "시장상가", "호텔", "리조트", "약국"].includes(btype.type) && Math.random() < 0.8) {
        const signGeo = new THREE.BoxGeometry(w * 0.7, 0.18, 0.08);
        const shopName = getRandomShopName();
        const signTex = createSignTexture(shopName);
        const signMat = new THREE.MeshStandardMaterial({ map: signTex });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, h/2 + 0.13, d/2 + 0.06);
        sign.castShadow = false;
        sign.receiveShadow = false;
        building.add(sign);
      }
      // === 건물 장식: 옥상 구조물 ===
      if (["오피스", "아파트동", "공장", "병원", "학교"].includes(btype.type) && Math.random() < 0.5) {
        const roofGeo = new THREE.CylinderGeometry(0.12 + Math.random()*0.18, 0.12, 0.3 + Math.random()*0.3, 8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set((Math.random()-0.5)*w*0.6, h/2+0.22, (Math.random()-0.5)*d*0.6);
        roof.castShadow = true;
        roof.receiveShadow = false;
        building.add(roof);
      }
      // === 건물 장식: 정원/화단 ===
      if (["단독주택", "연립주택", "빌라", "맨션", "파빌리온", "학교"].includes(btype.type) && Math.random() < 0.7) {
        const yardGeo = new THREE.PlaneGeometry(w*0.8, 0.5 + Math.random()*0.7);
        const yardMat = new THREE.MeshStandardMaterial({ color: 0x3cb043 });
        const yard = new THREE.Mesh(yardGeo, yardMat);
        yard.rotation.x = -Math.PI/2;
        yard.position.set(0, -h/2+0.01, d/2 + 0.3);
        yard.receiveShadow = true;
        building.add(yard);
      }
      // === 건물 장식: 창문/문/발코니 ===
      // 창문(상업, 오피스, 아파트, 주택 등)
      if (["오피스", "상가", "아파트동", "단독주택", "연립주택", "빌라", "맨션", "호텔", "리조트", "학교", "쇼핑몰", "병원", "약국", "체육관"].includes(btype.type)) {
        let winRows = Math.floor(h/0.5);
        let winCols = Math.floor(w/0.5);
        // 아파트동/쇼핑몰/상가/호텔/리조트/병원/약국/학교/체육관 mesh 개수 제한
        if (["아파트동", "쇼핑몰", "상가", "호텔", "리조트", "병원", "약국", "학교", "체육관"].includes(btype.type)) {
          winRows = Math.min(winRows, btype.type === "아파트동" ? 6 : 5);
          winCols = Math.min(winCols, btype.type === "아파트동" ? 6 : 5);
        }
        for (let row = 0; row < winRows; row++) {
          for (let col = 0; col < winCols; col++) {
            // 아파트동 0.3, 쇼핑몰/상가/호텔/리조트/병원/약국/학교/체육관 0.4, 그 외 0.7
            let prob = 0.7;
            if (btype.type === "아파트동") prob = 0.3;
            else if (["쇼핑몰", "상가", "호텔", "리조트", "병원", "약국", "학교", "체육관"].includes(btype.type)) prob = 0.4;
            if (Math.random() < prob) {
              const wx = -w/2 + 0.3 + col * (w/(winCols+0.2));
              const wy = -h/2 + 0.4 + row * (h/(winRows+0.2));
              const wz = d/2 + 0.05;
              const winGeo = new THREE.BoxGeometry(0.22, 0.28, 0.02);
              const winMat = new THREE.MeshStandardMaterial({ color: 0x99ccff, emissive: 0x222244, transparent: true, opacity: 0.85 });
              const win = new THREE.Mesh(winGeo, winMat);
              win.position.set(wx, wy, wz);
              building.add(win);
            }
          }
        }
      }
      // 문(주택, 아파트, 빌라, 쇼핑몰, 상가, 호텔, 리조트, 병원, 약국, 학교, 체육관 등)
      if (["단독주택", "연립주택", "빌라", "맨션", "아파트동", "호텔", "리조트", "쇼핑몰", "상가", "병원", "약국", "학교", "체육관"].includes(btype.type) && Math.random() < 0.8) {
        // 아파트동/쇼핑몰/상가/호텔/리조트/병원/약국/학교/체육관 문 1개만 생성
        if (["아파트동", "쇼핑몰", "상가", "호텔", "리조트", "병원", "약국", "학교", "체육관"].includes(btype.type)) {
          if (!building.userData.hasDoor) {
            const doorGeo = new THREE.BoxGeometry(0.32, 0.5, 0.06);
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x8d5524 });
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(0, -h/2+0.25, d/2 + 0.031);
            building.add(door);
            building.userData.hasDoor = true;
          }
        } else {
          const doorGeo = new THREE.BoxGeometry(0.32, 0.5, 0.06);
          const doorMat = new THREE.MeshStandardMaterial({ color: 0x8d5524 });
          const door = new THREE.Mesh(doorGeo, doorMat);
          door.position.set(0, -h/2+0.25, d/2 + 0.031);
          building.add(door);
        }
      }
      // 발코니(아파트, 빌라, 맨션, 쇼핑몰, 상가, 호텔, 리조트, 병원, 약국, 학교, 체육관 등)
      if (["아파트동", "빌라", "맨션", "호텔", "리조트", "쇼핑몰", "상가", "병원", "약국", "학교", "체육관"].includes(btype.type) && Math.random() < 0.5) {
        // 아파트동/쇼핑몰/상가/호텔/리조트/병원/약국/학교/체육관 발코니 2개 이하로 제한
        if (["아파트동", "쇼핑몰", "상가", "호텔", "리조트", "병원", "약국", "학교", "체육관"].includes(btype.type)) {
          if (!building.userData.balconyCount) building.userData.balconyCount = 0;
          if (building.userData.balconyCount < 2) {
            const balGeo = new THREE.BoxGeometry(w*0.5, 0.12, 0.18);
            const balMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const bal = new THREE.Mesh(balGeo, balMat);
            bal.position.set(0, 0, d/2 + 0.09);
            building.add(bal);
            building.userData.balconyCount++;
          }
        } else {
          const balGeo = new THREE.BoxGeometry(w*0.5, 0.12, 0.18);
          const balMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
          const bal = new THREE.Mesh(balGeo, balMat);
          bal.position.set(0, 0, d/2 + 0.09);
          building.add(bal);
        }
      }
    }
  }
  // === 지역별 특수 오브젝트 다양화 ===
  if (theme.name === '공원/녹지') {
    // 벤치
    if (Math.random() < 0.5) {
      for (let side of [-1, 1]) {
        const benchGeo = new THREE.BoxGeometry(0.7, 0.12, 0.22);
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x8d5524 });
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + concreteWidth + 2.5), 0.08, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        bench.castShadow = true;
        scene.add(bench);
        bgObjects.push(bench);
      }
    }
    // 분수
    if (Math.random() < 0.3) {
      const fountainGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.18, 16);
      const fountainMat = new THREE.MeshStandardMaterial({ color: 0x90caf9 });
      const fountain = new THREE.Mesh(fountainGeo, fountainMat);
      fountain.position.set(0, 0.09, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(fountain);
      bgObjects.push(fountain);
    }
    // 조형물
    if (Math.random() < 0.2) {
      const artGeo = new THREE.TorusKnotGeometry(0.18, 0.07, 32, 8);
      const artMat = new THREE.MeshStandardMaterial({ color: 0xff7043 });
      const art = new THREE.Mesh(artGeo, artMat);
      art.position.set((Math.random()-0.5)*8, 0.3, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(art);
      bgObjects.push(art);
    }
    // 꽃밭
    if (Math.random() < 0.3) {
      for (let i = 0; i < 6; i++) {
        const flowerGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffe082 + Math.floor(Math.random()*0x1000) });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set((Math.random()-0.5)*10, 0.04, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        scene.add(flower);
        bgObjects.push(flower);
      }
    }
    // 나무(공원용)
    if (Math.random() < 0.4) {
      for (let i = 0; i < 2; i++) {
        const tree = createTree((Math.random()-0.5)*10, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        bgObjects.push(tree);
      }
    }
  }
  if (theme.name === '공사장/재개발') {
    // 크레인
    if (Math.random() < 0.5) {
      for (let side of [-1, 1]) {
        const craneGeo = new THREE.BoxGeometry(0.18, 2.2, 0.18);
        const craneMat = new THREE.MeshStandardMaterial({ color: 0xf7b801 });
        const crane = new THREE.Mesh(craneGeo, craneMat);
        crane.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + concreteWidth + 3.5), 1.1, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        crane.castShadow = true;
        scene.add(crane);
        bgObjects.push(crane);
      }
    }
    // 자재 더미
    if (Math.random() < 0.4) {
      for (let i = 0; i < 3; i++) {
        const pileGeo = new THREE.BoxGeometry(0.5+Math.random()*0.5, 0.18+Math.random()*0.2, 0.5+Math.random()*0.5);
        const pileMat = new THREE.MeshStandardMaterial({ color: 0x8d5524 });
        const pile = new THREE.Mesh(pileGeo, pileMat);
        pile.position.set((Math.random()-0.5)*10, 0.1, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        scene.add(pile);
        bgObjects.push(pile);
      }
    }
    // 트럭
    if (Math.random() < 0.2) {
      const truckGeo = new THREE.BoxGeometry(1.2, 0.4, 0.5);
      const truckMat = new THREE.MeshStandardMaterial({ color: 0x1976d2 });
      const truck = new THREE.Mesh(truckGeo, truckMat);
      truck.position.set((Math.random()-0.5)*10, 0.2, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(truck);
      bgObjects.push(truck);
    }
    // 안전펜스
    if (Math.random() < 0.3) {
      for (let i = 0; i < 4; i++) {
        const fenceGeo = new THREE.BoxGeometry(0.7, 0.18, 0.06);
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0xffe082 });
        const fence = new THREE.Mesh(fenceGeo, fenceMat);
        fence.position.set((Math.random()-0.5)*10, 0.09, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        scene.add(fence);
        bgObjects.push(fence);
      }
    }
  }
  if (theme.name === '항구/해안가') {
    // 컨테이너
    if (Math.random() < 0.5) {
      for (let side of [-1, 1]) {
        const contGeo = new THREE.BoxGeometry(1.2, 0.7, 2.2);
        const contMat = new THREE.MeshStandardMaterial({ color: 0x1976d2 });
        const cont = new THREE.Mesh(contGeo, contMat);
        cont.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + concreteWidth + 4.5), 0.36, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        cont.castShadow = true;
        scene.add(cont);
        bgObjects.push(cont);
      }
    }
    // 배
    if (Math.random() < 0.3) {
      const boatGeo = new THREE.CylinderGeometry(0.5, 0.8, 2.2, 8, 1, true);
      const boatMat = new THREE.MeshStandardMaterial({ color: 0x8ecae6 });
      const boat = new THREE.Mesh(boatGeo, boatMat);
      boat.position.set((Math.random()-0.5)*12, 0.36, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      boat.rotation.z = Math.PI/2;
      scene.add(boat);
      bgObjects.push(boat);
    }
    // 부두
    if (Math.random() < 0.2) {
      const pierGeo = new THREE.BoxGeometry(2.5, 0.18, 0.5);
      const pierMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
      const pier = new THREE.Mesh(pierGeo, pierMat);
      pier.position.set((Math.random()-0.5)*12, 0.09, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(pier);
      bgObjects.push(pier);
    }
    // 표지판
    if (Math.random() < 0.2) {
      const signGeo = new THREE.BoxGeometry(0.4, 0.3, 0.05);
      const signMat = new THREE.MeshStandardMaterial({ color: 0xffe082 });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set((Math.random()-0.5)*12, 0.15, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(sign);
      bgObjects.push(sign);
    }
  }
  if (theme.name === '테마파크') {
    // 풍선(구)
    if (Math.random() < 0.5) {
      for (let side of [-1, 1]) {
        const balloonGeo = new THREE.SphereGeometry(0.22, 8, 8);
        const balloonMat = new THREE.MeshStandardMaterial({ color: 0xff1744 });
        const balloon = new THREE.Mesh(balloonGeo, balloonMat);
        balloon.position.set(side * (roadWidth/2 + curbWidth + grassWidth + sidewalkWidth + concreteWidth + 2.5), 1.2, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        balloon.castShadow = false;
        scene.add(balloon);
        bgObjects.push(balloon);
      }
    }
    // 회전목마
    if (Math.random() < 0.3) {
      const carouselGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.18, 16);
      const carouselMat = new THREE.MeshStandardMaterial({ color: 0xffe082 });
      const carousel = new THREE.Mesh(carouselGeo, carouselMat);
      carousel.position.set((Math.random()-0.5)*10, 0.09, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(carousel);
      bgObjects.push(carousel);
    }
    // 관람차
    if (Math.random() < 0.2) {
      const wheelGeo = new THREE.TorusGeometry(0.7, 0.08, 8, 24);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1976d2 });
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set((Math.random()-0.5)*10, 1.2, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
      scene.add(wheel);
      bgObjects.push(wheel);
    }
    // 조명
    if (Math.random() < 0.3) {
      for (let i = 0; i < 3; i++) {
        const lampGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffcc });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set((Math.random()-0.5)*10, 0.35, z + (Math.random()-0.5)*ROAD_TILE_LENGTH*0.7);
        scene.add(lamp);
        bgObjects.push(lamp);
      }
    }
  }
  // === 지역 테마 전환 ===
  roadTileCount = (roadTileCount || 0) + 1;
  if (roadTileCount % 10 === 0) {
    currentThemeIdx = (currentThemeIdx + 1) % buildingThemes.length;
  }
}
// 최초 도로 타일 여러 개 생성
for (let i = -1; i <= 2; i++) {
  spawnRoadTile(car.position.z + i * ROAD_TILE_LENGTH);
}
lastRoadTileZ = car.position.z + 2 * ROAD_TILE_LENGTH;

// === 키보드 입력 처리 ===
const keyState = { left: false, right: false, up: false, down: false };
window.addEventListener('keydown', (e) => {
  if (isGameOver && (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space')) {
    window.location.reload();
  }
  if (isGameOver) return; // 게임 종료 시 입력 무시
  if (e.code === 'ArrowLeft') keyState.left = true;
  if (e.code === 'ArrowRight') keyState.right = true;
  if (e.code === 'ArrowUp') keyState.up = true;
  if (e.code === 'ArrowDown') keyState.down = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft') keyState.left = false;
  if (e.code === 'ArrowRight') keyState.right = false;
  if (e.code === 'ArrowUp') keyState.up = false;
  if (e.code === 'ArrowDown') keyState.down = false;
});

// === 자동차 진행(z) ===
let carProgressZ = car.position.z; // 자동차의 실제 진행(z)

// === 게임 로직 함수 (테스트와 공유) ===
function moveCar(carObj, dir) {
  // dir: -1(왼쪽), 1(오른쪽)
  const moveStep = 0.3;
  const minX = -roadWidth / 2 + 0.5;
  const maxX = roadWidth / 2 - 0.5;
  carObj.position.x += dir * moveStep;
  if (carObj.position.x < minX) carObj.position.x = minX;
  if (carObj.position.x > maxX) carObj.position.x = maxX;
}
window.moveCar = moveCar;
function accelerateCar(carObj, accel, maxSpeed) {
  carObj.speed = (carObj.speed || 0) + accel;
  if (carObj.speed > maxSpeed) carObj.speed = maxSpeed;
}
window.accelerateCar = accelerateCar;
function decelerateCar(carObj, decel) {
  carObj.speed = (carObj.speed || 0) - decel;
  if (carObj.speed < 0) carObj.speed = 0;
}
window.decelerateCar = decelerateCar;
function checkCollision(objA, objB, sizeA, sizeB) {
  const dx = objA.position.x - objB.position.x;
  const dz = objA.position.z - objB.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  return dist < (sizeA / 2 + sizeB / 2);
}
window.checkCollision = checkCollision;
function isCarOnRoad(carObj, roadWidth) {
  return Math.abs(carObj.position.x) <= (roadWidth / 2 - 0.5);
}
window.isCarOnRoad = isCarOnRoad;
function calcScore(carObj, startZ) {
  return Math.max(0, Math.round(carObj.position.z - startZ + 0.0001));
}
window.calcScore = calcScore;
function decreaseTimer(timer, dt) {
  return Math.max(0, timer - dt);
}
window.decreaseTimer = decreaseTimer;

// === 블룸(Glow) 효과 postprocessing ===
let composer;
let bloomPass;
function setupPostprocessing() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.12,
    0.25,
    0.1
  );
  composer.addPass(bloomPass);
}
setupPostprocessing();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// === HUD/오버레이/재시작 버튼 ===
const restartBtn = document.createElement('button');
restartBtn.textContent = 'RESTART';
restartBtn.style.position = 'absolute';
restartBtn.style.top = '60%';
restartBtn.style.left = '50%';
restartBtn.style.transform = 'translate(-50%, -50%)';
restartBtn.style.fontSize = '2rem';
restartBtn.style.padding = '16px 48px';
restartBtn.style.borderRadius = '12px';
restartBtn.style.border = 'none';
restartBtn.style.background = '#00bfff';
restartBtn.style.color = '#fff';
restartBtn.style.cursor = 'pointer';
restartBtn.style.display = 'none';
restartBtn.style.zIndex = '30';
document.getElementById('game-container').appendChild(restartBtn);
restartBtn.onclick = () => window.location.reload();

// === HUD 근접 메시지 표시용 엘리먼트 추가 ===
const hudMsgEl = document.createElement('div');
hudMsgEl.id = 'hud-msg';
hudMsgEl.style.position = 'absolute';
hudMsgEl.style.top = '12%';
hudMsgEl.style.left = '50%';
hudMsgEl.style.transform = 'translate(-50%, 0)';
hudMsgEl.style.fontSize = '2.2rem';
hudMsgEl.style.fontWeight = 'bold';
hudMsgEl.style.color = '#ff1744';
hudMsgEl.style.textShadow = '0 2px 8px #fff, 0 0 8px #fff';
hudMsgEl.style.opacity = '0';
hudMsgEl.style.zIndex = '40';
document.getElementById('game-container').appendChild(hudMsgEl);

// HUD 값이 변할 때 애니메이션 효과
function flashHud(id) {
  const el = document.getElementById(id);
  el.classList.remove('flash');
  void el.offsetWidth; // reflow
  el.classList.add('flash');
}

// === 메인 게임 루프 ===
let lastScore = 0, lastSpeed = 0, lastTimer = 60;
const Z_RESET_THRESHOLD = 10000;
function maybeResetWorld() {
  if (car.position.z > Z_RESET_THRESHOLD) {
    const dz = Z_RESET_THRESHOLD;
    car.position.z -= dz;
    carProgressZ -= dz;
    lastGeneratedZ -= dz;
    lastRoadTileZ -= dz;
    obstacles.forEach(obj => obj.position.z -= dz);
    bgObjects.forEach(obj => obj.position.z -= dz);
    roadTiles.forEach(tile => tile.position.z -= dz);
  }
}
function animate() {
  // 자동차/파편 충돌 애니메이션은 게임 오버 후에도 계속
  if (!isGameOver || crashAnimActive) {
    // 자동차 물리 효과(충돌 후)
    for (const carObj of crashedCars) {
      if (carObj.userData.crashVelocity) {
        carObj.position.add(carObj.userData.crashVelocity);
        carObj.userData.crashVelocity.add(carObj.userData.crashGravity);
        carObj.rotation.x += carObj.userData.crashAngular.x;
        carObj.rotation.y += carObj.userData.crashAngular.y;
        carObj.rotation.z += carObj.userData.crashAngular.z;
        // 바닥에 닿으면 튕김/감쇠
        if (carObj.position.y < 0) {
          carObj.position.y = 0;
          carObj.userData.crashVelocity.y *= -carObj.userData.crashRestitution;
          carObj.userData.crashVelocity.x *= 0.7;
          carObj.userData.crashVelocity.z *= 0.7;
          carObj.userData.crashAngular.x *= 0.7;
          carObj.userData.crashAngular.y *= 0.7;
          carObj.userData.crashAngular.z *= 0.7;
          if (Math.abs(carObj.userData.crashVelocity.y) < 0.08) carObj.userData.crashVelocity.y = 0;
        }
      }
    }
    // 파편 애니메이션
    for (let i = debrisList.length-1; i >= 0; i--) {
      const d = debrisList[i];
      d.mesh.position.add(d.mesh.velocity);
      d.mesh.velocity.y -= 0.045;
      d.mesh.rotation.x += d.mesh.angularVelocity.x * 0.04;
      d.mesh.rotation.y += d.mesh.angularVelocity.y * 0.04;
      d.mesh.rotation.z += d.mesh.angularVelocity.z * 0.04;
      d.life -= 1/60;
      if (d.mesh.position.y < 0) {
        d.mesh.position.y = 0;
        d.mesh.velocity.y *= -0.45;
        d.mesh.velocity.x *= 0.7;
        d.mesh.velocity.z *= 0.7;
        d.mesh.angularVelocity.x *= 0.7;
        d.mesh.angularVelocity.y *= 0.7;
        d.mesh.angularVelocity.z *= 0.7;
        if (Math.abs(d.mesh.velocity.y) < 0.08) d.mesh.velocity.y = 0;
      }
      if (d.life < 0.1) {
        scene.remove(d.mesh);
        debrisList.splice(i, 1);
      }
    }
    if (crashAnimActive) {
      crashAnimTimer += 1/30;
      if (crashAnimTimer > 2.2) {
        crashAnimActive = false;
        document.getElementById('game-over').style.display = 'block';
        restartBtn.style.display = 'block';
      }
    }
  }
  if (isGameOver && !crashAnimActive) return;

  // 자동차 좌우 이동/조작 (좌우 반전)
  if (keyState.left) moveCar(car, 1);
  if (keyState.right) moveCar(car, -1);

  // 위/아래 방향키로 속도 조절
  if (keyState.up) accelerateCar(car, ACCEL * 2, MAX_SPEED);
  if (keyState.down) decelerateCar(car, ACCEL * 2);

  // 최초 자동 가속(시작 후 1회만)
  if (car.speed === 0) accelerateCar(car, ACCEL, MAX_SPEED);
  carProgressZ += car.speed;
  car.position.z = carProgressZ;

  // 카메라가 자동차를 따라가도록 위치/시점 갱신
  const camOffset = { x: 0, y: 6, z: -12 };
  camera.position.set(
    car.position.x + camOffset.x,
    car.position.y + camOffset.y,
    carProgressZ + camOffset.z
  );
  camera.lookAt(car.position.x, car.position.y, carProgressZ + 4);

  // 헤드라이트 위치/방향 동기화
  headlight.position.set(car.position.x, car.position.y + 0.2, car.position.z + 1.2);
  headlight.target.position.set(car.position.x, car.position.y, car.position.z + 5);

  maybeResetWorld();

  // === 무한 도로 확장 ===
  while (car.position.z + ROAD_TILE_LENGTH + PRELOAD_DIST > lastRoadTileZ) {
    lastRoadTileZ += ROAD_TILE_LENGTH;
    spawnRoadTile(lastRoadTileZ);
  }
  // 너무 멀리 뒤에 있는 도로 타일 제거
  while (roadTiles.length && roadTiles[0].position.z < car.position.z - CLEANUP_DIST - ROAD_TILE_LENGTH) {
    scene.remove(roadTiles[0]);
    roadTiles.shift();
  }

  // === 무한 맵 확장 ===
  // 항상 MAX_AI_CARS 이하로 유지하며, 부족하면 새로 추가
  while (aiCars.length < MAX_AI_CARS) {
    let z;
    let tryCount = 0;
    do {
      const offset = 20 + Math.random() * (PRELOAD_DIST - 20);
      const ahead = Math.random() < 0.5;
      z = carProgressZ + (ahead ? offset : -offset);
      tryCount++;
    } while (
      aiCars.some(ai => Math.abs(ai.group.position.z - z) < 10) && tryCount < 10
    );
    spawnAICar(z);
  }
  // AI 자동차 이동 및 너무 멀리 벗어난 AI 자동차 제거
  for (let i = aiCars.length - 1; i >= 0; i--) {
    const ai = aiCars[i];
    ai.group.position.z += ai.speed;
    // 플레이어 기준 ±PRELOAD_DIST 이상 벗어나면 삭제
    if (Math.abs(ai.group.position.z - carProgressZ) > PRELOAD_DIST) {
      scene.remove(ai.group);
      aiCars.splice(i, 1);
    }
  }

  // 자동차 간 충돌 판정 (AABB, 차선 우선)
  function checkCarCollision(carA, carB) {
    // 차선이 다르면 충돌 없음 (x좌표가 충분히 다르면)
    if (Math.abs(carA.position.x - carB.position.x) > 0.6) return false;
    // 앞뒤로 충분히 떨어져 있으면 충돌 없음
    if (Math.abs(carA.position.z - carB.position.z) > 1.2) return false;
    // 실제 박스 충돌 (AABB)
    const halfW = 0.5, halfL = 1.0;
    return (
      Math.abs(carA.position.x - carB.position.x) < halfW * 2 &&
      Math.abs(carA.position.z - carB.position.z) < halfL * 2
    );
  }
  // 충돌 검사 부분 교체
  for (const ai of aiCars) {
    if (checkCarCollision(car, ai.group)) {
      // 충돌 효과: 파편, 찌그러짐, 물리효과
      spawnDebris(car.position, 18 + Math.floor(Math.random()*8));
      deformCar(car);
      deformCar(ai.group);
      setCrashPhysics(car, new THREE.Vector3((Math.random()-0.5)*0.7, 0.7+Math.random()*0.7, -0.7), new THREE.Vector3(Math.random()*0.1, Math.random()*0.2, Math.random()*0.2));
      setCrashPhysics(ai.group, new THREE.Vector3((Math.random()-0.5)*1.2, 0.7+Math.random()*0.7, 0.7), new THREE.Vector3(Math.random()*0.1, Math.random()*0.2, Math.random()*0.2));
      crashedCars = [car, ai.group];
      crashAnimActive = true;
      crashAnimTimer = 0;
      isGameOver = true;
      // 기존 endGame('game-over') 호출 제거
      break;
    }
  }
  // 도로 이탈 검사
  if (!isCarOnRoad(car, roadWidth)) {
    endGame('game-over');
    return;
  }
  // 타이머 증가 (endless)
  timer += 1/60;

  // 행인 이동 (도보 위에서만 z축 방향으로 걷기)
  for (let i = bgObjects.length - 1; i >= 0; i--) {
    const obj = bgObjects[i];
    if (obj.userData && obj.userData.type === 'pedestrian') {
      obj.position.z += obj.userData.speed * obj.userData.side; // 좌/우 도보별로 반대 방향 걷기
      // 도보 범위 벗어나면 약간 위치 재조정
      if (Math.abs(obj.position.z - car.position.z) > ROAD_TILE_LENGTH/2) {
        obj.position.z = car.position.z - obj.userData.side * ROAD_TILE_LENGTH/2;
      }
      // 행인 점프 애니메이션
      obj.position.y = 0.05 + 0.05 * Math.abs(Math.sin(performance.now()/350 + obj.position.x));
      // 일정 거리 벗어난 행인 제거
      if (Math.abs(obj.position.z - car.position.z) > CLEANUP_DIST + ROAD_TILE_LENGTH) {
        scene.remove(obj);
        bgObjects.splice(i, 1);
        continue;
      }
    }
    // 풍선(테마파크) 애니메이션: 위아래 흔들림
    if (obj.geometry && obj.geometry.type === 'SphereGeometry' && obj.material && obj.material.color && obj.material.color.getHex() === 0xff1744) {
      obj.position.y = 1.2 + 0.2 * Math.sin(performance.now()/400 + obj.position.x);
    }
    // 관람차(테마파크) 애니메이션: 회전
    if (obj.geometry && obj.geometry.type === 'TorusGeometry') {
      obj.rotation.z += 0.01;
    }
    // 회전목마(테마파크) 애니메이션: 회전
    if (obj.geometry && obj.geometry.type === 'CylinderGeometry' && obj.material && obj.material.color && obj.material.color.getHex() === 0xffe082) {
      obj.rotation.y += 0.01;
    }
    // AI 자동차(박스+바퀴) 애니메이션: 바퀴 회전(간단히 전체 흔들림)
    if (obj.userData && obj.userData.type === 'aiCar') {
      obj.rotation.z = 0.03 * Math.sin(performance.now()/200 + obj.position.z);
    }
  }

  // === 플레이어 근접 상호작용(Highlight & HUD 메시지) ===
  /*
  let hudMsg = '';
  for (const obj of bgObjects) {
    // 행인
    if (obj.userData && obj.userData.type === 'pedestrian') {
      const dist = car.position.distanceTo(obj.position);
      if (dist < 2.5) {
        obj.children.forEach(child => child.material && (child.material.color.set(0xff5555)));
        hudMsg = '행인 근접!';
      } else {
        obj.children[0].material.color.set(0xeeeecc);
        obj.children[1].material.color.set(0xffe0b0);
      }
    }
    // 건물
    if (obj.userData && obj.userData.type === 'building') {
      const dist = car.position.distanceTo(obj.position);
      if (dist < 2.5) {
        obj.material.color.set(0xffe082);
        hudMsg = obj.userData.theme + ' ' + obj.userData.btype + ' 근접!';
      } else {
        obj.material.color.set(obj.material.color.getHex()); // 원래 색상 유지
      }
    }
    // 특수 오브젝트(벤치, 분수, 조형물, 컨테이너, 배, 회전목마, 관람차 등)
    if (obj.geometry && (
      obj.geometry.type === 'BoxGeometry' ||
      obj.geometry.type === 'CylinderGeometry' ||
      obj.geometry.type === 'TorusKnotGeometry' ||
      obj.geometry.type === 'TorusGeometry' ||
      obj.geometry.type === 'SphereGeometry') &&
      !obj.userData) {
      const dist = car.position.distanceTo(obj.position);
      if (dist < 2.5) {
        if (obj.material && obj.material.color) obj.material.color.set(0x00e676);
        hudMsg = '특수 오브젝트 근접!';
      }
    }
  }
  // HUD 메시지 표시
  const hudMsgEl = document.getElementById('hud-msg');
  if (hudMsgEl) {
    hudMsgEl.textContent = hudMsg;
    hudMsgEl.style.opacity = hudMsg ? '1' : '0';
  }
  */

  // HUD 갱신 및 애니메이션
  const score = calcScore(car, startZ);
  const speed = car.speed;
  const t = timer;
  if (score !== lastScore) flashHud('score');
  if (Math.abs(speed - lastSpeed) > 0.01) flashHud('speed');
  if (Math.floor(t) !== Math.floor(lastTimer)) flashHud('timer');
  lastScore = score;
  lastSpeed = speed;
  lastTimer = t;
  document.getElementById('speed').textContent = `속도: ${(speed*142).toFixed(0)}`;
  document.getElementById('timer').textContent = `시간: ${timer.toFixed(1)}`;
  document.getElementById('score').textContent = `점수: ${score}`;
  // === 현재 테마 표시 ===
  let themeIdx = Math.floor(car.position.z / (ROAD_TILE_LENGTH * 10) + 0.3);
  const themeObj = buildingThemes[themeIdx % buildingThemes.length];
  document.getElementById('theme').textContent = `테마: ${themeObj ? themeObj.name : '-'}`;

  composer.render();
  requestAnimationFrame(animate);
}

// 게임 종료/클리어 처리 (상태 일원화)
function endGame(type) {
  isGameOver = true;
  car.speed = 0;
  if (type === 'game-over') {
    document.getElementById('game-over').style.display = 'block';
  }
  restartBtn.style.display = 'block';
}

// === 게임 시작 ===
// (배경 텍스처 로드 콜백에서 시작)

// === 장애물/배경 오브젝트 ===
const obstacles = [];
const MAX_AI_CARS = 24;
const aiCars = [];
function spawnAICar(z) {
  // 4차선 중 하나에 x좌표 스냅
  const laneXs = [-3, -1, 1, 3];
  const x = laneXs[Math.floor(Math.random() * laneXs.length)];
  // 플레이어와 충분히 다른 H값 생성
  let aiH;
  do {
    aiH = Math.random();
  } while (Math.abs(aiH - playerHSV.h) < 1/12 || Math.abs(aiH - playerHSV.h) > 1-1/12);
  // S/V는 플레이어와 동일
  const aiCar = createCarModel(aiH, playerHSV.s, playerHSV.v);
  aiCar.position.x = x;
  aiCar.position.y = 0;
  aiCar.position.z = z;
  aiCar.castShadow = true;
  aiCar.receiveShadow = false;
  scene.add(aiCar);
  // AI 자동차 속도: 플레이어보다 느리거나 빠름 (상한 제한)
  let aiSpeed;
  const ahead = z > carProgressZ;
  if (ahead) {
    aiSpeed = 0.3 + Math.random() * (MAX_SPEED + 0.1 - 0.3);
  } else {
    aiSpeed = 0.3 + Math.random() * Math.max(0.01, Math.min(MAX_SPEED, car.speed + 0.05) - 0.3);
  }
  aiCars.push({ group: aiCar, speed: aiSpeed });
}
function spawnBackground(z) {
  // 나무
  const treeL = createTree(-roadWidth/2 - 1.2 - Math.random(), z + Math.random() * 2 - 1);
  const treeR = createTree(roadWidth/2 + 1.2 + Math.random(), z + Math.random() * 2 - 1);
  bgObjects.push(treeL, treeR);
  // 표지판(간헐적)
  if (Math.floor(z) % 20 === 0) {
    const signL = createSign(-roadWidth/2 - 2, z);
    const signR = createSign(roadWidth/2 + 2, z);
    bgObjects.push(signL, signR);
  }
}
// 기존 createTree, createSign이 반환값 없이 scene에만 추가하므로, 반환하도록 수정
function createTree(x, z) {
  const tree = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8d5524 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = false;
  tree.add(trunk);
  const leafGeo = new THREE.SphereGeometry(0.5, 8, 8);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.y = 1.2;
  leaf.castShadow = true;
  leaf.receiveShadow = false;
  tree.add(leaf);
  tree.position.set(x, 0, z);
  scene.add(tree);
  return tree;
}
function createSign(x, z) {
  const sign = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 0.35;
  pole.castShadow = true;
  pole.receiveShadow = false;
  sign.add(pole);
  const boardGeo = new THREE.BoxGeometry(0.5, 0.3, 0.05);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xffe066 });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.y = 0.7;
  board.castShadow = true;
  board.receiveShadow = false;
  sign.add(board);
  sign.position.set(x, 0, z);
  scene.add(sign);
  return sign;
}
// 최초 맵 생성 시에도 spawnAICar(z)로 z위치 지정
for (let i = 0; i < 10; i++) {
  const offset = 20 + Math.random() * (PRELOAD_DIST - 20);
  const ahead = Math.random() < 0.5;
  const z = carProgressZ + (ahead ? offset : -offset);
  spawnAICar(z);
}
lastGeneratedZ = car.position.z + 10 + 19 * OBSTACLE_INTERVAL;

// === 랜덤 상호명 생성 함수 ===
function getRandomShopName() {
  const kor = ["한빛", "삼성", "현대", "우리", "행복", "미래", "청춘", "강남", "서울", "한강", "해피", "드림", "스마일", "프렌즈", "스타"];
  const eng = ["Shop", "Mart", "Store", "Cafe", "Bar", "Bakery", "Market", "Food", "House", "Plaza", "World", "Point", "Zone", "Plus", "Express"];
  const num = Math.random() < 0.3 ? (Math.floor(Math.random()*90)+10).toString() : "";
  return kor[Math.floor(Math.random()*kor.length)] + (Math.random()<0.5?" ":"") + (Math.random()<0.7?eng[Math.floor(Math.random()*eng.length)]:"") + num;
}
// === CanvasTexture로 텍스트 머티리얼 생성 ===
function createSignTexture(text, w=256, h=64) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff8c0';
  ctx.fillRect(0,0,w,h);
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w/2, h/2);
  return new THREE.CanvasTexture(canvas);
}

// === 마우스/터치 드래그 입력 ===
let dragActive = false;
let dragStartX = 0, dragStartY = 0, carStartX = 0, carStartSpeed = 0;

function getWorldXY(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((clientY - rect.top) / rect.height) * 2 - 1;
  const worldX = x * (roadWidth/2 + 2);
  const worldY = y;
  return { worldX, worldY };
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  if (isGameOver) return;
  e.preventDefault(); // 모바일에서 pointermove 정상 동작
  dragActive = true;
  renderer.domElement.setPointerCapture(e.pointerId); // pointer capture
  const { worldX, worldY } = getWorldXY(e.clientX, e.clientY);
  dragStartX = worldX;
  dragStartY = worldY;
  carStartX = car.position.x;
  carStartSpeed = car.speed;
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!dragActive || isGameOver) return;
  e.preventDefault(); // 모바일에서 스크롤 방지 및 move 정상 동작
  const { worldX, worldY } = getWorldXY(e.clientX, e.clientY);
  // 좌우 드래그: 자동차 x좌표 연속 이동 (민감도 1.0, 좌우 반전)
  let dx = -(worldX - dragStartX);
  car.position.x = carStartX + dx;
  // 도로 경계 제한
  const minX = -roadWidth / 2 + 0.5;
  const maxX = roadWidth / 2 - 0.5;
  if (car.position.x < minX) car.position.x = minX;
  if (car.position.x > maxX) car.position.x = maxX;
  // 상하 드래그: 속도 연속 조정 (민감도 1.5)
  let dy = dragStartY - worldY;
  car.speed = Math.max(0, Math.min(MAX_SPEED, carStartSpeed + dy * 1.5));
});
renderer.domElement.addEventListener('pointerup', (e) => {
  dragActive = false;
  renderer.domElement.releasePointerCapture(e.pointerId);
});
renderer.domElement.addEventListener('pointerleave', (e) => {
  dragActive = false;
});

// === 파편/물리 효과용 ===
const debrisList = [];
let crashAnimActive = false;
let crashAnimTimer = 0;
let crashedCars = [];

// 충돌 시 파편 생성 함수
function spawnDebris(pos, count = 16) {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.BoxGeometry(0.08 + Math.random()*0.08, 0.04 + Math.random()*0.06, 0.12 + Math.random()*0.08);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888 + Math.floor(Math.random()*0x4444), metalness: 0.7, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.velocity = new THREE.Vector3(
      (Math.random()-0.5)*2.5,
      0.7 + Math.random()*1.2,
      (Math.random()-0.5)*2.5
    );
    mesh.angularVelocity = new THREE.Vector3(
      (Math.random()-0.5)*6,
      (Math.random()-0.5)*6,
      (Math.random()-0.5)*6
    );
    debrisList.push({ mesh, life: 1.2 + Math.random()*0.7 });
    scene.add(mesh);
  }
}

// 자동차 찌그러짐(부품 랜덤 변형)
function deformCar(carGroup) {
  carGroup.children.forEach((child, idx) => {
    if (Math.random() < 0.5) {
      child.position.x += (Math.random()-0.5)*0.18;
      child.position.y += (Math.random()-0.5)*0.12;
      child.position.z += (Math.random()-0.5)*0.18;
      child.rotation.x += (Math.random()-0.5)*0.3;
      child.rotation.y += (Math.random()-0.5)*0.3;
      child.rotation.z += (Math.random()-0.5)*0.3;
      child.scale.x *= 0.9 + Math.random()*0.2;
      child.scale.y *= 0.9 + Math.random()*0.2;
      child.scale.z *= 0.9 + Math.random()*0.2;
    }
  });
}

// 자동차에 물리 속성 부여
function setCrashPhysics(carGroup, v, av) {
  carGroup.userData.crashVelocity = v.clone();
  carGroup.userData.crashAngular = av.clone();
  carGroup.userData.crashGravity = new THREE.Vector3(0, -0.045, 0);
  carGroup.userData.crashRestitution = 0.45 + Math.random()*0.15;
}