window.onload = () => {
  const mersenneTwister = new MersenneTwister();
  let number = 0;
  let xhr = undefined;

  const url = "https://trouvaillle.github.io/app";

  const localStorageIdOfNumber = "trouvaillle.github.io/app/counter.number";
  const localStorageIdOfStartTime =
    "trouvaillle.github.io/app/counter.startTime";
  const localStorageIdOfBeforeTime =
    "trouvaillle.github.io/app/counter.beforeTime";

  const buttonShuffleElement = document.querySelector("#buttonShuffle");
  const buttonCopyElement = document.querySelector("#buttonCopy");
  const targetElement = document.querySelector("#target");
  const randomTextElement = document.querySelector("#randomText");
  const backElement = document.querySelector("#back");
  const menuElement = document.querySelector("#menu");
  const messageElement = document.querySelector("#message");

  buttonShuffleElement.addEventListener("click", (event) => {
    shuffle();
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
    // copyText();
  });

  randomTextElement.addEventListener("dblclick", (event) => {
    // copyText();
  });

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
      let rnd = randBetween(0, arrDict.length - 1);
      result += arrDict[rnd];
    }

    return result;
  }

  function randBetween(lower, upper) {
    return Math.floor(mersenneTwister.random() * (upper - lower + 1)) + lower;
  }

  function shuffleText() {
    let randomText = getRandomText(24);
    targetElement.setAttribute("value", randomText);
  }

  function copyText() {
    copyToClipboard(targetElement.getAttribute("value"));
    messageElement.innerHTML = "copied!";
    messageElement.setAttribute("style", "opacity: 1;");
    setTimeout(() => {
      messageElement.setAttribute("style", "opacity: 0;");
      //messageElement.innerHTML = "";
    }, 500);
  }

  function copyToClipboard(value) {
    try {
      navigator.clipboard.writeText(value).then();
    } catch {
      let temp = document.createElement("textarea");
      temp.innerText = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
  }

  async function shuffleLottery() {
    let lotteryParentElement = document.querySelector("#lotteryParent");
    lotteryParentElement.innerHTML = "";
    let spinnerDiv = document.createElement("div");
    spinnerDiv.className = "spinner";
    lotteryParentElement.appendChild(spinnerDiv);
    let numbers = await getNumbersByRandomOrg();
    spinnerDiv.remove();
    for (let i = 0; i < 6; ++i) {
      let lotteryChild = document.createElement("li");
      let num = numbers[i];
      lotteryChild.className = "lotteryNumber";
      lotteryChild.innerText = num;
      if (num <= 10) {
        lotteryChild.setAttribute(
          "style",
          "background-color: #fbc400; text-shadow: 0px 0px 3px rgb(73 57 0 / 80%);"
        );
      } else if (num <= 20) {
        lotteryChild.setAttribute(
          "style",
          "background-color: #69c8f2; text-shadow: 0px 0px 3px rgb(0 49 70 / 80%);"
        );
      } else if (num <= 30) {
        lotteryChild.setAttribute(
          "style",
          "background-color: #ff7272; text-shadow: 0px 0px 3px rgb(64 0 0 / 80%);"
        );
      } else if (num <= 40) {
        lotteryChild.setAttribute(
          "style",
          "background-color: #aaaaaa; text-shadow: 0px 0px 3px rgb(61 61 61 / 80%);"
        );
      } else if (num <= 50) {
        lotteryChild.setAttribute(
          "style",
          "background-color: #b0d840; text-shadow: 0px 0px 3px rgb(41 56 0 / 80%);"
        );
      }
      lotteryParentElement.appendChild(lotteryChild);
      if (i == 3) {
        lotteryParentElement.appendChild(document.createElement("br"));
      }
    }
  }

  function getNumbers() {
    let result = [];
    for (let i = 0; i < 64; ++i) {
      let num = randBetween(1, 45);
      if (!result.includes(num)) {
        result.push(num);
        if (result.length == 6) {
          break;
        }
      }
    }
    return result.sort((a, b) => a - b);
  }

  function getNumbersByRandomOrg() {
    return new Promise((resolve) => {
      if (xhr !== undefined) {
        xhr.abort();
      }
      xhr = new XMLHttpRequest();
      xhr.onload = (event) => {
        let response = event.currentTarget.responseText
          .replace("\n", "")
          .trim()
          .split("\t");
        let result = [];
        for (let i of response) {
          if (!result.includes(i)) {
            result.push(i);
            if (result.length == 6) {
              break;
            }
          }
        }
        resolve(result.sort((a, b) => a - b));
      };
      xhr.onerror = () => {
        resolve(getNumbers());
      };
      xhr.open(
        "GET",
        "https://www.random.org/integers/?num=64&min=1&max=45&col=64&base=10&format=plain"
      );
      xhr.send();
    });
  }

  function shuffle() {
    shuffleText();
    shuffleLottery();
  }

  shuffle();
};
