window.onload = () => {

    const {
        faceWidth,
        romanize
    } = define();

    const {
        faceElement,
        faceInnerElement,
        indexNumberUL,
        indexLineOuter,
        indexLineOuterUL,
        indexLineInner,
        hourElement,
        minuteElement,
        secondElement,
        dateOuterElement,
        dateInnerElement,
        handsCircleElement,
        caseElement,
        bezelElement,
        glassElement,
        extrudeElement
    } = getElements();

    let dialColor = 'white';
    let indexColor = 'black';
    let handsColor = 'black';
    let glowColor = '#D7E1C3';
    let hz = 10;

    let linkedHourElement = hourElement;
    let linkedMinuteElement = minuteElement;
    let linkedSecondElement = secondElement;
    let linkedSubhand1Element = null;
    let linkedSubhand2Element = null;
    let linkedSubhand3Element = null;

    let chronographWork = false;
    let chronographStartTime = null;
    let chronographMillis = 0;
    let chronographLastSaved = 0;

    loadData();
    setDial('speedmaster');
    clockwork();

    function loadData() {
        chronographMillis = window.localStorage.getItem('trouvaille.github.io/clock/chronographMillis');
        if (chronographMillis === null || chronographMillis === undefined) {
            chronographMillis = 0;
        } else {
            chronographMillis = +chronographMillis;
        }
    }

    function saveData() {
        window.localStorage.setItem('trouvaille.github.io/clock/chronographMillis', `${chronographMillis}`);
    }

    function define() {
        const faceWidth = getComputedStyle(document.documentElement)
            .getPropertyValue('--faceWidth');

        const romanize = (num) => {
            if (isNaN(num))
                return NaN;
            var digits = String(+num).split(""),
                key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
                    "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
                    "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
                roman = "",
                i = 3;
            while (i--)
                roman = (key[+digits.pop() + (i * 10)] || "") + roman;
            return Array(+digits.join("") + 1).join("M") + roman;
        }

        return {
            faceWidth,
            romanize
        };
    }

    function getElements() {
        const faceElement = document.querySelector('#face');
        const faceInnerElement = document.querySelector('#face-inner');

        const indexNumberUL = document.querySelector('#index-number > ul');
        const indexLineOuter = document.querySelector('#index-line-outer');
        const indexLineOuterUL = document.querySelector('#index-line-outer > ul');
        const indexLineInner = document.querySelector('#index-line-inner');

        const hourElement = document.querySelector('#hour');
        const minuteElement = document.querySelector('#minute');
        const secondElement = document.querySelector('#second');

        const dateOuterElement = document.querySelector('#day-outer');
        const dateInnerElement = document.querySelector('#day-inner');

        const handsCircleElement = document.querySelector('#hands-circle');

        const caseElement = document.querySelector('#case');
        const bezelElement = document.querySelector('#bezel');
        const glassElement = document.querySelector('#glass');
        const extrudeElement = document.querySelector('#extrude');

        return {
            faceElement,
            faceInnerElement,
            indexNumberUL,
            indexLineOuter,
            indexLineOuterUL,
            indexLineInner,
            hourElement,
            minuteElement,
            secondElement,
            dateOuterElement,
            dateInnerElement,
            handsCircleElement,
            caseElement,
            bezelElement,
            glassElement,
            extrudeElement
        };
    }

    function setDial(type) {
        switch (type?.trim()?.toLowerCase()) {
            case 'prague':
                setDialPrague();
                break;
            case 'speedmaster':
                setDialSpeedMaster();
                break;
            default:
                setDialPrague();
                break;
        }
    }

    function clockwork() {
        const worker = () => {
            const now = new Date();

            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const millseconds = now.getMilliseconds();

            linkedHourElement?.setAttribute('style',
                `transform: rotateZ(${2 * Math.PI / 12 * (hours + minutes / 60 + seconds / 3600)}rad);`
            );

            linkedMinuteElement?.setAttribute('style',
                `transform: rotateZ(${2 * Math.PI / 60 * (minutes + seconds / 60 + millseconds / 60000)}rad);`
            );

            linkedSecondElement?.setAttribute('style',
                `transform: rotateZ(${2 * Math.PI / 60 * (seconds + millseconds / 1000)}rad);`
            );

            const date = now.getDate();
            if (dateInnerElement.innerText !== `${date}`) {
                dateInnerElement.innerText = date;
            }

            let elapsedTotalMilliseconds = 0;
            if (chronographWork && chronographStartTime !== null) {
                elapsedTotalMilliseconds = (new Date()) - chronographStartTime;
            } else {
                elapsedTotalMilliseconds = chronographMillis;
            }
            const elapsedMilliseconds = Math.floor(elapsedTotalMilliseconds) % 1000;
            const elapsedSeconds = Math.floor(elapsedTotalMilliseconds / 1000) % 60;
            const elapsedMinutes = Math.floor(elapsedTotalMilliseconds / 60000) % 60;
            const elapsedHours = Math.floor(elapsedTotalMilliseconds / 3600000);

            chronographMillis = elapsedTotalMilliseconds;
            if (elapsedMinutes + Math.floor(elapsedSeconds / 10) !== chronographLastSaved) {
                chronographLastSaved = elapsedMinutes + Math.floor(elapsedSeconds / 10);
                saveData();
            }

            linkedSubhand1Element?.setAttribute('style',
                `transform: rotateZ(${2 * Math.PI / 60 * (elapsedSeconds + elapsedMilliseconds / 1000)}rad);`
            );
            linkedSubhand2Element?.setAttribute('style',
                `transform: rotateZ(${2 * Math.PI / 30 * (elapsedMinutes + elapsedSeconds / 60 + elapsedMilliseconds / 60000)}rad);`
            );
            linkedSubhand3Element?.setAttribute('style',
                `transform: rotateZ(${2 * Math.PI / 12 * (elapsedHours + elapsedMinutes / 60 + elapsedSeconds / 3600)}rad);`
            );
        };
        const timer = setInterval(worker, 1000 / hz);

        worker();
        return timer;
    }

    function setDialPrague() {
        dialColor = 'white';
        indexColor = 'black';
        handsColor = 'black';
        glowColor = 'white';
        hz = 10;

        linkedHourElement = hourElement;
        linkedMinuteElement = minuteElement;
        linkedSecondElement = secondElement;

        linkedSubhand1Element = null;
        linkedSubhand2Element = null;
        linkedSubhand3Element = null;

        faceElement.setAttribute('style', `background: ${dialColor};`);
        indexLineOuter.setAttribute('style', 'width: 94%; height: 94%; margin: 3%; border: calc(var(--faceWidth) * 0.003) solid black; ');
        indexLineInner.setAttribute('style', 'border: calc(var(--faceWidth) * 0.003) solid black;');

        handsCircleElement.innerHTML = '';
        handsCircleElement.setAttribute('style', `width: calc(${faceWidth} * 0.015); height: calc(${faceWidth} * 0.015); background: black;`);

        [...Array(12).keys()].forEach(it => {
            const child = document.createElement('li');
            child.setAttribute('style', `position: absolute; ` +
                `width: 88%;` +
                `height: 88%;` +
                `margin: 6%;` +
                `text-align: center;` +
                `transform: rotateZ(${2 * Math.PI / 12 * (it + 1)}rad);`);
            child.innerText = `${romanize(it + 1)}`;
            indexNumberUL.appendChild(
                child
            );
        });

        [...Array(60).keys()].forEach(it => {
            const child = document.createElement('li');
            const childInner = document.createElement('div');

            child.setAttribute(
                'style',
                `position: absolute; ` +
                `display: flex; ` +
                `width: 100%; ` +
                `height: 100%; ` +
                `margin: 0; ` +
                `justify-content: center; ` +
                `transform: rotateZ(${2 * Math.PI / 60 * (it)}rad);`
            );
            const childInnerWidth = (it % 5 == 0 ? `calc(${faceWidth} * 0.006)` : `calc(${faceWidth} * 0.003)`);
            childInner.setAttribute('style', `width: ${childInnerWidth}; height: calc(${faceWidth} * 0.02); background: black;`);

            child.appendChild(childInner);
            indexLineOuterUL.appendChild(
                child
            );
        });

        // hour
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.006)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            childInner.setAttribute('style', `position: absolute; top: 50%; width: 100%; height: 50%; background: ${handsColor};`);

            child.appendChild(childInner);

            hourElement.innerHTML = '';
            hourElement.appendChild(child);
        })();

        // minute
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.006)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            childInner.setAttribute('style', `position: absolute; top: 15%; width: 100%; height: 85%; background: ${handsColor};`);

            child.appendChild(childInner);

            minuteElement.innerHTML = '';
            minuteElement.appendChild(child);
        })();

        // second
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.006)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            childInner.setAttribute('style', `position: absolute; top: 15%; width: 100%; height: 85%; background: ${handsColor};`);

            child.appendChild(childInner);

            secondElement.innerHTML = '';
            secondElement.appendChild(child);
        })();
    }

    function setDialSpeedMaster() {
        dialColor = '#282828';
        indexColor = 'rgba(230, 230, 230, 255)';
        handsColor = 'rgba(245, 245, 245, 255)';
        glowColor = '#D7E1C3';
        hz = 6;

        linkedHourElement = hourElement;
        linkedMinuteElement = minuteElement;
        linkedSecondElement = null;

        linkedSubhand1Element = secondElement;
        linkedSubhand2Element = null;
        linkedSubhand3Element = null;

        faceElement.setAttribute('style', `background: linear-gradient(135deg, #515151, #1C1C1C);`);
        faceInnerElement.setAttribute('style',
            `width: 79.2142%; ` +
            `height: 79.2142%; margin: 10.3929%; ` +
            `background: background: linear-gradient(135deg, #353535, #272727);` +
            `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
        );

        indexLineOuter.setAttribute('style', 'width: 100%; height: 100%; margin: 0%; border: none; background-image: none;');
        indexLineInner.setAttribute('style', 'border: none; background-image: none;');
        dateOuterElement.setAttribute('style', 'display: none');

        handsCircleElement.innerHTML = '';
        handsCircleElement.setAttribute('style',
            `position: relative;` +
            `display: flex;` +
            `justify-content: center;` +
            `margin: auto;` +
            `width: calc(${faceWidth} * 0.0925221799); height: calc(${faceWidth} * 0.0925221799); background: white; z-index: 4;` +
            `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
        );

        [...Array(12 * 5 * 3).keys()].forEach(it => {
            const child = document.createElement('li');
            const childInner = document.createElement('div');
            const childInnerInner = document.createElement('div');

            child.setAttribute(
                'style',
                `position: absolute; ` +
                `display: flex; ` +
                `width: 95.4373%; ` +
                `height: 95.4373%; ` +
                `margin: 2.2814%; ` +
                `justify-content: center; ` +
                `transform: rotateZ(${2 * Math.PI / (12 * 5 * 3) * (it)}rad);`
            );

            let indexWidthRatio;
            if (it % (3 * 5) === 0) {
                indexWidthRatio = 0.0045;
            } else {
                indexWidthRatio = 0.003;
            }
            const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;
            const indexWidth2 = `calc(${faceWidth} * ${indexWidthRatio * 2})`;

            let indexHeightRatio;
            if (it % (3) === 0 && it % (3 * 5) !== 0) {
                indexHeightRatio = 0.072243;
            } else {
                indexHeightRatio = 0.016477;
            }
            const indexHeight = `calc(${faceWidth} * ${indexHeightRatio})`;

            let indexMarginTopRatio;
            if (it % (3 * 5) === 0) {
                indexMarginTopRatio = 0.021546;
                // child.appendChild(childInner2);
            } else {
                indexMarginTopRatio = 0;
            }
            const indexMarginTop = `calc(${faceWidth} * ${indexMarginTopRatio})`;

            childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; background: ${indexColor};`);
            childInnerInner.setAttribute('style', `width: ${indexWidth2}; height: ${indexHeight}; margin-top: ${indexMarginTop}; background: ${indexColor};`);

            child.appendChild(childInner);
            indexLineOuterUL.appendChild(
                child
            );
        });

        [...Array(12).keys()].forEach(it => {
            const child = document.createElement('li');
            const childInner = document.createElement('div');
            const childInnerInner = document.createElement('div');

            child.setAttribute(
                'style',
                `position: absolute; ` +
                `display: flex; ` +
                `width: 95.4373%; ` +
                `height: 95.4373%; ` +
                `margin: 2.2814%; ` +
                `justify-content: center; ` +
                `transform: rotateZ(${2 * Math.PI / (12) * (it)}rad);`
            );

            const indexWidthRatio = 0.021546;
            const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;

            const indexHeightRatio = 0.086185;
            const indexHeight = `calc(${faceWidth} * ${indexHeightRatio})`;

            const indexMarginTopRatio = 0.021546;
            const indexMarginTop = `calc(${faceWidth} * ${indexMarginTopRatio})`;

            const indexBorderRadiusRatio = 0.005;
            const indexBorderRadius = `calc(${faceWidth} * ${indexBorderRadiusRatio})`;

            childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; margin-top: ${indexMarginTop}; background: ${glowColor}; border-radius: ${indexBorderRadius};`);

            child.appendChild(childInner);
            indexLineOuterUL.appendChild(
                child
            );
        });

        // hour
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');
            const childTriangle = document.createElement('div');
            const childGlow = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.032708)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);

            childInner.setAttribute('style', `position: absolute; top: 43.0520%; width: 100%; height: 48.8186%; background: ${handsColor};`);
            childTriangle.setAttribute('style', `position: absolute; top: 37.3583%; width: 100%; height: 11.2874%; background: ${handsColor}; clip-path:polygon(0 50%, 50% 100%,100% 50%,50% 0);`);
            childGlow.setAttribute('style', `position: relative; top: 45.7938%; width: 37.8777%; height: 41.1280%; margin: 0 auto; background: ${glowColor}; box-shadow: rgba(0, 0, 0, 0.06) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.06) 0px 1px calc(${faceWidth} * 0.002) 1px inset;`);

            child.appendChild(childInner);
            child.appendChild(childTriangle);
            child.appendChild(childGlow);

            hourElement.innerHTML = '';
            hourElement.appendChild(child);
        })();

        // minute
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');
            const childTriangle = document.createElement('div');
            const childGlow = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.027796)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);

            childInner.setAttribute('style', `position: absolute; top: 14.1541%; width: 100%; height: 79.36159%; background: ${handsColor};`);
            childTriangle.setAttribute('style', `position: absolute; top: 9.4805%; width: 100%; height: 9.3472%; background: ${handsColor}; clip-path:polygon(0 50%,50% 100%,100% 50%,50% 0);`);
            childGlow.setAttribute('style', `position: relative; top: 17.5642%; width: 45.1378%; height: 69.6573%; margin: 0 auto; background: ${glowColor}; box-shadow: rgba(0, 0, 0, 0.06) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.06) 0px 1px calc(${faceWidth} * 0.002) 1px inset;`);

            child.appendChild(childInner);
            child.appendChild(childTriangle);
            child.appendChild(childGlow);

            minuteElement.innerHTML = '';
            minuteElement.appendChild(child);
        })();

        // second
        (() => {
            const childUpper = document.createElement('div');
            const childInnerUpper = document.createElement('div');
            const childRhombus = document.createElement('div');
            const childGlow = document.createElement('div');

            const childLower = document.createElement('div');
            const childInnerLower = document.createElement('div');
            const childTriangle = document.createElement('div');

            const childWidthUpper = `calc(${faceWidth} * 0.017051)`;
            childUpper.setAttribute('style', `position: absolute; width: ${childWidthUpper}; height: 50%;`);

            childInnerUpper.setAttribute('style', `position: absolute; top: 44.6995%; width: 100%; height: 50.9694%; background: ${handsColor}; clip-path:polygon(10.4934% 0,0 100%,100% 100%,89.5066% 0);`);
            childRhombus.setAttribute('style', `position: absolute; left: -84.2567%; top: 19.5648%; width: 268.5134%; height: 27.4713%; background: ${handsColor}; clip-path:polygon(0 80.3833%,50% 100%,100% 80.3833%,50% 0);`);
            childGlow.setAttribute('style', `position: relative; top: 28.7219%; left: -36.7619%; width: 173.5238%; height: 15.6197%; margin: 0 auto; background: ${glowColor}; clip-path:polygon(0 80.3833%,50% 100%,100% 80.3833%,50% 0); box-shadow: rgba(0, 0, 0, 0.06) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.06) 0px 1px calc(${faceWidth} * 0.002) 1px inset;`);

            childUpper.appendChild(childInnerUpper);
            childUpper.appendChild(childRhombus);
            childUpper.appendChild(childGlow);

            const childWidthLower = `calc(${faceWidth} * 0.017051)`;
            childLower.setAttribute('style', `position: absolute; top:50%; width: ${childWidthLower}; height: 50%;`);

            childInnerLower.setAttribute('style', `position: absolute; top: 4.2740%; left: -34.2582%; width: 168.5164%; height: 18.6445%; background: ${handsColor}; clip-path:polygon(20.3293% 0,0 100%,100% 100%,79.6707% 0);`);
            childTriangle.setAttribute('style', `position: absolute; top: 20.1002%; left: -34.2582%; width: 168.5164%; height: 5.7357%; background: ${handsColor}; clip-path:polygon(0 50%,50% 100%,100% 50%,50% 0);`);

            childLower.appendChild(childInnerLower);
            childLower.appendChild(childTriangle);

            secondElement.innerHTML = '';
            secondElement.appendChild(childUpper);
            secondElement.appendChild(childLower);
        })();

        // handsCircle
        (() => {
            const childMinute = document.createElement('div');
            const childSecond = document.createElement('div');
            const childEmboss = document.createElement('div');
            const childDot = document.createElement('div');

            childMinute.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 78.0821%; ` +
                `height: 78.0821%; ` +
                `margin: 10.95895%; ` +
                `background: white;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
            );

            childSecond.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 49.3151%; ` +
                `height: 49.3151%; ` +
                `margin: 25.34245%; ` +
                `background: white;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
            );

            childEmboss.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 20.5479%; ` +
                `height: 20.5479%; ` +
                `margin: 39.72605%; ` +
                `background: white;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
            );

            childDot.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 6.8493%; ` +
                `height: 6.8493%; ` +
                `margin: 46.57535%; ` +
                `background: #393939;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.002) 1px inset;` +
                `z-index: 7;`
            );

            handsCircleElement.appendChild(childMinute);
            handsCircleElement.appendChild(childSecond);
            handsCircleElement.appendChild(childEmboss);
            handsCircleElement.appendChild(childDot);
        })();

        // subdial(9h)
        (() => {
            // face
            const child = document.createElement('div');
            const childFaceDeboss = document.createElement('div');
            const childFace = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.29151)`;
            const childTop = `calc(${faceWidth} * 0.354245)`;
            const childLeft = `calc(${faceWidth} * 0.13756)`;
            child.setAttribute('style', `position: absolute; left: ${childLeft}; top: ${childTop}; width: ${childWidth}; height: ${childWidth}; z-index: 11;`);

            childFaceDeboss.setAttribute('style', `position: absolute; width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #131313, #676767);  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) 0px -1px calc(${faceWidth} * -0.002) 1px inset;`);
            childFace.setAttribute('style', 'position: absolute; left: 11.6883%; top: 11.6883%; width: 76.6234%; height: 76.6234%; border-radius: 50%; background: #333333;');

            child.appendChild(childFaceDeboss);
            child.appendChild(childFace);

            faceElement.appendChild(child);

            // index
            const childUL = document.createElement('ul');
            child.appendChild(childUL);
            [...Array(12).keys()].forEach(it => {
                const child = document.createElement('li');
                const childInner = document.createElement('div');
                child.setAttribute(
                    'style',
                    `position: absolute; ` +
                    `display: flex; ` +
                    `width: 93.0736%; ` +
                    `height: 93.0736%; ` +
                    `margin: 3.4632%; ` +
                    `justify-content: center; ` +
                    `transform: rotateZ(${2 * Math.PI / (12) * (it)}rad);`
                );

                let indexWidthRatio;
                if (it % 4 === 0) {
                    indexWidthRatio = 0.0038;
                } else {
                    indexWidthRatio = 0.0026;
                }
                const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;

                let indexHeightRatio;
                if (it % 4 !== 0) {
                    indexHeightRatio = 0.031686;
                } else {
                    indexHeightRatio = 0.020040;
                }
                const indexHeight = `calc(${faceWidth} * ${indexHeightRatio})`;

                childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; background: ${indexColor};`);

                child.appendChild(childInner);
                childUL.appendChild(
                    child
                );
            });

            // number
            const fontSize = `calc(${faceWidth} * 0.039375)`;

            const number1 = document.createElement('div');
            const number2 = document.createElement('div');
            const number3 = document.createElement('div');

            number1.innerText = '60';
            number2.innerText = '20';
            number3.innerText = '40';

            number1.setAttribute('style', `position: absolute; top: 4%; left: 38%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number2.setAttribute('style', `position: absolute; top: 56%; left: 64%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number3.setAttribute('style', `position: absolute; top: 56%; left: 13%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);

            childFace.appendChild(number1);
            childFace.appendChild(number2);
            childFace.appendChild(number3);


            // subhand
            const subHandElement = document.createElement('div');
            subHandElement.classList.add('hands');
            subHandElement.setAttribute('style', `position: absolute; width: 100%; height: 100%; display: flex; justify-content: center; z-index: 30;`);
            child.appendChild(subHandElement);

            linkedSecondElement = subHandElement; // link
            (() => {
                const child = document.createElement('div');
                const childInner = document.createElement('div');
                const childTriangle = document.createElement('div');

                const childWidth = `calc(${faceWidth} * 0.011407)`;
                child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
                13.4199
                childInner.setAttribute('style', `position: absolute; top: 18.0935%; width: 100%; height: 69.2641%; background: ${handsColor};`);
                childTriangle.setAttribute('style', `position: absolute; top: 13.4199%; width: 100%; height: 9.3472%; background: ${handsColor}; clip-path:polygon(0 50%,50% 100%,100% 50%,50% 0);`);

                child.appendChild(childInner);
                child.appendChild(childTriangle);

                subHandElement.innerHTML = '';
                subHandElement.appendChild(child);
            })();

            // handsCircle
            const childHandsCircleElement = document.createElement('div');
            childHandsCircleElement.setAttribute('style', `position: absolute; left: 42.42425%; top: 42.42425%; width: 15.1515%; height: 15.1515%;`);
            child.appendChild(childHandsCircleElement);
            (() => {
                const childSecond = document.createElement('div');
                const childEmboss = document.createElement('div');
                const childDot = document.createElement('div');

                childSecond.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0%; ` +
                    `background: white;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
                );

                childEmboss.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 45.7143%; ` +
                    `height: 45.7143%; ` +
                    `margin: 27.14285%; ` +
                    `background: #E5E5E5;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 1px 0px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) -1px 0px calc(${faceWidth} * 0.002) 1px inset;`
                );

                childDot.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 20%; ` +
                    `height: 20%; ` +
                    `margin: 40%; ` +
                    `background: #D9D9D9;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 1px 0px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) -1px 0px calc(${faceWidth} * 0.002) 1px inset;` +
                    `z-index: 7;`
                );

                childHandsCircleElement.appendChild(childSecond);
                childHandsCircleElement.appendChild(childEmboss);
                childHandsCircleElement.appendChild(childDot);
            })();
        })();

        // subdial(3h)
        (() => {
            // face
            const child = document.createElement('div');
            const childFaceDeboss = document.createElement('div');
            const childFace = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.29151)`;
            const childTop = `calc(${faceWidth} * 0.354245)`;
            const childLeft = `calc(${faceWidth} * 0.57093)`;
            child.setAttribute('style', `position: absolute; left: ${childLeft}; top: ${childTop}; width: ${childWidth}; height: ${childWidth}; z-index: 11;`);

            childFaceDeboss.setAttribute('style', `position: absolute; width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #131313, #676767);  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) 0px -1px calc(${faceWidth} * -0.002) 1px inset;`);
            childFace.setAttribute('style', 'position: absolute; left: 11.6883%; top: 11.6883%; width: 76.6234%; height: 76.6234%; border-radius: 50%; background: #333333;');

            child.appendChild(childFaceDeboss);
            child.appendChild(childFace);

            faceElement.appendChild(child);

            // index
            const childUL = document.createElement('ul');
            child.appendChild(childUL);
            [...Array(5 * 6).keys()].forEach(it => {
                const child = document.createElement('li');
                const childInner = document.createElement('div');
                child.setAttribute(
                    'style',
                    `position: absolute; ` +
                    `display: flex; ` +
                    `width: 93.0736%; ` +
                    `height: 93.0736%; ` +
                    `margin: 3.4632%; ` +
                    `justify-content: center; ` +
                    `transform: rotateZ(${2 * Math.PI / (5 * 6) * (it)}rad);`
                );

                let indexWidthRatio;
                if (it % 5 === 0) {
                    indexWidthRatio = 0.0038;
                } else {
                    indexWidthRatio = 0.0026;
                }
                const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;

                let indexHeightRatio;
                if (it % 5 !== 0 || it % 10 === 0) {
                    indexHeightRatio = 0.031686;
                } else {
                    indexHeightRatio = 0.045627;
                }
                const indexHeight = `calc(${faceWidth} * ${indexHeightRatio})`;

                childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; background: ${indexColor};`);

                child.appendChild(childInner);
                childUL.appendChild(
                    child
                );
            });

            // number
            const fontSize = `calc(${faceWidth} * 0.039375)`;

            const number1 = document.createElement('div');
            const number2 = document.createElement('div');
            const number3 = document.createElement('div');

            number1.innerText = '30';
            number2.innerText = '10';
            number3.innerText = '20';

            number1.setAttribute('style', `position: absolute; top: 4%; left: 38%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number2.setAttribute('style', `position: absolute; top: 56%; left: 64%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number3.setAttribute('style', `position: absolute; top: 56%; left: 13%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);

            childFace.appendChild(number1);
            childFace.appendChild(number2);
            childFace.appendChild(number3);


            // subhand
            const subHandElement = document.createElement('div');
            subHandElement.classList.add('hands');
            subHandElement.setAttribute('style', `position: absolute; width: 100%; height: 100%; display: flex; justify-content: center; z-index: 30;`);
            child.appendChild(subHandElement);

            linkedSubhand2Element = subHandElement; // link
            (() => {
                const child = document.createElement('div');
                const childInner = document.createElement('div');
                const childTriangle = document.createElement('div');

                const childWidth = `calc(${faceWidth} * 0.011407)`;
                child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
                13.4199
                childInner.setAttribute('style', `position: absolute; top: 18.0935%; width: 100%; height: 69.2641%; background: ${handsColor};`);
                childTriangle.setAttribute('style', `position: absolute; top: 13.4199%; width: 100%; height: 9.3472%; background: ${handsColor}; clip-path:polygon(0 50%,50% 100%,100% 50%,50% 0);`);

                child.appendChild(childInner);
                child.appendChild(childTriangle);

                subHandElement.innerHTML = '';
                subHandElement.appendChild(child);
            })();

            // handsCircle
            const childHandsCircleElement = document.createElement('div');
            childHandsCircleElement.setAttribute('style', `position: absolute; left: 42.42425%; top: 42.42425%; width: 15.1515%; height: 15.1515%;`);
            child.appendChild(childHandsCircleElement);
            (() => {
                const childSecond = document.createElement('div');
                const childEmboss = document.createElement('div');
                const childDot = document.createElement('div');

                childSecond.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0%; ` +
                    `background: white;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
                );

                childEmboss.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 45.7143%; ` +
                    `height: 45.7143%; ` +
                    `margin: 27.14285%; ` +
                    `background: #E5E5E5;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 1px 0px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) -1px 0px calc(${faceWidth} * 0.002) 1px inset;`
                );

                childDot.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 20%; ` +
                    `height: 20%; ` +
                    `margin: 40%; ` +
                    `background: #D9D9D9;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 1px 0px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) -1px 0px calc(${faceWidth} * 0.002) 1px inset;` +
                    `z-index: 7;`
                );

                childHandsCircleElement.appendChild(childSecond);
                childHandsCircleElement.appendChild(childEmboss);
                childHandsCircleElement.appendChild(childDot);
            })();
        })();

        // subdial(6h)
        (() => {
            // face
            const child = document.createElement('div');
            const childFaceDeboss = document.createElement('div');
            const childFace = document.createElement('div');

            const childWidth = `calc(${faceWidth} * 0.29151)`;
            const childTop = `calc(${faceWidth} * 0.57093)`;
            const childLeft = `calc(${faceWidth} * 0.354245)`;
            child.setAttribute('style', `position: absolute; left: ${childLeft}; top: ${childTop}; width: ${childWidth}; height: ${childWidth}; z-index: 11;`);

            childFaceDeboss.setAttribute('style', `position: absolute; width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #131313, #676767);  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) 0px -1px calc(${faceWidth} * -0.002) 1px inset;`);
            childFace.setAttribute('style', 'position: absolute; left: 11.6883%; top: 11.6883%; width: 76.6234%; height: 76.6234%; border-radius: 50%; background: #333333;');

            child.appendChild(childFaceDeboss);
            child.appendChild(childFace);

            faceElement.appendChild(child);

            // index
            const childUL = document.createElement('ul');
            child.appendChild(childUL);
            [...Array(12).keys()].forEach(it => {
                const child = document.createElement('li');
                const childInner = document.createElement('div');
                child.setAttribute(
                    'style',
                    `position: absolute; ` +
                    `display: flex; ` +
                    `width: 93.0736%; ` +
                    `height: 93.0736%; ` +
                    `margin: 3.4632%; ` +
                    `justify-content: center; ` +
                    `transform: rotateZ(${2 * Math.PI / (12) * (it)}rad);`
                );

                let indexWidthRatio;
                if (it % 3 === 0) {
                    indexWidthRatio = 0.0038;
                } else {
                    indexWidthRatio = 0.0026;
                }
                const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;

                let indexHeightRatio;
                if (it % 3 !== 0) {
                    indexHeightRatio = 0.031686;
                } else {
                    indexHeightRatio = 0.016477;
                }
                const indexHeight = `calc(${faceWidth} * ${indexHeightRatio})`;

                childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; background: ${indexColor};`);

                child.appendChild(childInner);
                childUL.appendChild(
                    child
                );
            });

            // number
            const fontSize = `calc(${faceWidth} * 0.039375)`;

            const number1 = document.createElement('div');
            const number2 = document.createElement('div');
            const number3 = document.createElement('div');
            const number4 = document.createElement('div');

            number1.innerText = '12';
            number2.innerText = '3';
            number3.innerText = '6';
            number4.innerText = '9';

            number1.setAttribute('style', `position: absolute; top: 4%; left: 38%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number2.setAttribute('style', `position: absolute; top: 38%; left: 83%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number3.setAttribute('style', `position: absolute; top: 78%; left: 43%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);
            number4.setAttribute('style', `position: absolute; top: 38%; left: 8%; color: ${handsColor}; font-family: Verdana, Geneva, Sans-Serif; font-size: ${fontSize}; transform: scaleX(135.8%);`);

            childFace.appendChild(number1);
            childFace.appendChild(number2);
            childFace.appendChild(number3);
            childFace.appendChild(number4);

            // subhand
            const subHandElement = document.createElement('div');
            subHandElement.classList.add('hands');
            subHandElement.setAttribute('style', `position: absolute; width: 100%; height: 100%; display: flex; justify-content: center; z-index: 30;`);
            child.appendChild(subHandElement);

            linkedSubhand3Element = subHandElement; // link
            (() => {
                const child = document.createElement('div');
                const childInner = document.createElement('div');
                const childTriangle = document.createElement('div');

                const childWidth = `calc(${faceWidth} * 0.011407)`;
                child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
                13.4199
                childInner.setAttribute('style', `position: absolute; top: 18.0935%; width: 100%; height: 69.2641%; background: ${handsColor};`);
                childTriangle.setAttribute('style', `position: absolute; top: 13.4199%; width: 100%; height: 9.3472%; background: ${handsColor}; clip-path:polygon(0 50%,50% 100%,100% 50%,50% 0);`);

                child.appendChild(childInner);
                child.appendChild(childTriangle);

                subHandElement.innerHTML = '';
                subHandElement.appendChild(child);
            })();

            // handsCircle
            const childHandsCircleElement = document.createElement('div');
            childHandsCircleElement.setAttribute('style', `position: absolute; left: 42.42425%; top: 42.42425%; width: 15.1515%; height: 15.1515%;`);
            child.appendChild(childHandsCircleElement);
            (() => {
                const childSecond = document.createElement('div');
                const childEmboss = document.createElement('div');
                const childDot = document.createElement('div');

                childSecond.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0%; ` +
                    `background: white;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${faceWidth} * 0.02) 1px;`
                );

                childEmboss.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 45.7143%; ` +
                    `height: 45.7143%; ` +
                    `margin: 27.14285%; ` +
                    `background: #E5E5E5;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 1px 0px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) -1px 0px calc(${faceWidth} * 0.002) 1px inset;`
                );

                childDot.setAttribute('style',
                    `position: absolute;` +
                    `border-radius: 50%;` +
                    `width: 20%; ` +
                    `height: 20%; ` +
                    `margin: 40%; ` +
                    `background: #D9D9D9;` +
                    `box-shadow: rgba(0, 0, 0, 0.4) 1px 0px calc(${faceWidth} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) -1px 0px calc(${faceWidth} * 0.002) 1px inset;` +
                    `z-index: 7;`
                );

                childHandsCircleElement.appendChild(childSecond);
                childHandsCircleElement.appendChild(childEmboss);
                childHandsCircleElement.appendChild(childDot);
            })();
        })();

        // dial printing
        (() => {
            const child = document.createElement('div');
            const childLogo = document.createElement('div');
            const childCI = document.createElement('div');
            const childBrand = document.createElement('div');
            const childProduct = document.createElement('div');

            const fontSizeLogo = `calc(${faceWidth} * 0.0776600)`;
            const fontSizeCI = `calc(${faceWidth} * 0.0476600)`;
            const fontSizeBrand = `calc(${faceWidth} * 0.0346600)`;
            const fontSizeProduct = `calc(${faceWidth} * 0.0226600)`;

            child.setAttribute('style', `position: absolute; width: 100%; height: 100%; display: flex; justify-content: center; z-index: 11;`);

            childLogo.setAttribute('style',
                `position: absolute; top: 15.3019%; width: 100%; height: 100%; text-align: center; color: ${handsColor}; font-size: ${fontSizeLogo}; font-family: Arial, Helvetica, Sans-Serif; font-weight: 600; transform: scaleX(109.285%);` +
                `text-shadow: rgba(0, 0, 0, 0.4) calc(${faceWidth} * 0.004) calc(${faceWidth} * 0.004);` +
                `background: linear-gradient(135deg, #eee 80%, #ccc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`);
            childLogo.innerHTML = "&Omega;";

            childCI.setAttribute('style',
                `position: absolute; top: 23.8019%; width: 100%; height: 100%; text-align: center; color: ${handsColor}; font-size: ${fontSizeCI}; font-family: Arial, Helvetica, Sans-Serif; font-weight: 500; ` +
                `text-shadow: rgba(0, 0, 0, 0.1) calc(${faceWidth} * 0.004) calc(${faceWidth} * 0.004);`);
            childCI.innerText = "OMEGA";

            childBrand.setAttribute('style',
                `position: absolute; top: 29.1019%; width: 100%; height: 100%; text-align: center; color: ${handsColor}; font-size: ${fontSizeBrand}; font-family: Georgia, Times New Roman, Times, Serif; font-weight: 300; font-style: italic; transform: scaleX(105%);` +
                `text-shadow: rgba(0, 0, 0, 0.1) calc(${faceWidth} * 0.004) calc(${faceWidth} * 0.004);`);
            childBrand.innerText = "Speedmaster";

            childProduct.setAttribute('style',
                `position: absolute; top: 33.4019%; width: 100%; height: 100%; text-align: center; color: ${handsColor}; font-size: ${fontSizeProduct}; font-family: Verdana, Geneva, Sans-Serif; font-weight: 100; transform: scaleX(109%); letter-spacing: 1px;` +
                `text-shadow: rgba(0, 0, 0, 0.1) calc(${faceWidth} * 0.004) calc(${faceWidth} * 0.004);`);
            childProduct.innerText = "PROFESSIONAL";

            child.appendChild(childLogo);
            child.appendChild(childCI);
            child.appendChild(childBrand);
            child.appendChild(childProduct);

            faceElement.appendChild(child);
        })();

        // glass
        (() => {
            faceElement.setAttribute('style',
                faceElement.getAttribute('style') +
                `box-shadow: rgba(0,0,0,0.2) 0.1rem 0.1rem 0.2rem 0.2rem, rgba(255,255,255,0.6) -0.1rem -0.1rem 0.2rem 0.2rem`
            );
            glassElement.setAttribute('style',
                // `background: linear-gradient(135deg, #B9B9B9, #232323, #B8B8B8);` +
                `background: linear-gradient(135deg, #515151 12%, #C5C5C5 20%, #B9B9B9 24%, #232323 50%, #E9E9E9 95%, #B8B8B8);` +
                `box-shadow: rgba(0,0,0,0.5) 0.2rem 0.2rem 0.4rem 0.4rem inset, rgba(255,255,255,0.7) -0.2rem -0.2rem 0.4rem 0.4rem inset`
            );
        })();

        // bezel
        (() => {
            bezelElement.setAttribute('style',
                `background: #2A2A2A` +
                `` // `box-shadow: rgba(0,0,0,0.5) 0.15rem 0.15rem 0.4rem 0.4rem inset, rgba(255,255,255,0.7) -0.15rem -0.15rem 0.4rem 0.4rem inset`
            );

            const childUL = document.createElement('ul');
            childUL.setAttribute('style', 'position: absolute; left:0; right: 0; top: 0; bottom: 0; z-index: 11;');
            bezelElement.appendChild(childUL);

            // dots and texts
            [...Array(27).keys()].forEach(it => {
                const child = document.createElement('li');
                const childInner = document.createElement('div');
                const childText = document.createElement('div');
                const speed = 60 + it * 5 +
                    (it > 6 ? (it - 6) * 5 : 0) +
                    (it > 17 ? (it - 17) * 15 : 0) +
                    (it > 21 ? (it - 21) * 25 : 0);
                let time = 3600 / speed;
                if (it === 26) {
                    time = 10.9;
                    childText.innerHTML = "TACHYM&Egrave;TRE";
                } else {
                    if (it !== 24) {
                        childText.innerText = speed;
                    }
                }
                const theta = 2 * Math.PI / (60) * (time);

                child.setAttribute(
                    'style',
                    `position: absolute; ` +
                    `display: flex; ` +
                    `width: 91.6752%; ` +
                    `height: 91.6752%; ` +
                    `margin: 4.1624%; ` +
                    `justify-content: center; ` +
                    `color: ${handsColor}; ` +
                    `transform: rotateZ(${theta}rad);`
                );

                let indexWidthRatio;
                indexWidthRatio = 0.008871989;
                const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;

                childInner.setAttribute('style', `position: absolute; width: ${indexWidth}; height: ${indexWidth}; background: ${indexColor}; border-radius: 50%;`);
                if (it < 26) {
                    const childTextTopRatio = -0.049;
                    const childTextTop = `calc(${faceWidth} * ${childTextTopRatio})`;
                    const childFontSize = `calc(var(--faceWidth) * 0.040127)`;
                    let childTranslateX = `0`;
                    let childTranslateY = `0`;
                    if (it > 21) {
                        childTranslateX = `calc(var(--faceWidth) * -0.0150127)`;
                        childTranslateY = `calc(var(--faceWidth) * -0.015127 * (1 - (${it} - 21) * 0.1))`;
                    } else if (it > 19) {
                        childTranslateX = `calc(var(--faceWidth) * -0.0100127)`;
                        childTranslateY = `calc(var(--faceWidth) * -0.023127)`;
                    } else if (it > 17) {
                        childTranslateX = `calc(var(--faceWidth) * -0.0100127)`;
                        childTranslateY = `calc(var(--faceWidth) * 0.023127)`;
                    } else if (it > 13) {
                        childTranslateX = `calc(var(--faceWidth) * -0.0200127)`;
                        childTranslateY = `calc(var(--faceWidth) * 0.013127)`;
                    }
                    childText.setAttribute('style',
                         `position: absolute; top: ${childTextTop}; ` +
                         `transform: rotateZ(-${theta}rad) scaleX(78.6597%) translateX(${childTranslateX}) translateY(${childTranslateY}); font-size: ${childFontSize};`);
                    child.appendChild(childInner);
                } else {
                    const childFontSize = `11.2px`;
                    childText.innerHTML = `
                        <svg viewBox="0 0 500 500" preserveAspectRatio="none">
                        <path id="curve" fill="transparent" d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97" />
                        <text width="500" style="fill: ${handsColor}; transform: rotateZ(-2deg);">
                            <textPath xlink:href="#curve">
                            TACHYM&Egrave;TRE
                            </textPath>
                        </text>
                        </svg>`;
                    child.setAttribute(
                        'style',
                        `position: absolute; ` +
                        `display: flex; ` +
                        `width: 116%; ` +
                        `height: 116%; ` +
                        `margin: -8%; ` +
                        `justify-content: center; ` +
                        `color: ${handsColor}; ` +
                        `transform: rotateZ(${theta}rad);`
                    );
                    childText.setAttribute('style', 
                    `position: absolute; letter-spacing: 2px; ` +
                    `width: 100%; height: 100%; ` + 
                    `font-family: Verdana, Geneva, Sans-Serif; font-size: ${childFontSize};`);
                }
                child.appendChild(childText);

                childUL.appendChild(
                    child
                );
            });

            // index
            [...Array(48).keys()].forEach(it => {
                if ((it <= 30 && it % 5 === 0) || (it > 39 && it % 2 === 0)) {
                    return;
                }
                const child = document.createElement('li');
                const childInner = document.createElement('div');
                const speed = 60 + it * 1 +
                    (it > 40 ? (it - 40) * 4 : 0);
                let time = 3600 / speed;
                const theta = 2 * Math.PI / (60) * (time);
                child.setAttribute(
                    'style',
                    `position: absolute; ` +
                    `display: flex; ` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0; ` +
                    `justify-content: center; ` +
                    `transform: rotateZ(${theta}rad);`
                );

                let indexWidthRatio;
                indexWidthRatio = 0.0026;
                const indexWidth = `calc(${faceWidth} * ${indexWidthRatio})`;

                let indexHeightRatio;
                let indexTopRatio;
                if (it % 5 === 0 || it > 39) {
                    indexHeightRatio = 0.025313;
                    indexTopRatio = 0.0385472;
                } else {
                    indexTopRatio = 0.0470998;
                    indexHeightRatio = 0.0167604;
                }
                const indexHeight = `calc(${faceWidth} * ${indexHeightRatio})`;
                const indexTop = `calc(${faceWidth} * ${indexTopRatio})`;

                childInner.setAttribute('style', `position: relative; top: ${indexTop}; width: ${indexWidth}; height: ${indexHeight}; background: ${indexColor};`);

                child.appendChild(childInner);
                childUL.appendChild(
                    child
                );
            });
        })();

        // case
        (() => {
            caseElement.setAttribute('style',
                `background: linear-gradient(135deg, #FEFEFE, #D7D7D7, #C9C9C9);` +
                `box-shadow: rgba(0,0,0,0.5) 0.05rem 0.05rem 0.1rem 0.1rem inset, rgba(255,255,255,0.7) -0.15rem -0.15rem 0.4rem 0.4rem inset`
            );
        })();

        // button
        (() => {
            const createButton = (theta, pattern, clickable, callback) => {
                const button1Outer = document.createElement('div');
                const button1 = document.createElement('div');
                const button1Inner1 = document.createElement('div');
                const button1Inner2 = document.createElement('div');
                const button1Inner3 = document.createElement('div');

                button1Outer.setAttribute('style', `position: absolute; width: 100%; height: 100%; transform: rotateZ(${theta}deg); pointer-events: none;`);

                const button1Width = `calc(${faceWidth} *0.1566131751)`;
                const button1Height = `calc(${faceWidth} * 0.1125086997271)`;
                const button1Top = `calc(${faceWidth} * -0.1025086997271)`;

                button1.setAttribute('style',
                    `position: relative; top: ${button1Top}; width: ${button1Width}; height: ${button1Height}; margin: 0 auto; background: #C9C9C9; pointer-events: auto;`
                );

                if (pattern === 'stripe') {
                    button1Inner1.setAttribute('style',
                        `position: absolute; top: 0; width: 100%; height: 70.4558%; margin: 0 auto; ` +
                        `background: repeating-linear-gradient(90deg,#FFFFFF 0.5rem,#0D0D0D 1.5rem,#FFFFFF 1.5rem,#949494 0.5rem,#0D0D0D 0.5rem);`
                    );
                    button1Inner2.setAttribute('style',
                        `position: absolute; top: 70.4558%; width: 100%; height: 16.9355%; margin: 0 auto; ` +
                        `background: repeating-linear-gradient(90deg,#FFFFFF 0.5rem,#0D0D0D 1.5rem,#FFFFFF 1.5rem,#949494 0.5rem,#0D0D0D 0.5rem);`
                    );
                    button1Inner3.setAttribute('style',
                        `position: absolute; top: 87.3913%; width: 100%; height: 12.6087%; margin: 0 auto; ` +
                        `background: repeating-linear-gradient(90deg,#FFFFFF 0.5rem,#0D0D0D 1.5rem,#FFFFFF 1.5rem,#949494 0.5rem,#0D0D0D 0.5rem);`
                    );
                } else {
                    button1Inner1.setAttribute('style',
                        `position: absolute; top: 0; width: 100%; height: 70.4558%; margin: 0 auto; ` +
                        `background: linear-gradient(90deg, #0D0D0D, #D0D0D0 5% 10%, #FFFFFF 45% 48%, #CECECE 50%, #010101 51% 68%,#B3B3B3 69%, #F4F4F4 80%, #B1B1B1 90% 95%, #000000 96% 97%, #C9C9C9 98% 99%, #000000);`
                    );
                    button1Inner2.setAttribute('style',
                        `position: absolute; top: 70.4558%; width: 100%; height: 16.9355%; margin: 0 auto; ` +
                        `background: linear-gradient(0deg, #94949480 25%, #FFFFFF80 50%, #00000080 55% 60%, #94949480), linear-gradient(90deg, #94949480 25%, #FFFFFF80 50%, #00000080 55% 60%, #94949480);`
                    );
                    button1Inner3.setAttribute('style',
                        `position: absolute; top: 87.3913%; width: 100%; height: 12.6087%; margin: 0 auto; ` +
                        `background: linear-gradient(90deg, #8D8D8D 20%, #0D0D0D 22% 32%, #D0D0D0 33% 45%, #FFFFFF 45% 48%, #CECECE 50%, #010101 51% 68%,#B3B3B3 69%, #F4F4F4 76%, #010101 77% 93%, #B1B1B1 94% 95%, #000000 96% 97%, #C9C9C9 98% 99%, #000000);`
                    );

                }

                button1.appendChild(button1Inner1);
                button1.appendChild(button1Inner2);
                button1.appendChild(button1Inner3);

                button1Outer.appendChild(button1);

                extrudeElement.appendChild(button1Outer);

                // event
                if (clickable) {
                    button1.addEventListener('pointerdown', () => {
                        button1.classList.add('mousedown');
                        if (callback !== null && callback !== undefined) {
                            callback();
                        }
                    }, true);
                    button1.addEventListener('pointerup', () => {
                        button1.classList.remove('mousedown');
                    }, true);
                    button1.addEventListener('pointerleave', () => {
                        button1.classList.remove('mousedown');
                    }, true);
                }
            };

            createButton('66.41', null, true, () => {
                if (chronographMillis !== 0) {
                    chronographStartTime = (new Date()) - chronographMillis;
                } else {
                    chronographStartTime = new Date();
                    chronographMillis = 0;
                }
                chronographWork = !chronographWork;
                saveData();
            });
            createButton('90', 'stripe', false, null);
            createButton('113.59', null, true, () => {
                chronographWork = false;
                chronographStartTime = null;
                chronographMillis = 0;
                linkedSubhand1Element?.removeAttribute('style');
                linkedSubhand2Element?.removeAttribute('style');
                linkedSubhand3Element?.removeAttribute('style');
                saveData();
            });
        })();
    }
};
