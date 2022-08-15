window.onload = async () => {
  const url = "https://trouvaillle.github.io/app";

  const MAX_HISTORIES = 128;

  const backElement = document.querySelector("#back");
  const drawingPadElement = document.querySelector("#drawingPad");
  const headerElement = document.querySelector("#header");
  const padElements = document.querySelectorAll(".pad");
  const saveElement = document.querySelector("#save");
  const undoElement = document.querySelector("#undo");
  const eraseAllElement = document.querySelector("#eraseAll");
  const colorListElement = document.querySelector("#colorList");

  const strokeStyles = [
    "white",
    "red",
    "orange",
    "green",
    "blue",
    "magenta",
    "eraser",
  ];

  let colorsElements = [];
  let colorsInnerElements = [];

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
  let histories = [];

  function setEventListeners() {
    backElement.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = url;
    });

    eraseAllElement.addEventListener("click", (event) => {
      event.preventDefault();
      let nextPadIndex = (currentPadIndex + 1) % padElements.length;
      histories.push(getImageData(padElements[nextPadIndex]));
      eraseAll();
    });

    eraseAllElement.addEventListener("dblclick", (event) => {
      event.preventDefault();
    });

    headerElement.addEventListener("dblclick", (event) => {
      event.preventDefault();
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

    undoElement.addEventListener("click", (event) => {
      event.preventDefault();
      if (event.currentTarget.classList.contains("canUndo")) {
        if (histories.length != 0) {
          let nextPadIndex = (currentPadIndex + 1) % padElements.length;
          eraseCanvas(padElements[nextPadIndex]);
          let pop = histories.pop();
          if (pop != null) {
            padElements[nextPadIndex].getContext("2d").putImageData(pop, 0, 0);
          }
        }
        if (histories.length == 0) {
          event.currentTarget.classList.remove("canUndo");
        }
      }
    });

    undoElement.addEventListener("dblclick", (event) => {
      event.preventDefault();
    });

    saveElement.addEventListener("click", (event) => {
      event.preventDefault();
      let nextPadIndex = (currentPadIndex + 1) % padElements.length;
      let filename = `${getFormmatedDate(new Date())}.png`;
      let link = document.createElement("a");
      link.download = filename;
      link.href = padElements[nextPadIndex].toDataURL();
      link.click();
    });

    saveElement.addEventListener("dblclick", (event) => {
      event.preventDefault();
    });

    window.addEventListener("resize", (event) => {
      init();
    });
  }

  function setColorsEventListeners(it) {
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
  }

  function selectColor(event) {
    strokeStyle = event.currentTarget.getAttribute("data-color");
    if (strokeStyle == "eraser") {
      strokeStyle = "black";
    }
    colorSelectedIndex = parseInt(
      event.currentTarget.getAttribute("data-index")
    );
    currentColorElement = event.currentTarget;
    colorsElements.forEach((it) => {
      it.classList.remove("selected");
    });
    event.currentTarget.classList.add("selected");

    colorsInnerElements.forEach((it) => {
      it.classList.remove("selected");
    });
    colorsInnerElements[colorSelectedIndex].classList.add("selected");
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
    if (diffY >= 0) {
      return;
    }
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
    setColorsInnerByLineWidth();
  }

  function setColorsInnerByLineWidth() {
    colorsInnerElements.forEach((it) => {
      it.setAttribute(
        "style",
        `width:${100 * (lineWidth / 30)}%;height:${100 * (lineWidth / 30)}%;`
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

    colorListElement.innerHTML = "";
    colorsElements = [];
    colorsInnerElements = [];
    let index = 0;

    strokeStyles.forEach((it) => {
      let divColors = document.createElement("div");
      divColors.setAttribute("data-index", index);
      divColors.setAttribute("data-color", it);
      if (it != "eraser") {
        divColors.setAttribute("style", `background-color: ${it}`);
      } else {
        divColors.setAttribute(
          "style",
          `background: repeating-conic-gradient(white 0% 25%, gray 0% 50%) 50% / 5vw 5vw`
        );
      }
      divColors.className = "colors";
      index += 1;

      let divColorsInner = document.createElement("div");
      divColorsInner.setAttribute("style", "width: 50%; height: 50%;");
      divColorsInner.className = "colorsInner";

      divColors.appendChild(divColorsInner);
      colorListElement.appendChild(divColors);

      colorsElements.push(divColors);
      colorsInnerElements.push(divColorsInner);
      setColorsEventListeners(divColors);
    });
    colorsElements[colorSelectedIndex].classList.add("selected");
    colorsInnerElements[colorSelectedIndex].classList.add("selected");

    setColorsInnerByLineWidth();

    eraseAll();
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

      currentPath.lineTo(currX, currY);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      strokeLine(padElement, currentPath, beginX, beginY, currX, currY);
    }
  }

  function drawEnd(event) {
    window.test = currentPath;
    if (isDrawing) {
      isDrawing = false;
      let nextPadIndex = (currentPadIndex + 1) % padElements.length;
      histories.push(getImageData(padElements[nextPadIndex]));
      if (beginX == currX && beginY == currY) {
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
      if (histories.length != 0) {
        undoElement.classList.add("canUndo");
      }
      if (histories.length > MAX_HISTORIES) {
        histories.splice(0, 1);
      }
    }
  }

  function getImageData(canvas) {
    let context = canvas.getContext("2d");
    return context.getImageData(
      0,
      0,
      context.canvas.width,
      context.canvas.height
    );
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
    let nextPadIndex = (currentPadIndex + 1) % padElements.length;
    let context = padElements[nextPadIndex].getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  function eraseCanvas(it) {
    let context = it.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  function getFormmatedDate(date) {
    return (
      date.getFullYear().toString() +
      "-" +
      ("0" + (date.getMonth() + 1).toString()).slice(-2) +
      "-" +
      ("0" + date.getDate()).slice(-2) +
      "T" +
      ("0" + date.getHours()).slice(-2) +
      "-" +
      ("0" + date.getMinutes()).slice(-2) +
      "-" +
      ("0" + date.getSeconds()).slice(-2) +
      "." +
      ("00" + date.getMilliseconds()).slice(-3)
    );
  }

  init();
  setEventListeners();
  currentColorElement = colorsElements[0];
};
