window.onload = async () => {
  const url = "https://trouvaillle.github.io/app";
  const cashwalkAnswerUrl = 'https://luckyquiz3.blogspot.com/search/label/%EC%BA%90%EC%8B%9C%EC%9B%8C%ED%81%AC%20%EB%8F%88%EB%B2%84%EB%8A%94%ED%80%B4%EC%A6%88?&max-results=30';

  const whateveroriginUrl = `${window.location.href.split('://')[0].toLowerCase().includes('http') ?
    window.location.href.split('://')[0].toLowerCase() : 'http'
    }://www.whateverorigin.org/get?url=`;
  /*
  const whateveroriginUrl = `${window.location.href.split('://')[0].toLowerCase().includes('http') ?
    window.location.href.split('://')[0].toLowerCase() : 'http'
    }://crossorigin.me/`;
  */
  const backElement = document.querySelector("#back");
  const headerElement = document.querySelector("#header");
  const contentElement = document.querySelector("#content");
  const innerElement = document.querySelector("#inner");
  const answersElement = document.querySelector("#answers");
  const spinnerElement = document.querySelector("#spinner");

  let answers = [];

  function setEventListeners() {
    backElement.addEventListener("click", (event) => {
      window.location.href = url;
    });
    contentElement.addEventListener("scroll", (event) => {
      if (contentElement.scrollTop > 10) {
        headerElement.setAttribute('style', 'background-color: #ffffff13;');
      } else {
        headerElement.removeAttribute('style');
      }
    });
  }

  async function init() {
    answers = await getAnswers();
    /*
    for (let i = 0; i < answers.length; ++i) {
      let item = createItem(answers[i]['title'], answers[i]['question'], answers[i]['answer'], 'date');

      answersElement.appendChild(item);
    }
    */
    spinnerElement.setAttribute('style', 'display: none;');
  }

  function createItem(title, body, answer, date) {
    let liElement = document.createElement('li');
    let divElement = document.createElement('div');
    let innerDivElement = document.createElement('div');
    let titleElement = document.createElement('div');
    let bodyElement = document.createElement('div');
    let answerElement = document.createElement('div');
    let titleSpanElement = document.createElement('span');
    let bodySpanElement = document.createElement('span');
    let answerSpanElement = document.createElement('span');

    titleElement.classList = 'item-detail item-title';
    bodyElement.classList = 'item-detail item-body';
    answerElement.classList = 'item-detail item-answer';

    titleElement.addEventListener('click', (event) => {
      if (event.currentTarget.getAttribute('data-expanded') == 'true') {
        bodyElement.setAttribute('style', 'display: none;');
        event.currentTarget.setAttribute('data-expanded', false);
      } else {
        bodyElement.removeAttribute('style');
        event.currentTarget.setAttribute('data-expanded', true);
      }
    });

    // bodyElement.setAttribute('style', 'display: none;');

    titleSpanElement.innerText = title;
    bodySpanElement.innerText = body;
    answerSpanElement.innerText = answer;

    answerSpanElement.addEventListener('click', (event) => {
      copyToClipboard(answer);
      answerSpanElement.classList.add('copied');
      setTimeout(() => {
        answerSpanElement.classList.remove('copied');
      }, 600);
    })

    innerDivElement.className = 'item-content';

    divElement.className = 'item';

    liElement.setAttribute('data-expanded', true);

    titleElement.append(titleSpanElement);
    bodyElement.append(bodySpanElement);
    answerElement.append(answerSpanElement);
    innerDivElement.appendChild(titleElement);
    innerDivElement.appendChild(bodyElement);
    innerDivElement.appendChild(answerElement);
    divElement.appendChild(innerDivElement);
    liElement.appendChild(divElement);

    return liElement;
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

  async function getAnswers() {
    let templateElement = await retry(() => { return getPage(cashwalkAnswerUrl); }, 5);
    let articleList = templateElement.querySelectorAll('div.blog-posts.hfeed.index-post-wrap > article');
    let result = [];
    for (let i of Array.from(articleList)) {
      let response = await getItemFromArticle(i);
      result.concat(response);

      for (let j of response) {
        let item = createItem(j['title'], j['question'], j['answer'], 'date');
        answersElement.appendChild(item);
      }
    }
    return result;
  }

  async function getItemFromArticle(article) {
    let _lastDatetime = article.querySelector('.entry-time > time').attributes['datetime']; // '2022-03-31T11:30:00+09:00'

    let href = article.querySelector('.entry-title > a').getAttribute('href');
    if (href != null) {
      href = href.toString();
    }

    // title
    let title = article.querySelector('.entry-title').innerText.trim();
    let monthAndDay = [.../[\d]+[\s]*월[\s]*[\d]+[\s]*일/.exec(title)[0]
      .matchAll(/\d+/g)]
      .map(it => it[0]);
    // let datetime = Date(DateTime.now().year, int.parse(monthAndDay[0]),
    //  int.parse(monthAndDay[1]));
    let datetime = monthAndDay;
    // console.log(`${href}, ${datetime}, ${title}`);

    /*
    let dateFormatter = DateFormat(
      "yyyy-MM-dd(EEEEE)", Localizations.localeOf(context).toString());
      */

    // let quizDetail = await getQuizFromUrl(href);
    let quizDetail = await getQuizFromUrl(href, title);
    let listItem = [];
    for (let i of quizDetail) {
      listItem.push(
        {
          datetime,
          // datetimeText: translateWeekdayText(dateFormatter.format(datetime)),
          title,
          ...i
        }
      );
    }
    return listItem;
  }

  async function getQuizFromUrl(url, title) {
    let templateElement = await retry(() => { return getPage(url); }, 5);
    let quizArea = (() => {
      let innerHTML = templateElement.querySelector('#quizarea').innerHTML.replaceAll('<br>', '\n').replaceAll('<div>', '\n').replaceAll('</div>', '\n');
      let anotherTemplateElement = document.createElement('template');
      anotherTemplateElement.innerHTML = innerHTML;
      return Array.from(anotherTemplateElement.content.children)
        .map(it => it.innerText)
        .reduce((prev, curr) => `${prev}${curr}`)
        .split('\n')
        .map(it => it.replaceAll('ㅡ', ''))
        .filter(it => it.trim().length != 0);
    })();

    let answerStart = -1;
    let question = '';
    let pending = '';
    let answer = '';

    let result = [];

    for (var i of quizArea) {
      let trimmed = i.trim();
      if (trimmed.length != 0) {
        switch (answerStart) {
          case 0:
            if (trimmed.startsWith("정답")) {
              let middleText = getAnswerWords(trimmed);
              if (/[\d]*시(.)*공개/
                .test(trimmed.replaceAll(" ", ""))) {
                question = "";
                pending = trimmed;
                answer = "";
              } else {
                question = "";
                pending = "";
                answer = middleText;
              }
              result.push({ question, pending, answer });
              answerStart = -1;
            } else {
              question = trimmed;
              pending = "";
              answerStart++;
            }
            break;
          case 1:
            var middleText = getAnswerWords(trimmed);
            if (pending == "pending") {
              pending = middleText;
            } else {
              answer = middleText;
            }
            result.push({ question, pending, answer });
            answerStart = -1;
            break;
        }
      }
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        var itemTitle = trimmed.substring(1, trimmed.length - 1).trim();
        if (itemTitle == "퀴즈") {
          if (title.includes("캐시워크")) {
            itemTitle = title.substring(0, title.lastIndexOf("캐시워크")).trim();
            if (!itemTitle.endsWith("퀴즈")) {
              itemTitle += " 퀴즈";
            }
          } else {
            itemTitle = title;
          }
        }
        answerStart = 0;
      }
    }
    return result;
  }

  function getAnswerWords(wholeText) {
    let result = /(?<=정답은[\s]*)[^\s]+(.)*[^\s]+(?=[\s]*입니다)/
      .exec(wholeText);
    if (result != null) {
      result = result[0].trim();
    } else {
      result = /(?<=^(.)*(\s)+)(.)*(?=(\s)+(.)*$)/
        .exec(wholeText)
      if (result != null) {
        result = result[0].trim();
      }
    }
    return result;
  }

  async function retry(func, count) {
    return new Promise(async (resolve, reject) => {
      let result = undefined;
      for (let i = 0; i < count; ++i) {
        try {
          result = await func();
        } catch {
          result = undefined;
        }
        if (result !== undefined) {
          resolve(result);
          return;
        }
      }
      let errorCause = `retries exhausted: ${count}/${count}`;
      // console.error(errorCause);
      debugPrint(errorCause);
      reject(errorCause);
    });
  }

  async function getPage(url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', `${whateveroriginUrl}${encodeURIComponent(url)}`);
      xhr.onload = (event) => {
        let result = JSON.parse(event.currentTarget.responseText).contents;
        let templateElement = document.createElement('template');
        templateElement.innerHTML = result;
        resolve(templateElement.content);
      };
      xhr.onerror = (event) => {
        // console.error(event);
        debugPrint(event);
        window.test = event;
        reject(event);
      };
      try {
        xhr.send();
      } catch (exception) {
        // console.error(exception);
        debugPrint(exception);
      }
    });
  }

  function debugPrint(value) {
    // console.debug(value);
    /*
    let pElement = document.createElement('p');
    pElement.className = 'debug'
    pElement.innerText = JSON.stringify(value);
    innerElement.appendChild(pElement);
    */
  }

  setEventListeners();
  await init();
};
