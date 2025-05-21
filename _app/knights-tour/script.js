---
permalink: /app/knights-tour/script.js
visible: false
---
class KnightTour3D {
    constructor() {
        // 기본 색상 시스템 정의
        this.colors = {
            // 기본 색상 팔레트
            primary: {
                base: 0x9A9A9A,
                light: 0xBCBCBC,
                dark: 0x727272
            },
            secondary: {
                base: 0x444444,
                light: 0x666666,
                dark: 0x222222
            },
            accent: {
                base: 0x4CAF50,
                light: 0x81D4FA,
                dark: 0x2E7D32
            },
            // 테마별 배경색
            background: {
                light: 0xf0f0f0,
                dark: 0x1a1a1a
            },
            // 보드 색상
            board: {
                base: 0x727272,
                light: 0xBCBCBC,
                dark: 0x7A7A7A
            },
            // 나이트 색상
            knight: {
                base: 0x7A7A7A,
                specular: 0xD1D1D1,
                metal: 0x808080
            },
            // 조명 색상
            light: {
                ambient: 0xffffff,
                directional: 0xffffff,
                hemisphere: {
                    sky: 0xffffff,
                    ground: 0x444444
                }
            },
            // 인디케이터 색상
            indicator: {
                visited: {
                    base: 0x21749A,
                    emissive: 0x2FA3D7,
                    opacity: 0.5
                },
                possible: {
                    base: 0x0C6F10,
                    opacity: 0.5
                },
                gameOver: {
                    base: 0xFF0000,
                    opacity: 0.3
                }
            }
        };

        // 머티리얼 설정
        this.materials = {
            // 공통 머티리얼 속성
            common: {
                shininess: 20,
                // envMapIntensity: 0.8,
                // roughness: 0.2,
                // metalness: 0.8
            },
            // 보드 머티리얼 속성
            board: {
                shininess: 20,
                // envMapIntensity: 0.8
            },
            // 나이트 머티리얼 속성
            knight: {
                shininess: 80,
                // envMapIntensity: 0.8,
                // metalness: 0.8,
                // roughness: 0.2
            },
            // 인디케이터 머티리얼 속성
            indicator: {
                visited: {
                    transparent: true,
                    side: THREE.DoubleSide,
                    emissiveIntensity: 0.2
                },
                possible: {
                    transparent: true,
                    side: THREE.DoubleSide
                }
            }
        };

        // 조명 설정
        this.lights = {
            ambient: {
                intensity: 0.22
            },
            hemisphere: {
                intensity: 0.38
            },
            directional: {
                intensity: 0.54
            },
            fill: {
                intensity: 0.14
            }
        };

        // 렌더러 설정
        this.renderer = {
            toneMappingExposure: 0.8
        };

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.boardSize = 5;
        this.knight = null;
        this.currentPosition = null;
        this.moves = 0;
        this.visited = new Set();
        this.possibleMoves = [];
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.squares = [];
        this.possibleMoveIndicators = [];
        this.visitedSquares = [];
        this.gameStarted = false;
        this.selectingStartPosition = true;
        this.isMoving = false;
        this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.confetti = null;
        this.gameOverOverlay = null;
        this.gameOverAnimationTimeline = null;
        
        // 로컬 스토리지에서 테마 설정 불러오기
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.isDarkTheme = savedTheme === 'dark';
        }
        
