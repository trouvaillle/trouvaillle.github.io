window.onload = () => {
  let number = 0;
  let startTime = null;
  let beforeTime = null;
  let beforeNumber = 0;

  const url = "https://trouvaillle.github.io/app";

  const localStorageIdOfNumber = "trouvaillle.github.io/app/counter.number";
  const localStorageIdOfStartTime =
    "trouvaillle.github.io/app/counter.startTime";
  const localStorageIdOfBeforeTime =
    "trouvaillle.github.io/app/counter.beforeTime";

  const buttonUpElement = document.querySelector("#buttonUp");
  const buttonDownElement = document.querySelector("#buttonDown");
  const numberElement = document.querySelector("#number");
  const counterElement = document.querySelector("#counter");
  const backElement = document.querySelector("#back");
  const resetElement = document.querySelector("#reset");
  const elapsedTimeElement = document.querySelector("#elapsedTime");

  buttonUpElement.addEventListener("click", (event) => {
    addNumber();
  });

  buttonDownElement.addEventListener("click", (event) => {
    minusNumber();
  });

  resetElement.addEventListener("click", (event) => {
    let tempNumber = number;
    setNumber(beforeNumber);
    beforeNumber = tempNumber;
  });

  backElement.addEventListener("click", (event) => {
    window.location.href = url;
  });

  numberElement.addEventListener("dblclick", (event) => {
    setNumber(0);
  });

  counterElement.addEventListener("dblclick", (event) => {
    setNumber(0);
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

  function addNumber() {
    beforeNumber = 0;
    setNumber(number + 1);
  }

  function minusNumber() {
    beforeNumber = 0;
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
      elapsedTimeElement.innerHTML = '0:00<small>.00</small>';
    } else {
      let elapsedTime = new Date().getTime() - startTime;
      let days = Math.floor(elapsedTime / 1000 / 60 / 60 / 24);
      let hours = Math.floor(elapsedTime / 1000 / 60 / 60);
      let minutes = Math.floor(elapsedTime / 1000 / 60);
      let seconds = Math.floor(elapsedTime / 1000) - minutes * 60;
      let miliseconds = elapsedTime - seconds * 1000;
      elapsedTimeElement.innerHTML =
        (days > 0 ? "<small>" + days + "d+</small> " : "") +
        (hours > 0 ? (days > 0 ? ("0" + hours).slice(-2) : hours) + ":" : "") +
        (hours > 0 ? ("0" + minutes).slice(-2) : minutes) +
        ":" +
        ("0" + seconds).slice(-2) +
        "<small>." +
        ("00" + miliseconds).slice(-3).slice(0, 2) +
        "</small>";
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

  getStorage();

  /* setInterval(() => {
    showElaspedTime();
  }, 100); */
};
