window.onload = async () => {
  const url = "https://trouvaillle.github.io/app";

  const backElement = document.querySelector("#back");
  const drawingPadElement = document.querySelector("#drawingPad");
  const padElements = document.querySelectorAll(".pad");
  const colorsElement = document.querySelectorAll(".colors");
  const eraseAllElement = document.querySelector("#eraseAll");

  let prevX, prevY;
  let currX, currY;
  let isDrawing = false;
  let strokeStyle = "white";
  let lineWidth = 2;
  let isSettingWidth = false;
  let settingWidthPrevY;
  let colorSelectedIndex = 0;
  let currentColorElement;
  let currentPath;
  let currentPadIndex = 0;
  let padElement = padElements[currentPadIndex];
  let context = padElement.getContext("2d");
  let beginX, beginY;

  function setEventListeners() {
    backElement.addEventListener("click", (event) => {
      window.location.href = url;
    });

    eraseAllElement.addEventListener("click", (event) => {
      eraseAll();
    });

    drawingPadElement.addEventListener("mousedown", (event) => {
      event.preventDefault();
      drawStart(event);
    });

    drawingPadElement.addEventListener("mousemove", (event) => {
      event.preventDefault();
      drawContinue(event);
    });

    drawingPadElement.addEventListener("mouseup", (event) => {
      event.preventDefault();
      drawEnd(event);
    });

    drawingPadElement.addEventListener("mouseout", (event) => {
      event.preventDefault();
      drawEnd(event);
    });

    drawingPadElement.addEventListener("touchstart", (event) => {
      event.preventDefault();
      drawStart(event.touches[0]);
    });

    drawingPadElement.addEventListener("touchmove", (event) => {
      event.preventDefault();
      drawContinue(event.touches[0]);
    });

    drawingPadElement.addEventListener("touchend", (event) => {
      event.preventDefault();
      drawEnd(event.touches[0]);
    });

    window.addEventListener("resize", (event) => {
      init();
    });

    colorsElement.forEach((it) => {
      it.addEventListener("click", (event) => {
        event.preventDefault();
        selectColor(event);
      });

      it.addEventListener("mousedown", (event) => {
        event.preventDefault();
        selectColor(event);
        settingWidthStart(event);
      });

      it.addEventListener("mousemove", (event) => {
        event.preventDefault();
        settingWidthContinue(event);
      });

      it.addEventListener("mouseup", (event) => {
        event.preventDefault();
        settingWidthEnd(event);
      });
      it.addEventListener("mouseout", (event) => {
        event.preventDefault();
        settingWidthEnd(event);
      });

      it.addEventListener("touchstart", (event) => {
        event.preventDefault();
        selectColor(event);
        settingWidthStart(event.touches[0]);
      });

      it.addEventListener("touchmove", (event) => {
        event.preventDefault();
        settingWidthContinue(event.touches[0]);
      });

      it.addEventListener("touchend", (event) => {
        event.preventDefault();
        settingWidthEnd(event.touches[0]);
      });
    });
  }

  function selectColor(event) {
    strokeStyle = event.currentTarget.getAttribute("data-color");
    colorSelectedIndex = parseInt(
      event.currentTarget.getAttribute("data-selected")
    );
    currentColorElement = event.currentTarget;
    colorsElement.forEach((it) => {
      it.classList.remove("selected");
    });
    event.currentTarget.classList.add("selected");
  }

  function settingWidthStart(event) {
    isSettingWidth = true;
    settingWidthPrevY = event.clientY;
  }

  function settingWidthContinue(event) {
    if (!isSettingWidth) {
      return;
    }
    let diffY = event.clientY - currentColorElement.getBoundingClientRect().y;
    if (diffY < -15) {
      lineWidth = Math.floor(-diffY / 30) * 2;
      if (lineWidth > 21) {
        lineWidth = 21;
      }
      if (lineWidth < 1) {
        lineWidth = 1;
      }
    } else {
      lineWidth = 1;
    }
    colorsElement.forEach((it) => {
      it.setAttribute(
        "style",
        `background-color:${it.getAttribute("data-color")};outline-offset:-${
          1 - lineWidth / 30
        }rem`
      );
    });
  }

  function settingWidthEnd(event) {
    isSettingWidth = false;
  }

  function init() {
    currentPadIndex = 0;
    padElements.forEach((it) => {
      let context = it.getContext("2d");
      context.canvas.width = window.innerWidth;
      context.canvas.height = window.innerHeight;
    });

    let context = drawingPadElement.getContext("2d");
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;

    colorsElement.forEach((it) => {
      it.setAttribute(
        "style",
        `background-color: ${it.getAttribute("data-color")}`
      );
    });
  }

  function drawStart(event) {
    isDrawing = true;
    currX = event.clientX - padElement.offsetLeft;
    currY = event.clientY - padElement.offsetTop;
    prevX = currX;
    prevY = currY;
    beginX = currX;
    beginY = currY;

    currentPath = new Path2D();
    currentPath.moveTo(currX, currY);

    padElements.forEach((it) => {
      let context = it.getContext("2d");
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;
      context.fillStyle = strokeStyle;
    });
  }

  function drawContinue(event) {
    if (isDrawing) {
      prevX = currX;
      prevY = currY;
      currX = event.clientX - padElement.offsetLeft;
      currY = event.clientY - padElement.offsetTop;

      // context.moveTo(prevX, prevY);
      currentPath.lineTo(currX, currY);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      // context.stroke(currentPath);
      strokeLine(padElement, currentPath, beginX, beginY, currX, currY);
    }
  }

  function drawEnd(event) {
    window.test = currentPath;
    if (isDrawing) {
      // context.closePath();
      isDrawing = false;
      let nextPadIndex = (currentPadIndex + 1) % padElements.length;
      if (beginX == currX && beginY == currY) {
        console.log("hi!");
        fillCircle(padElements[nextPadIndex], currX, currY, lineWidth / 2);
      }
      strokeLine(
        padElements[nextPadIndex],
        currentPath,
        beginX,
        beginY,
        currX,
        currY
      );
      eraseCanvas(padElements[currentPadIndex]);
    }
  }

  function fillCircle(canvas, x, y, radius) {
    let context = canvas.getContext("2d");
    let path = new Path2D();
    path.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fill(path);
  }

  function strokeLine(canvas, path, beginX, beginY, endX, endY) {
    let context = canvas.getContext("2d");
    fillCircle(canvas, beginX, beginY, lineWidth / 2);
    fillCircle(canvas, endX, endY, lineWidth / 2);
    context.stroke(path);
  }

  function eraseAll() {
    padElements.forEach((it) => {
      let context = it.getContext("2d");
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });
  }

  function eraseCanvas(it) {
    let context = it.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  setEventListeners();
  init();
  currentColorElement = colorsElement[0];
};
