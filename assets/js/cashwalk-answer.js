window.onload = async () => {
  const homeUrl = "https://trouvaillle.github.io/app";
  const cashwalkAnswerUrl = 'https://luckyquiz3.blogspot.com/search/label/%EC%BA%90%EC%8B%9C%EC%9B%8C%ED%81%AC%20%EB%8F%88%EB%B2%84%EB%8A%94%ED%80%B4%EC%A6%88?&max-results=30';

  const schema = window.location.href.split('://')[0]
    .toLowerCase()
    .includes('http') ?
      window.location.href.split('://')[0].toLowerCase() : 
      'http';
  const proxies = [
    {
      'url': `${schema}://www.whateverorigin.org/get?url=`,
      'urlEncode': true
    },
    {
      'url': `${schema}://proxy.cors.sh/`,
      'urlEncode': false
    }
  ]
  let proxyIndex = 0;

  /*
  const whateveroriginUrl = `${window.location.href.split('://')[0].toLowerCase().includes('http') ?
    window.location.href.split('://')[0].toLowerCase() : 'http'
    }://crossorigin.me/`;
  */
  const backElement = document.querySelector("#back");
  const headerElement = document.querySelector("#header");
  const spanTitleElement = document.querySelector('#spanTitle');
  const contentElement = document.querySelector("#content");
  const answersElement = document.querySelector("#answers");
  const spinnerElements = document.querySelectorAll(".spinner");
  const searchElement = document.querySelector("#search");
  const refreshElement = document.querySelector("#refresh");

  let answers = [];
  let busy = false;
  let updatedMax = '';

  function setEventListeners() {
    backElement.addEventListener("click", (event) => {
      window.location.href = homeUrl;
    });
    spanTitleElement.addEventListener("click", (event) => {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    });
    headerElement.addEventListener("click", (event) => {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    });
    refreshElement.addEventListener("click", async (event) => {
      if (!busy) {
        init();
        await startPulling();
      }
    });

    contentElement.addEventListener("scroll", async (event) => {
      if (contentElement.scrollTop > 10) {
        headerElement.setAttribute('style', 'background-color: #ffffff13;');
        if (contentElement.scrollTop > contentElement.scrollHeight - window.innerHeight - 10) {
          if (!busy) {
            await startPulling();
          }
        }
      } else {
        headerElement.removeAttribute('style');
      }
    });

    searchElement.addEventListener("input", (event) => {
      for (let i of answers) {
        if (event.currentTarget.value.trim().length == 0) {
          i['ref'].setAttribute('data-visible', true);
        } else {
          i['ref'].setAttribute('data-visible', JSON.stringify(i).toLowerCase().includes(event.currentTarget.value.trim().toLowerCase()));
        }

        if (i['ref'].getAttribute('data-visible') == 'true') {
          i['ref'].removeAttribute('style');
        } else {
          i['ref'].setAttribute('style', 'display: none;');
        }
      }
    });
  }

  async function startPulling() {
    busy = true;
    refreshElement.removeAttribute('style');
    spinnerElements.forEach(it => it.removeAttribute('style'));
    await getAnswers(updatedMax);
    updatedMax = answers[answers.length - 1]['datetimeText'];
    spinnerElements.forEach(it => it.setAttribute('style', 'display: none;'));
    refreshElement.setAttribute('style', 'display: block');
    busy = false;

    /*
    for (let i = 0; i < answers.length; ++i) {
      let item = createItem(answers[i]['title'], answers[i]['question'], answers[i]['answer'], 'date');

      answersElement.appendChild(item);
    }
    */
  }

  function createItem(title, body, answer, date, dataVisible = true) {
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

    bodyElement.setAttribute('style', 'display: none;');

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

    liElement.setAttribute('data-expanded', false);
    liElement.setAttribute('data-visible', dataVisible);

    if (!dataVisible) {
      liElement.setAttribute('style', 'display: none;');
    }

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

  async function getAnswers(updatedMax) {
    let templateElement = await retry(() => { return getPage(cashwalkAnswerUrl, updatedMax); }, 10);
    let articleList = templateElement.querySelectorAll('div.blog-posts.hfeed.index-post-wrap > article');
    let result = [];
    for (let i of Array.from(articleList)) {
      let response = await getItemFromArticle(i);

      for (let j of response) {
        let dataVisible = true;
        if (searchElement.value.trim().length != 0) {
          dataVisible = JSON.stringify(j).toLowerCase().includes(searchElement.value.trim().toLowerCase());
        }
        let item = createItem(j['title'], j['question'], j['answer'], 'date', dataVisible);
        answersElement.appendChild(item);
        result.push({ ...j, ref: item });
        answers.push({ ...j, ref: item });
      }
    }
    return result;
  }

  async function getItemFromArticle(article) {
    let datetimeText = article.querySelector('.entry-time > time').getAttribute('datetime'); // '2022-03-31T11:30:00+09:00'

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
          datetimeText,
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
    let templateElement = await retry(() => { return getPage(url); }, 10);
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

  /* delay: ms */
  async function retry(func, count, delay = 100) {
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
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
      }
      let errorCause = `retries exhausted: ${count}/${count}`;
      // console.error(errorCause);
      debugPrint(errorCause);
      reject(errorCause);
    });
  }

  async function getPage(url, updatedMax = '') {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let proxyUrl = proxies[proxyIndex].url;
      let proxyPath = `${url}${updatedMax.trim().length != 0 ? 
            `&updated-max=${encodeURIComponent(updatedMax)}` : 
            ''
        }`;
      if (proxies[proxyIndex].urlEncode) {
        proxyPath = encodeURIComponent(proxyPath);
      }
      let targetUrl = `${proxyUrl}${proxyPath}`;
      xhr.open('GET', targetUrl);
      // xhr.setRequestHeader('origin', 'https://luckyquiz3.blogspot.com');
      // xhr.setRequestHeader('X-Requested-With', 'XMLHTTPRequest');
      xhr.onload = (event) => {
        let result = '';
        switch (proxyIndex) {
          case 0:
            result = JSON.parse(event.currentTarget.responseText).contents;;
            break;
          case 1:
          default:
            result = event.currentTarget.responseText;
            break;
        }
        let templateElement = document.createElement('template');
        templateElement.innerHTML = result;
        proxyIndex = (proxyIndex + 1) % proxies.length;
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

  function init() {
    answers.forEach(it => it['ref'].remove());
    answers = [];
    updatedMax = '';
  }

  setEventListeners();
  init();
  await startPulling();
};
