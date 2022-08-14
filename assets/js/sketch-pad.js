window.onload = async () => {
  const url = "https://trouvaillle.github.io/app";

  const backElement = document.querySelector("#back");
  const padElement = document.querySelector("#pad");
  const context = padElement.getContext("2d");
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

  function setEventListeners() {
    backElement.addEventListener("click", (event) => {
      window.location.href = url;
    });

    eraseAllElement.addEventListener("click", (event) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });

    padElement.addEventListener("mousedown", (event) => {
      event.preventDefault();
      drawStart(event);
    });

    padElement.addEventListener("mousemove", (event) => {
      event.preventDefault();
      drawContinue(event);
    });

    padElement.addEventListener("mouseup", (event) => {
      event.preventDefault();
      drawEnd(event);
    });

    padElement.addEventListener("mouseout", (event) => {
      event.preventDefault();
      drawEnd(event);
    });

    padElement.addEventListener("touchstart", (event) => {
      event.preventDefault();
      drawStart(event.touches[0]);
    });

    padElement.addEventListener("touchmove", (event) => {
      event.preventDefault();
      drawContinue(event.touches[0]);
    });

    padElement.addEventListener("touchend", (event) => {
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
      if (lineWidth > 7) {
        lineWidth = 7;
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
          1 - lineWidth / 12
        }rem`
      );
    });
  }

  function settingWidthEnd(event) {
    isSettingWidth = false;
  }

  function init() {
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

    currentPath = new Path2D();
    currentPath.moveTo(currX, currY);

    context.beginPath();
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
  }

  function drawContinue(event) {
    if (isDrawing) {
      prevX = currX;
      prevY = currY;
      currX = event.clientX - padElement.offsetLeft;
      currY = event.clientY - padElement.offsetTop;

      // context.moveTo(prevX, prevY);
      currentPath.lineTo(currX, currY);
      context.stroke(currentPath);
    }
  }

  function drawEnd(event) {
    if (isDrawing) {
      // context.closePath();
      isDrawing = false;
    }
  }

  setEventListeners();
  init();
  currentColorElement = colorsElement[0];
};
