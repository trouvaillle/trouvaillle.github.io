window.onload = () => {
  const mersenneTwister = new MersenneTwister();
  let game = undefined;
  let actionButtonDisabled = false;

  const url = "https://trouvaillle.github.io/app";

  const buttonActionElement = document.querySelector("#board");
  const backElement = document.querySelector("#back");
  const soundElement = document.querySelector("#sound");

  backElement.addEventListener("click", (event) => {
    window.location.href = url;
  });

  buttonActionElement.addEventListener("click", (event) => {
    doAction();
  });

  soundElement.addEventListener("click", (event) => {
    if (game !== undefined) {
      if (!game.gameOver) {
        audioController.toggleSound();
      } else {
        if (audioController.muted) {
          audioController.setMute(false);
        } else {
          audioController.setMute(true);
        }
      }
    }
  });

  document.addEventListener("visibilitychange", (event) => {
    switch (document.visibilityState) {
      case "hidden":
        if (!audioController.muted) {
          audioController.pauseMusic();
        }
        if (game !== undefined && !game.gameOver) {
          game.pause();
        }
        break;
      case "visible":
        if (game !== undefined && !game.gameOver) {
          game.resume();
          if (!audioController.muted) {
            audioController.startMusic();
          }
        }
        break;
    }
  });

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case " ":
        doAction();
        break;
      case "m":
      case "M":
        if (game !== undefined) {
          if (!game.gameOver) {
            audioController.toggleSound();
          } else {
            if (audioController.muted) {
              audioController.setMute(false);
            } else {
              audioController.setMute(true);
            }
          }
        }
        break;
    }
  });

  function doAction() {
    if (!actionButtonDisabled) {
      if (game.gameOver) {
        if (!audioController.muted) {
          audioController.startMusic();
        }
        game.start();
      } else {
        game.toggleLink();
      }
    } else {
      setTimeout(() => {
        actionButtonDisabled = false;
      }, 500);
    }
  }

  function randBetween(lower, upper) {
    return Math.floor(mersenneTwister.random() * (upper - lower + 1)) + lower;
  }

  function init() {
    if (game == undefined) {
      game = new Game();
    } else {
      game.stop();
    }
    game.start();
    audioController = new AudioController();
  }

  class AudioController {
    constructor() {
      this.bgMusicController = undefined;
      this.bgMusicPlaying = false;
      this.muted = true;
      this.soundIconElement = document.querySelector("#soundIcon");
    }

    startMusic() {
      if (this.bgMusicController !== undefined) {
        this.bgMusicController.play();
      } else {
        let source = "../assets/media/raven-song-copyright-free.mp3";
        this.bgMusicController = document.createElement("audio");
        this.bgMusicController.autoplay = true;
        this.bgMusicController.loop = true;
        this.bgMusicController.addEventListener(
          "load",
          function () {
            this.bgMusicController.play();
          },
          true
        );
        this.bgMusicController.src = source;
        this.bgMusicController.load();
      }
      this.muted = false;
      this.bgMusicPlaying = true;
      this.soundIconElement.className = "fa-solid fa-volume-high";
    }

    stopMusic() {
      if (this.bgMusicController !== undefined) {
        this.bgMusicController.pause();
        this.bgMusicController.currentTime = 0;
      }
      this.bgMusicPlaying = false;
    }

    pauseMusic() {
      if (this.bgMusicController !== undefined) {
        this.bgMusicController.pause();
      }
      this.bgMusicPlaying = false;
    }

    setMute(value) {
      this.muted = value;
      if (this.bgMusicPlaying && value) {
        this.pauseMusic();
      }
      if (value) {
        this.soundIconElement.className = "fa-solid fa-volume-xmark";
      } else {
        this.soundIconElement.className = "fa-solid fa-volume-high";
      }
    }

    toggleSound() {
      if (this.bgMusicController === undefined || !this.bgMusicPlaying) {
        this.startMusic();
      } else {
        this.setMute(true);
      }
    }
  }

  class Game {
    constructor() {
      this.lineElement = document.querySelector("#line");
      this.spiderElement = document.querySelector("#spider");
      this.boardElement = document.querySelector("#board");
      this.distanceElement = document.querySelector("#distance");
      this.gameOverElement = document.querySelector("#gameover");
    }

    init = () => {
      this.gameOver = false;
      this.distance = 0;
      this.gravity = 0.06;
      this.scrollingSpeed = 0.1;
      this.buildingProbability = 3;
      this.recentStep = 0;
      this.line = {
        linked: true,
        len: 50,
        theta: 0,
        thetaVel: 0.02,
        thetaAcc: 0,
        x: 50,
        xVel: 0,
        xAcc: 0,
        y: 0,
        yVel: 0,
        yAcc: 0,
      };
      this.spider = {
        size: 4,
        theta: 0,
        thetaVel: 0,
        thetaAcc: 0,
        x: 0,
        xVel: 0,
        xAcc: 0,
        y: 0,
        yVel: 0,
        yAcc: 0,
      };
      this.angle = 0;
      this.backgrounds = [];
      this.buildings = [];

      for (let i of document.querySelectorAll(".bg")) {
        i.remove();
      }
      for (let i of document.querySelectorAll(".bld")) {
        i.remove();
      }
    };

    start = () => {
      this.init();
      this.timerId = setInterval(this.step, 15);
    };

    stop = () => {
      if (this.timerId != undefined) {
        clearInterval(this.timerId);
      }
      this.timerId = undefined;
      this.gameOver = true;
    };

    pause = () => {
      if (this.timerId !== undefined) {
        clearInterval(this.timerId);
      }
      this.timerId = undefined;
    };

    resume = () => {
      this.timerId = setInterval(this.step, 15);
    };

    step = () => {
      this.calculate();
      this.move();
      this.render();
      this.checkGameOver();
    };

    calculate = () => {
      this.vw =
        Math.max(
          document.documentElement.clientWidth || 0,
          window.innerWidth || 0
        ) / 100;
    };

    move = () => {
      this.line.x -= this.scrollingSpeed;
      this.distance += this.scrollingSpeed;
      this.recentStep = (this.recentStep + 1) % 500;
      if (this.recentStep % 500 == 0) {
        if (this.scrollingSpeed < 0.3) {
          this.scrollingSpeed += 0.005;
        }
        if (this.buildingProbability < 40) {
          this.buildingProbability += 1;
        }
      }
      if (this.line.linked) {
        this.line.thetaAcc = (-this.gravity / this.line.len) * this.line.theta;
        this.line.thetaVel += this.line.thetaAcc;
        this.line.theta += this.line.thetaVel;

        if (this.line.theta > Math.PI) {
          this.line.theta -= 2 * Math.PI;
        } else if (this.line.theta < -Math.PI) {
          this.line.theta += 2 * Math.PI;
        }

        this.spider.x = this.line.x - this.line.len * Math.sin(this.line.theta);
        this.spider.y = this.line.y + this.line.len * Math.cos(this.line.theta);
        this.spider.xVel =
          -this.line.len * this.line.thetaVel * Math.cos(this.line.theta);
        this.spider.yVel =
          -this.line.len * this.line.thetaVel * Math.sin(this.line.theta);
        this.spider.theta = this.line.theta;

        if (this.line.len <= 10) {
          this.line.len = 10;
        } else {
          this.line.len -= 0.5;
        }
      } else {
        if (this.line.len <= 0.5) {
          this.line.len = 0.5;
        } else {
          this.line.len -= 5;
        }

        this.spider.theta += this.line.thetaVel;

        this.spider.yAcc = 0;
        this.spider.xVel += this.spider.xAcc;
        this.spider.x += this.spider.xVel - this.scrollingSpeed;

        this.spider.yAcc = this.gravity;
        this.spider.yVel += this.spider.yAcc;
        this.spider.y += this.spider.yVel;
      }

      if (randBetween(0, 1000) < 3) {
        this.addBackground();
      }
      if (randBetween(0, 1000) < this.buildingProbability) {
        this.addBuilding();
      }
    };

    render = () => {
      this.lineElement.setAttribute(
        "style",
        `height: ${this.line.len}vw; left: ${this.line.x}vw; top: ${this.line.y}vw; transform: rotateZ(${this.line.theta}rad);`
      );
      if (this.line.len < 1) {
        this.lineElement.setAttribute("style", "display: none;");
      }

      let spiderApparentX = this.spider.x;
      let spiderApprentTheta = this.spider.theta;
      let spiderAdditionalStyle = "";
      if (spiderApparentX > 100) {
        spiderApparentX = 100 - 12;
        spiderApprentTheta = 0;
        spiderAdditionalStyle = "color: gray";
        this.spiderElement.className = "arrow-right";
      } else if (spiderApparentX < 0) {
        spiderApparentX = 12;
        spiderApprentTheta = 0;
        spiderAdditionalStyle = "color: gray";
        this.spiderElement.className = "arrow-left";
      } else {
        this.spiderElement.className = "";
      }
      this.spiderElement.setAttribute(
        "style",
        `left: ${spiderApparentX}vw; top: ${this.spider.y}vw; transform: rotateZ(${spiderApprentTheta}rad); ${spiderAdditionalStyle}`
      );
      this.distanceElement.innerHTML = `Distance: ${
        Math.floor(this.distance * 10) / 10
      }`;
      for (let i = 0; i < this.backgrounds.length; ++i) {
        if (this.backgrounds[i].x < -this.backgrounds[i].width * 2) {
          this.backgrounds[i].element.remove();
          this.backgrounds.splice(i, 1);
        } else {
          this.backgrounds[i].x -= this.scrollingSpeed;
          this.backgrounds[i].element.setAttribute(
            "style",
            `left: ${this.backgrounds[i].x}vw; border-left:${this.backgrounds[i].width}vw solid transparent;border-right:${this.backgrounds[i].width}vw solid transparent; border-bottom: ${this.backgrounds[i].width}vw solid #262930; `
          );
        }
      }

      for (let i = 0; i < this.buildings.length; ++i) {
        if (this.buildings[i].x < -this.buildings[i].width * 2) {
          this.buildings[i].element.remove();
          this.buildings.splice(i, 1);
        } else {
          this.buildings[i].x -= this.scrollingSpeed;
          this.buildings[i].element.setAttribute(
            "style",
            `left: ${this.buildings[i].x}vw; width:${this.buildings[i].width}vw; height:${this.buildings[i].height}vw;`
          );
        }
      }
    };

    addBackground = () => {
      let backgroundDiv = document.createElement("div");
      backgroundDiv.className = "bg";
      this.boardElement.appendChild(backgroundDiv);
      this.backgrounds.push({
        x: 100,
        width:
          (randBetween(1, 5) +
            randBetween(1, 5) +
            randBetween(1, 10) +
            randBetween(1, 10) +
            randBetween(1, 170)) /
          5,
        element: backgroundDiv,
      });
    };

    addBuilding = () => {
      let buildingDiv = document.createElement("div");
      buildingDiv.className = "bld";
      this.boardElement.appendChild(buildingDiv);
      this.buildings.push({
        x: 100,
        width:
          (randBetween(1, 5) +
            randBetween(1, 5) +
            randBetween(1, 10) +
            randBetween(1, 10) +
            randBetween(1, 170)) /
          5,
        height:
          (randBetween(1, 10) +
            randBetween(1, 10) +
            randBetween(1, 20) +
            randBetween(1, 20) +
            randBetween(1, 290)) /
          5,
        element: buildingDiv,
      });
    };

    cutLink = () => {
      this.line.linked = false;
    };

    attachLink = () => {
      if (Math.cos(this.spider.theta) < 0) {
        return;
      }
      this.line.linked = true;
      this.line.x =
        this.spider.x +
        (this.spider.y - this.line.y) * Math.sin(this.spider.theta);
      this.line.len = Math.sqrt(
        Math.pow(this.line.x - this.spider.x, 2) +
          Math.pow(this.line.y - this.spider.y, 2)
      );
      this.line.theta = -Math.atan(
        (this.line.x - this.spider.x) / (this.line.y - this.spider.y)
      );
      this.spider.theta = this.line.theta;
    };

    toggleLink = () => {
      if (this.line.linked) {
        this.cutLink();
      } else {
        this.attachLink();
      }
    };

    checkGameOver = () => {
      let isGameOver =
        (this.line.x < 0 &&
          this.spider.x < 0 &&
          this.spider.x +
            (this.spider.y - this.line.y) * Math.sin(this.spider.theta) <
            0) ||
        this.spider.y > this.boardElement.clientHeight / this.vw;
      for (let i of this.buildings) {
        if (
          this.spider.x + this.spider.size >= i.x &&
          this.spider.x - this.spider.size <= i.x + i.width &&
          this.spider.y + this.spider.size >=
            this.boardElement.clientHeight / this.vw - i.height
        ) {
          isGameOver = true;
          break;
        }
      }
      if (isGameOver) {
        this.boardElement.setAttribute("style", "background-color: #550603;");
        this.gameOverElement.setAttribute("style", "visibility: visible;");
        this.distanceElement.setAttribute("style", "color: white");
        for (let i of this.backgrounds) {
          i.element.setAttribute(
            "style",
            `left: ${i.x}vw; border-left:${i.width}vw solid transparent;border-right:${i.width}vw solid transparent; border-bottom: ${i.width}vw solid #200301;`
          );
        }
        for (let i of this.buildings) {
          i.element.setAttribute(
            "style",
            `left: ${i.x}vw; width:${i.width}vw; height:${i.height}vw; background-color: #300603; border:1px solid #550603;`
          );
        }
        audioController.stopMusic();
        actionButtonDisabled = true;
        setTimeout(() => {
          actionButtonDisabled = false;
        }, 500);
        this.stop();
      } else {
        this.boardElement.removeAttribute("style");
        this.gameOverElement.removeAttribute("style");
        this.distanceElement.removeAttribute("style");
      }
    };
  }

  init();
};
