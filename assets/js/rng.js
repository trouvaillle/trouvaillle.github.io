window.onload = () => {
  const mersenneTwister = new MersenneTwister();
  let number = 0;
  let startTime = null;
  let beforeTime = null;

  const url = "https://trouvaillle.github.io";

  const localStorageIdOfNumber = "trouvaillle.github.io/app/counter.number";
  const localStorageIdOfStartTime =
    "trouvaillle.github.io/app/counter.startTime";
  const localStorageIdOfBeforeTime =
    "trouvaillle.github.io/app/counter.beforeTime";

  const buttonShuffleElement = document.querySelector("#buttonShuffle");
  const buttonCopyElement = document.querySelector("#buttonCopy");
  const targetElement = document.querySelector("#target");
  const boardElement = document.querySelector("#board");
  const backElement = document.querySelector("#back");
  const menuElement = document.querySelector("#menu");
  const messageElement = document.querySelector("#message");

  buttonShuffleElement.addEventListener("click", (event) => {
    shuffleText();
  });

  buttonCopyElement.addEventListener("click", (event) => {
    copyText();
  });

  menuElement.addEventListener("click", (event) => {
    // setNumber(0);
  });

  backElement.addEventListener("click", (event) => {
    window.location.href = url;
  });

  targetElement.addEventListener("dblclick", (event) => {
    // setNumber(0);
  });

  boardElement.addEventListener("dblclick", (event) => {
    // setNumber(0);
  });

  function getStorage() {
    getNumber();
    getStartTime();
    getBeforeTime();
  }

  function getStartTime() {
    startTime = localStorage.getItem(localStorageIdOfStartTime);
    if (startTime == null) {
      startTime = new Date().getTime();
    }
    showElaspedTime();
  }

  function getBeforeTime() {
    beforeTime = localStorage.getItem(localStorageIdOfBeforeTime);
    showElaspedTime();
  }

  function getNumber() {
    number = localStorage.getItem(localStorageIdOfNumber);
    if (number == null) {
      number = 0;
    } else {
      number = parseInt(number);
      setNumber(number);
    }
  }

  function getRandomText(length) {
    let result = "";
    let arrDict = [];
    const useLowerCase = true;
    const useUpperCase = true;
    const useNumber = true;
    const useSpecialChars = false;
    if (useLowerCase) {
      for (let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); ++i) {
        arrDict.push(String.fromCharCode(i));
      }
    }
    if (useUpperCase) {
      for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); ++i) {
        arrDict.push(String.fromCharCode(i));
      }
    }
    if (useNumber) {
      for (let i = "0".charCodeAt(0); i <= "9".charCodeAt(0); ++i) {
        arrDict.push(String.fromCharCode(i));
      }
    }
    for (let i = 0; i < length; ++i) {
      let rnd = Math.floor(mersenneTwister.random() * arrDict.length);
      result += arrDict[rnd];
    }

    return result;
  }

  function shuffleText() {
    let randomText = getRandomText(24);
    targetElement.setAttribute("value", randomText);
  }

  function copyText() {
    navigator.clipboard
      .writeText(targetElement.getAttribute("value"))
      .then(function () {});
    messageElement.innerHTML = "copied!";
    setTimeout(() => {
      messageElement.innerHTML = "";
    }, 500);
  }

  function minusNumber() {
    if (number > 0) {
      setNumber(number - 1);
    } else {
      setStartTime(new Date().getTime());
    }
  }

  function setNumber(value) {
    if (value == 0) {
      setStartTime(new Date().getTime());
    }
    number = value;
    localStorage.setItem(localStorageIdOfNumber, number);
    numberElement.innerHTML = number.toString();
    showElaspedTime();
  }

  function setStartTime(value) {
    startTime = value;
    localStorage.setItem(localStorageIdOfStartTime, value);
    showElaspedTime();
  }

  function setBeforeTime(value) {
    beforeTime = value;
    localStorage.setItem(localStorageIdOfBeforeTime, value);
    showElaspedTime();
  }

  function showElaspedTime() {
    if (startTime == null) {
      elapsedTimeElement.innerHTML = "0:00.00";
    } else {
      let elapsedTime = new Date().getTime() - startTime;
      let minute = Math.floor(elapsedTime / 1000 / 60);
      let second = Math.floor(elapsedTime / 1000) - minute * 60;
      let milisecond = elapsedTime - second * 1000;
      elapsedTimeElement.innerHTML =
        minute +
        ":" +
        ("0" + second).slice(-2) +
        "." +
        ("00" + milisecond).slice(-3).slice(0, 2);
    }
  }

  /* document.body.addEventListener(
    "wheel",
    (event) => {
      const { ctrlKey } = event;
      if (ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false }
  ); */

  // getStorage();

  shuffleText();

  /* setInterval(() => {
    showElaspedTime();
  }, 100); */
};