        this.init();
    }

    // 색상 변환 유틸리티 함수
    createColor(hex) {
        return new THREE.Color(hex);
    }

    // 머티리얼 생성 유틸리티 함수
    createMaterial(type, options = {}) {
        const baseOptions = {
            ...this.materials.common,
            ...this.materials[type],
            ...options
        };
        return new THREE.MeshPhongMaterial(baseOptions);
    }

    init() {
        // Renderer 설정
        const container = document.getElementById('board-container');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.overflow = 'hidden';
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 렌더러 품질 설정
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(this.isDarkTheme ? this.colors.background.dark : this.colors.background.light);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = this.renderer.toneMappingExposure;
        
        // Canvas 모서리 둥글게 설정
        this.renderer.domElement.style.borderRadius = '20px';
        this.renderer.domElement.style.overflow = 'hidden';
        
        container.appendChild(this.renderer.domElement);

        // 모바일 환경 감지
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // 카메라 설정 수정
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // OrbitControls 설정
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.rotateSpeed = isMobile ? 0.5 : 1;

        // 카메라 위치 초기화
        this.initializeCameraPosition();

        // 조명 설정
        const ambientLight = new THREE.AmbientLight(
            this.colors.light.ambient,
            this.lights.ambient.intensity
        );
        this.scene.add(ambientLight);

        // 주변광 추가
        const hemisphereLight = new THREE.HemisphereLight(
            this.colors.light.hemisphere.sky,
            this.colors.light.hemisphere.ground,
            this.lights.hemisphere.intensity
        );
        this.scene.add(hemisphereLight);

        // 메인 조명
        const directionalLight = new THREE.DirectionalLight(
            this.colors.light.directional,
            this.lights.directional.intensity
        );
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        
        // 그림자 품질 설정
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(directionalLight);

        // 보조 조명
        const fillLight = new THREE.DirectionalLight(
            this.colors.light.directional,
            this.lights.fill.intensity
        );
        fillLight.position.set(-5, 3, -5);
        fillLight.castShadow = true;
        this.scene.add(fillLight);

        // UI 요소 스타일 설정
        this.setupMobileFriendlyUI();

        // 보드 크기 선택 UI 추가
        this.createBoardSizeSelector();
        
        // 체스보드 생성
        this.createBoard();
        
        // 나이트 모델 로드
        this.loadKnightModel();

        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 애니메이션 시작
        this.animate();
    }

    createThemeButton() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '120px';
        container.style.zIndex = '1000';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        container.style.cursor = 'pointer';

        const button = document.createElement('button');
        button.textContent = this.isDarkTheme ? '☀️' : '🌙';
        button.style.background = 'none';
        button.style.border = 'none';
        button.style.fontSize = '20px';
        button.style.cursor = 'pointer';
        button.style.padding = '5px';

        button.addEventListener('click', () => {
            this.isDarkTheme = !this.isDarkTheme;
            button.textContent = this.isDarkTheme ? '☀️' : '🌙';
            this.renderer.setClearColor(this.isDarkTheme ? this.colors.background.dark : this.colors.background.light);
            localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
            this.updateBoardColors();
        });

        container.appendChild(button);
        document.getElementById('board-container').appendChild(container);
    }

    updateBoardColors() {
        // 체스판 색상 업데이트
        this.squares.forEach((square, index) => {
            const i = Math.floor(index / this.boardSize);
            const j = index % this.boardSize;
            const isEven = (i + j) % 2 === 0;
            
            if (this.isDarkTheme) {
                square.material.color.setHex(isEven ? this.colors.board.light : this.colors.board.dark);
            } else {
                square.material.color.setHex(isEven ? this.colors.board.light : this.colors.board.dark);
            }
        });
    }

    createBoardSizeSelector() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '10px';
        container.style.zIndex = '1000';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        container.style.color = 'white';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';
        container.style.fontSize = '14px';

        const label = document.createElement('label');
        label.textContent = 'Board Size: ';
        label.style.marginRight = '5px';
        container.appendChild(label);

        const select = document.createElement('select');
        select.style.padding = '8px';
        select.style.borderRadius = '4px';
        select.style.backgroundColor = '#333';
        select.style.color = 'white';
        select.style.border = '1px solid #666';
        select.style.fontSize = '14px';
        select.style.minWidth = '80px';
        select.style.cursor = 'pointer';

        for (let size = 5; size <= 8; size++) {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size}x${size}`;
            if (size === this.boardSize) {
                option.selected = true;
            }
            select.appendChild(option);
        }

        select.addEventListener('change', (e) => {
            this.boardSize = parseInt(e.target.value);
            this.reset();
            this.createBoard();
            
            // 카메라 위치 초기화
            this.initializeCameraPosition();
            
            document.getElementById('moves-count').textContent = `0 / ${this.boardSize * this.boardSize}`;
        });

        container.appendChild(select);
        document.getElementById('board-container').appendChild(container);
    }

    createBoard() {
        // 기존 보드 제거
        this.squares.forEach(square => this.scene.remove(square));
        this.squares = [];

        // 기존 배경 판 제거
        const existingBoard = this.scene.children.find(child => 
            child.geometry && 
            child.geometry.type === 'BoxGeometry' && 
            child.material.color.getHex() === this.colors.board.base
        );
        if (existingBoard) {
            this.scene.remove(existingBoard);
        }

        // 배경 큐브 크기 계산
        const boardGeometry = new THREE.BoxGeometry(this.boardSize, 0.2, this.boardSize);
        const boardMaterial = this.createMaterial('board', {
            color: this.createColor(this.colors.board.base),
            specular: this.createColor(this.colors.secondary.dark)
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.receiveShadow = true;
        board.position.y = -0.05;
        this.scene.add(board);

        // 체스판 패턴 생성
        const halfSize = this.boardSize / 2;
        for (let i = -halfSize; i < halfSize; i++) {
            for (let j = -halfSize; j < halfSize; j++) {
                const squareGeometry = new THREE.BoxGeometry(1, 0.1, 1);
                const squareMaterial = this.createMaterial('board', {
                    color: this.createColor((i + j) % 2 === 0 ? this.colors.board.light : this.colors.board.dark),
                    specular: this.createColor(this.colors.secondary.dark)
                });
                const square = new THREE.Mesh(squareGeometry, squareMaterial);
                square.position.set(i + 0.5, 0.1, j + 0.5);
                square.receiveShadow = true;
                square.userData = {
                    row: i + halfSize,
                    col: j + halfSize,
                    isPossibleMove: false
                };
                this.squares.push(square);
                this.scene.add(square);
            }
        }

        // moves-count 초기화
        document.getElementById('moves-count').textContent = `0 / ${this.boardSize * this.boardSize}`;
    }

    createVisitedIndicator() {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
        const material = this.createMaterial('indicator', {
            color: this.createColor(this.colors.indicator.visited.base),
            emissive: this.createColor(this.colors.indicator.visited.emissive),
            opacity: this.colors.indicator.visited.opacity,
            ...this.materials.indicator.visited
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.rotation.x = 0;
        return indicator;
    }

    createPossibleMoveIndicator() {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
        const material = this.createMaterial('indicator', {
            color: this.createColor(this.colors.indicator.possible.base),
            opacity: this.colors.indicator.possible.opacity,
            ...this.materials.indicator.possible
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.userData.isPossibleMove = true;
        return indicator;
    }

    updatePossibleMoveIndicators() {
        // 기존 표시기 제거
        this.possibleMoveIndicators.forEach(indicator => {
            this.scene.remove(indicator);
        });
        this.possibleMoveIndicators = [];

        // 새로운 가능한 이동 위치 표시
        const halfSize = this.boardSize / 2;
        this.possibleMoves.forEach(move => {
            const indicator = this.createPossibleMoveIndicator();
            indicator.position.set(-halfSize + 0.5 + move.x, 0.15, -halfSize + 0.5 + move.y);
            this.possibleMoveIndicators.push(indicator);
            this.scene.add(indicator);
        });
    }

    loadKnightModel() {
        if (typeof THREE.ColladaLoader === 'undefined') {
            console.warn('ColladaLoader not found, using default knight model');
            this.createDefaultKnight();
            return;
        }
        
        const loader = new THREE.ColladaLoader();
        loader.load(
            'knights-tour/model.dae',
            (collada) => {
                this.knight = collada.scene;
                this.knight.scale.set(0.025, 0.025, 0.025);
                this.knight.position.set(-3.5, 0.3, -3.5);
                this.knight.visible = false;

                // 새로운 material 생성
                const knightMaterial = this.createMaterial('knight', {
                    color: this.createColor(this.colors.knight.base),
                    specular: this.createColor(this.colors.knight.specular)
                });

                this.knight.traverse((node) => {
                    if (node.type === 'Line' || node.type === 'LineSegments') {
                        this.knight.remove(node);
                        return;
                    }

                    if (node.isMesh) {
                        if (node.material) {
                            if (Array.isArray(node.material)) {
                                node.material.forEach(mat => {
                                    if (mat.dispose) mat.dispose();
                                });
                            } else if (node.material.dispose) {
                                node.material.dispose();
                            }
                        }

                        node.material = knightMaterial.clone();
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });

                this.scene.add(this.knight);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened while loading the knight model:', error);
                this.createDefaultKnight();
            }
        );
    }

    createDefaultKnight() {
        const group = new THREE.Group();
        
        // 나이트의 몸체
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
        const bodyMaterial = this.createMaterial('knight', {
            color: this.createColor(this.colors.knight.base),
            specular: this.createColor(this.colors.knight.specular)
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3;
        group.add(body);

        // 나이트의 머리
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headMaterial = this.createMaterial('knight', {
            color: this.createColor(this.colors.knight.base),
            specular: this.createColor(this.colors.knight.specular)
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.6;
        group.add(head);

        // 나이트의 말머리
        const maneGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
        const maneMaterial = this.createMaterial('knight', {
            color: this.createColor(this.colors.knight.base),
            specular: this.createColor(this.colors.knight.specular)
        });
        const mane = new THREE.Mesh(maneGeometry, maneMaterial);
        mane.position.set(0.2, 0.75, 0);
        mane.rotation.z = -Math.PI / 4;
        group.add(mane);

        // 나이트의 다리
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        const legMaterial = this.createMaterial('knight', {
            color: this.createColor(this.colors.knight.base),
            specular: this.createColor(this.colors.knight.specular)
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15, 0, 0);
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.15, 0, 0);
        group.add(rightLeg);

        // 전체 그룹 설정
        group.scale.set(0.6, 0.9, 0.6);
        group.position.set(-3.5, 0.3, -3.5);
        group.visible = false;
        group.castShadow = true;

        this.knight = group;
        this.scene.add(this.knight);
    }

    setupMobileFriendlyUI() {
        // Start Tour 버튼 스타일
        const startBtn = document.getElementById('start-btn');
        startBtn.style.padding = '12px 24px';
        startBtn.style.fontSize = '16px';
        startBtn.style.borderRadius = '8px';
        startBtn.style.border = 'none';
        startBtn.style.backgroundColor = '#4CAF50';
        startBtn.style.color = 'white';
        startBtn.style.cursor = 'pointer';
        startBtn.style.transition = 'all 0.3s ease';
        startBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        startBtn.style.margin = '10px';
        startBtn.style.minWidth = '120px';

        // 상태 표시 스타일
        const status = document.getElementById('status');
        status.style.fontSize = '16px';
        status.style.padding = '10px';
        status.style.margin = '10px';
        status.style.textAlign = 'center';
        // status.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        status.style.color = 'white';
        status.style.borderRadius = '5px';
        status.style.maxWidth = '90%';
        status.style.marginLeft = 'auto';
        status.style.marginRight = 'auto';
        // status.style.position = 'absolute';
        status.style.bottom = '20px';
        status.style.left = '50%';
        status.style.transform = 'translateX(-50%)';
        status.style.zIndex = '1000';
        status.style.wordWrap = 'break-word';
        status.style.whiteSpace = 'normal';
        status.style.lineHeight = '1.4';

        // 이동 횟수 표시 스타일
        const movesCount = document.getElementById('moves-count');
        movesCount.style.fontSize = '16px';
        movesCount.style.padding = '8px 16px';
        // movesCount.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        movesCount.style.color = 'white';
        movesCount.style.borderRadius = '5px';
        // movesCount.style.position = 'absolute';
        movesCount.style.top = '10px';
        movesCount.style.right = '10px';
        movesCount.style.zIndex = '1000';
        movesCount.style.whiteSpace = 'nowrap';
        movesCount.style.maxWidth = 'calc(100% - 20px)';
        movesCount.style.overflow = 'hidden';
        movesCount.style.textOverflow = 'ellipsis';

        // 모바일 환경 감지
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            // 모바일에서 상태 표시 스타일 조정
            status.style.fontSize = '14px';
            status.style.padding = '8px';
            status.style.margin = '5px';
            status.style.maxWidth = '95%';
            status.style.bottom = '10px';

            // 모바일에서 이동 횟수 표시 스타일 조정
            movesCount.style.fontSize = '14px';
            movesCount.style.padding = '6px 12px';
            movesCount.style.top = '5px';
            movesCount.style.right = '5px';
        }
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            // 게임이 진행 중이거나 종료된 상태라면 리셋
            if (this.gameStarted || this.visited.size > 0) {
                this.reset();
            }
            this.startGame();
        });

        // 모바일 환경에서의 터치 이벤트 처리
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            this.renderer.domElement.addEventListener('touchstart', (event) => {
                event.preventDefault();
                const touch = event.touches[0];
                const mouseEvent = new MouseEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                this.onMouseClick(mouseEvent);
            });
        } else {
            this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        }

        window.addEventListener('resize', () => this.onWindowResize());
    }

    startGame() {
        if (!this.gameStarted) {
            this.selectingStartPosition = true;
            document.getElementById('status').textContent = 'Select starting position';
            // 게임 시작 시 버튼 텍스트 변경
            const startBtn = document.getElementById('start-btn');
            startBtn.textContent = 'Restart Tour';
        }
    }

    reset() {
        // 게임 오버 애니메이션 중단
        if (this.gameOverAnimationTimeline) {
            this.gameOverAnimationTimeline.kill();
            this.gameOverAnimationTimeline = null;
        }

        // 모든 GSAP 애니메이션 중단
        gsap.killTweensOf(this.squares);
        gsap.killTweensOf(this.knight);
        gsap.killTweensOf(this.camera.position);
        
        this.moves = 0;
        this.visited.clear();
        this.possibleMoves = [];
        this.gameStarted = false;
        this.selectingStartPosition = true;
        this.isMoving = false;
        
        // 방문한 칸 표시 제거
        this.visitedSquares.forEach(square => {
            this.scene.remove(square);
        });
        this.visitedSquares = [];
        
        if (this.knight) {
            this.knight.visible = false;
        }
        this.currentPosition = null;

        // 체스판 복구
        this.squares.forEach(square => {
            // 위치 복구
            gsap.to(square.position, {
                y: 0.1,
                duration: 0.5,
                ease: "power2.out"
            });
            // 회전 복구
            gsap.to(square.rotation, {
                x: 0,
                z: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // 배경 체스판 복구
        const board = this.scene.children.find(child => child.geometry && child.geometry.type === 'BoxGeometry');
        if (board) {
            gsap.to(board.position, {
                y: 0,
                duration: 0.5,
                ease: "power2.out"
            });
            gsap.to(board.rotation, {
                x: 0,
                z: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        }

        this.updatePossibleMoveIndicators();
        document.getElementById('moves-count').textContent = `0 / ${this.boardSize * this.boardSize}`;
        document.getElementById('status').textContent = 'Select starting position';

        // 카메라 위치 초기화
        this.initializeCameraPosition();

        // 게임 오버 오버레이 제거
        if (this.gameOverOverlay) {
            const container = document.getElementById('board-container');
            container.removeChild(this.gameOverOverlay);
            this.gameOverOverlay = null;
        }

        // 가능한 이동 표시기 제거
        this.possibleMoveIndicators.forEach(indicator => {
            this.scene.remove(indicator);
        });
        this.possibleMoveIndicators = [];

        // 버튼 상태 초기화
        const startBtn = document.getElementById('start-btn');
        startBtn.style.display = 'block';
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        // 버튼 텍스트를 Start Tour로 변경
        this.updateButtonText('Start Tour');
    }

    onMouseClick(event) {
        if (!this.selectingStartPosition && !this.gameStarted) return;
        if (this.isMoving) return;

        // 마우스 위치를 정규화된 장치 좌표로 변환
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 레이캐스팅
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        if (this.selectingStartPosition) {
            // 시작 위치 선택 시 체스판만 검사
            const intersects = this.raycaster.intersectObjects(this.squares);
            if (intersects.length > 0) {
                const square = intersects[0].object;
                const row = square.userData.row;
                const col = square.userData.col;
                const halfSize = this.boardSize / 2;
                const position = { x: row, y: col };
                this.setStartPosition(position);
            }
        } else if (this.gameStarted) {
            // 이동 시 가능한 이동 표시기와 체스판 모두 검사
            const allIntersects = this.raycaster.intersectObjects([
                ...this.possibleMoveIndicators,
                ...this.squares
            ]);

            if (allIntersects.length > 0) {
                const clickedObject = allIntersects[0].object;
                const halfSize = this.boardSize / 2;
                
                // 가능한 이동 표시기를 클릭한 경우
                if (this.possibleMoveIndicators.includes(clickedObject)) {
                    const indicatorIndex = this.possibleMoveIndicators.indexOf(clickedObject);
                    const move = this.possibleMoves[indicatorIndex];
                    if (move) {
                        // 선택되지 않은 원형들 애니메이션으로 축소
                        this.possibleMoveIndicators.forEach((indicator, index) => {
                            if (index !== indicatorIndex) {
                                gsap.to(indicator.scale, {
                                    x: 0,
                                    y: 0,
                                    z: 0,
                                    duration: 0.3,
                                    ease: "power2.in",
                                    onComplete: () => {
                                        this.scene.remove(indicator);
                                    }
                                });
                            }
                        });
                        this.makeMove(move);
                    }
                }
                // 체스판을 클릭한 경우
                else if (this.squares.includes(clickedObject)) {
                    const clickedRow = clickedObject.userData.row;
                    const clickedCol = clickedObject.userData.col;
                    const clickedPosition = { x: clickedCol, y: clickedRow };
                    
                    // 클릭한 위치가 가능한 이동 위치인지 확인
                    const isValidMove = this.possibleMoves.some(move => 
                        move.x === clickedPosition.x && move.y === clickedPosition.y
                    );
                    
                    if (isValidMove) {
                        // 선택되지 않은 원형들 애니메이션으로 축소
                        this.possibleMoveIndicators.forEach((indicator, index) => {
                            const move = this.possibleMoves[index];
                            if (move.x !== clickedPosition.x || move.y !== clickedPosition.y) {
                                gsap.to(indicator.scale, {
                                    x: 0,
                                    y: 0,
                                    z: 0,
                                    duration: 0.3,
                                    ease: "power2.in",
                                    onComplete: () => {
                                        this.scene.remove(indicator);
                                    }
                                });
                            }
                        });
                        this.makeMove(clickedPosition);
                    }
                }
            }
        }
    }

    setStartPosition(position) {
        if (this.knight) {
            this.knight.visible = true;
            const halfSize = this.boardSize / 2;
            this.knight.position.set(-halfSize + 0.5 + position.x, 0.3, -halfSize + 0.5 + position.y); // 높이 조정
        }
        this.currentPosition = position;
        this.visited.add(`${position.x},${position.y}`);
        this.markSquareAsVisited(position.x, position.y);
        this.selectingStartPosition = false;
        this.gameStarted = true;
        this.moves = 1;
        document.getElementById('moves-count').textContent = `${this.moves} / ${this.boardSize * this.boardSize}`;
        this.updatePossibleMoves();
        this.updatePossibleMoveIndicators();
        document.getElementById('status').textContent = 'Select a move';
    }

    markSquareAsVisited(x, y) {
        const visitedIndicator = this.createVisitedIndicator();
        const halfSize = this.boardSize / 2;
        visitedIndicator.position.set(-halfSize + 0.5 + x, 0.2, -halfSize + 0.5 + y);
        this.visitedSquares.push(visitedIndicator);
        this.scene.add(visitedIndicator);

        gsap.from(visitedIndicator.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    }

    makeMove(move) {
        this.isMoving = true;
        const halfSize = this.boardSize / 2;
        const targetX = -halfSize + 0.5 + move.x;
        const targetZ = -halfSize + 0.5 + move.y;

        // Start Tour 버튼 비활성화
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';

        // GSAP 타임라인 생성
        const tl = gsap.timeline({
            onComplete: () => {
                this.currentPosition = move;
                this.visited.add(`${move.x},${move.y}`);
                this.markSquareAsVisited(move.x, move.y);
                this.moves++;
                document.getElementById('moves-count').textContent = `${this.moves} / ${this.boardSize * this.boardSize}`;
                this.updatePossibleMoves();
                this.updatePossibleMoveIndicators();
                this.checkGameStatus();
                this.isMoving = false;

                // Start Tour 버튼 다시 활성화
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
                startBtn.style.cursor = 'pointer';
            }
        });

        // 1. 위로 올라가는 애니메이션
        tl.to(this.knight.position, {
            y: 1.05, // 높이 조정
            duration: 0.3,
            ease: "power2.out"
        });

        // 2. 목표 지점으로 이동하는 애니메이션
        tl.to(this.knight.position, {
            x: targetX,
            z: targetZ,
            duration: 0.4,
            ease: "power2.inOut"
        });

        // 3. 아래로 내려가는 애니메이션
        tl.to(this.knight.position, {
            y: 0.3, // 높이 조정
            duration: 0.3,
            ease: "power2.in"
        });
    }

    updatePossibleMoves() {
        this.possibleMoves = [];
        const moves = [
            { x: 2, y: 1 }, { x: 2, y: -1 },
            { x: -2, y: 1 }, { x: -2, y: -1 },
            { x: 1, y: 2 }, { x: 1, y: -2 },
            { x: -1, y: 2 }, { x: -1, y: -2 }
        ];

        for (const move of moves) {
            const newX = this.currentPosition.x + move.x;
            const newY = this.currentPosition.y + move.y;
            const key = `${newX},${newY}`;

            if (newX >= 0 && newX < this.boardSize && 
                newY >= 0 && newY < this.boardSize && 
                !this.visited.has(key)) {
                this.possibleMoves.push({ x: newX, y: newY });
            }
        }
    }

    checkGameStatus() {
        if (this.possibleMoves.length === 0) {
            if (this.visited.size === this.boardSize * this.boardSize) {
                const status = document.getElementById('status');
                status.textContent = '🎉 Congratulations! You completed the tour! 🎉';
                // 상태 메시지가 길 경우 줄임
                if (window.innerWidth < 768) {
                    status.textContent = '🎉 Tour Complete! 🎉';
                }
                this.victoryAnimation();
            } else {
                const status = document.getElementById('status');
                status.textContent = `Game Over! Visited ${this.visited.size}/${this.boardSize * this.boardSize} squares.`;
                // 상태 메시지가 길 경우 줄임
                if (window.innerWidth < 768) {
                    status.textContent = `Game Over! ${this.visited.size}/${this.boardSize * this.boardSize}`;
                }
                this.gameOverAnimation();
            }
            this.gameStarted = false;
            document.getElementById('start-btn').style.display = 'block';
            // 게임 종료 시 버튼 텍스트를 Start Tour로 변경
            document.getElementById('start-btn').textContent = 'Start Tour';
        } else {
            document.getElementById('status').textContent = 'Select a move';
        }
    }

    victoryAnimation() {
        console.log('Victory animation started');
        
        // Start Tour 버튼 활성화
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
        startBtn.style.display = 'block';
        
        // 1. 폭죽 효과
        if (window.confetti) {
            console.log('Triggering confetti effect');
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            console.error('Confetti not available');
        }

        // 2. 카메라 회전 애니메이션
        gsap.to(this.camera.position, {
            x: 5,
            y: 5,
            z: 5,
            duration: 2,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(this.camera.position, {
                    x: -5,
                    y: 5,
                    z: 5,
                    duration: 2,
                    ease: "power2.inOut",
                    onComplete: () => {
                        gsap.to(this.camera.position, {
                            x: 0,
                            y: 5,
                            z: 5,
                            duration: 2,
                            ease: "power2.inOut"
                        });
                    }
                });
            }
        });

        // 3. 나이트 승리 애니메이션
        if (this.knight) {
            // 올라가는 애니메이션
            gsap.to(this.knight.position, {
                y: 1,
                duration: 0.5,
                ease: "bounce.out",
                onComplete: () => {
                    // 내려오는 애니메이션
                    gsap.to(this.knight.position, {
                        y: 0.3,
                        duration: 0.5,
                        ease: "power2.in"
                    });
                }
            });
        }
    }

    gameOverAnimation() {
        // Start Tour 버튼 비활성화
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';

        // 모든 애니메이션의 총 지속 시간 계산
        const totalAnimationDuration = 5000; // 5초

        // GSAP 타임라인 생성
        this.gameOverAnimationTimeline = gsap.timeline();

        // 1. Visited indicators 색상 변경
        this.visitedSquares.forEach(square => {
            this.gameOverAnimationTimeline.to(square.material, {
                color: this.createColor(this.colors.indicator.gameOver.base),
                opacity: this.colors.indicator.gameOver.opacity,
                duration: 1,
                ease: "power2.inOut"
            }, 0);
        });

        // 2. 체스판 무너짐 애니메이션
        this.squares.forEach((square, index) => {
            const delay = Math.random() * 2;
            const rotationX = Math.random() * Math.PI * 2;
            const rotationZ = Math.random() * Math.PI * 2;
            
            this.gameOverAnimationTimeline.to(square.position, {
                y: -5,
                duration: 2,
                delay: delay,
                ease: "power2.in"
            }, 0);

            this.gameOverAnimationTimeline.to(square.rotation, {
                x: rotationX,
                z: rotationZ,
                duration: 2,
                delay: delay,
                ease: "power2.in"
            }, 0);
        });

        // 3. 나이트 추락 애니메이션
        if (this.knight) {
            this.gameOverAnimationTimeline.to(this.knight.position, {
                y: -5,
                duration: 2,
                delay: 1,
                ease: "power2.in",
                onComplete: () => {
                    this.knight.visible = false;
                }
            }, 0);
        }

        // 4. 배경 체스판 무너짐
        const board = this.scene.children.find(child => child.geometry && child.geometry.type === 'BoxGeometry');
        if (board) {
            this.gameOverAnimationTimeline.to(board.position, {
                y: -5,
                duration: 2.5,
                delay: 0.5,
                ease: "power2.in"
            }, 0);

            this.gameOverAnimationTimeline.to(board.rotation, {
                x: Math.PI / 4,
                z: Math.PI / 4,
                duration: 2.5,
                delay: 0.5,
                ease: "power2.in"
            }, 0);
        }

        // 5. 화면 페이드 아웃 효과
        const container = document.getElementById('board-container');
        if (this.gameOverOverlay) {
            container.removeChild(this.gameOverOverlay);
        }
        
        this.gameOverOverlay = document.createElement('div');
        this.gameOverOverlay.style.position = 'absolute';
        this.gameOverOverlay.style.top = '0';
        this.gameOverOverlay.style.left = '0';
        this.gameOverOverlay.style.width = '100%';
        this.gameOverOverlay.style.height = '100%';
        this.gameOverOverlay.style.backgroundColor = this.isDarkTheme ? '#1a1a1a' : '#f0f0f0';
        this.gameOverOverlay.style.opacity = '0';
        this.gameOverOverlay.style.transition = 'opacity 2s ease-in-out';
        this.gameOverOverlay.style.zIndex = '1000';
        container.appendChild(this.gameOverOverlay);

        // 애니메이션 시퀀스 시작
        setTimeout(() => {
            // 페이드 아웃 시작
            this.gameOverOverlay.style.opacity = '1';
            
            // 모든 애니메이션이 완료된 후 Start Tour 버튼 활성화
            setTimeout(() => {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
                startBtn.style.cursor = 'pointer';
                startBtn.style.display = 'block';
            }, totalAnimationDuration);
        }, 1000);
    }

    onWindowResize() {
        const container = document.getElementById('board-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // 카메라 비율 업데이트
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // 렌더러 크기 및 픽셀 비율 업데이트
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 카메라 위치 초기화
        this.initializeCameraPosition();

        // 상태 메시지 업데이트
        const status = document.getElementById('status');
        if (this.possibleMoves.length === 0) {
            if (this.visited.size === this.boardSize * this.boardSize) {
                status.textContent = window.innerWidth < 768 ? 
                    '🎉 Tour Complete! 🎉' : 
                    '🎉 Congratulations! You completed the tour! 🎉';
            } else {
                status.textContent = window.innerWidth < 768 ? 
                    `Game Over! ${this.visited.size}/${this.boardSize * this.boardSize}` : 
                    `Game Over! Visited ${this.visited.size}/${this.boardSize * this.boardSize} squares.`;
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // 카메라 위치 초기화 공통 함수
    initializeCameraPosition() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const cameraDistance = this.boardSize * (isMobile ? 1.67 : 1.33);
        const cameraHeight = 3 * cameraDistance / 5;
        const cameraDepth = 2 * cameraDistance / 5;
        
        this.camera.position.set(0, cameraHeight, cameraDepth);
        this.camera.lookAt(0, 0, 0);
        
        this.controls.minDistance = this.boardSize * (isMobile ? 1.11 : 0.56);
        this.controls.maxDistance = this.boardSize * (isMobile ? 2.78 : 1.67);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    updateButtonText(text) {
        const startBtn = document.getElementById('start-btn');
        startBtn.textContent = text;
    }
}

// 게임 인스턴스 생성
const game = new KnightTour3D(); 