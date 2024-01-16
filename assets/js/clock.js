window.onload = () => {

    const {
        radius,
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
        handsCircleElement
    } = getElements();

    let dialColor = 'white';
    let handsColor = 'black';
    let glowColor = '#D7E1C3';
    let hz = 10;

    setDial('speedmaster');
    clockwork();

    function define() {
        const radius = getComputedStyle(document.documentElement)
            .getPropertyValue('--radius');

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
            radius,
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
            handsCircleElement
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
            {
                const now = new Date();

                const hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const millseconds = now.getMilliseconds();

                /*
                hourElement.setAttribute('style',
                    `position: absolute; ` +
                    `left: calc(${radius} * 0.05); ` +
                    `top: calc(${radius} * 0.5); ` +
                    `box-shadow: calc(${radius} * 0.15) 0 0 ${dialColor} inset, calc(${radius} * 0.45) 0 0 ${handsColor} inset;` +
                    `width: calc(${radius} * 0.9);` +
                    `height: calc(${radius} * 0.006);` +
                    `transform: rotateZ(${2 * Math.PI / 12 * (hours + minutes / 60 + 3)}rad);`
                );
                */

                hourElement.setAttribute('style',
                    `position: absolute; ` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0; ` +
                    `transform: rotateZ(${2 * Math.PI / 12 * (hours + minutes / 60 + seconds / 3600)}rad);`
                );

                minuteElement.setAttribute('style',
                    `position: absolute; ` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0; ` +
                    `transform: rotateZ(${2 * Math.PI / 60 * (minutes + seconds / 60 + millseconds / 60000)}rad);`
                );

                secondElement.setAttribute('style',
                    `position: absolute; ` +
                    `width: 100%; ` +
                    `height: 100%; ` +
                    `margin: 0; ` +
                    `transform: rotateZ(${2 * Math.PI / 60 * (seconds + millseconds / 1000)}rad);`
                );

                const date = now.getDate();
                if (dateInnerElement.innerText !== `${date}`) {
                    dateInnerElement.innerText = date;
                }
            }
        };
        const timer = setInterval(worker, 1000 / hz);

        worker();
        return timer;
    }

    function setDialPrague() {
        dialColor = 'white';
        handsColor = 'black';
        hz = 10;

        faceElement.setAttribute('style', `background: ${dialcolor};`);
        indexLineOuter.setAttribute('style', 'width: 94%; height: 94%; margin: 3%; border: calc(var(--radius) * 0.003) solid black; ');
        indexLineInner.setAttribute('style', 'border: calc(var(--radius) * 0.003) solid black;');

        handsCircleElement.innerHTML = '';
        handsCircleElement.setAttribute('style', `width: calc(${radius} * 0.015); height: calc(${radius} * 0.015); background: black;`);

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
            const childInnerWidth = (it % 5 == 0 ? `calc(${radius} * 0.006)` : `calc(${radius} * 0.003)`);
            childInner.setAttribute('style', `width: ${childInnerWidth}; height: calc(${radius} * 0.02); background: black;`);

            child.appendChild(childInner);
            indexLineOuterUL.appendChild(
                child
            );
        });

        // hour
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');

            const childWidth = `calc(${radius} * 0.006)`;
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

            const childWidth = `calc(${radius} * 0.006)`;
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

            const childWidth = `calc(${radius} * 0.006)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            childInner.setAttribute('style', `position: absolute; top: 15%; width: 100%; height: 85%; background: ${handsColor};`);

            child.appendChild(childInner);

            secondElement.innerHTML = '';
            secondElement.appendChild(child);
        })();
    }

    function setDialSpeedMaster() {
        dialColor = '#282828';
        handsColor = 'white';
        glowColor = '#D7E1C3';
        hz = 6;

        faceElement.setAttribute('style', `background: linear-gradient(135deg, #414141, #0C0C0C);`);
        faceInnerElement.setAttribute('style',
            `width: 79.2142%; ` +
            `height: 79.2142%; margin: 10.3929%; ` +
            `background: background: linear-gradient(135deg, #252525, #171717);` +
            `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.02) 1px;`
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
            `width: calc(${radius} * 0.0925221799); height: calc(${radius} * 0.0925221799); background: white; z-index: 4;` +
            `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.02) 1px;`
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
            const indexWidth = `calc(${radius} * ${indexWidthRatio})`;
            const indexWidth2 = `calc(${radius} * ${indexWidthRatio * 2})`;

            let indexHeightRatio;
            if (it % (3) === 0 && it % (3 * 5) !== 0) {
                indexHeightRatio = 0.072243;
            } else {
                indexHeightRatio = 0.016477;
            }
            const indexHeight = `calc(${radius} * ${indexHeightRatio})`;

            let indexMarginTopRatio;
            if (it % (3 * 5) === 0) {
                indexMarginTopRatio = 0.021546;
                // child.appendChild(childInner2);
            } else {
                indexMarginTopRatio = 0;
            }
            const indexMarginTop = `calc(${radius} * ${indexMarginTopRatio})`;

            childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; background: white;`);
            childInnerInner.setAttribute('style', `width: ${indexWidth2}; height: ${indexHeight}; margin-top: ${indexMarginTop}; background: white;`);

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
            const indexWidth = `calc(${radius} * ${indexWidthRatio})`;

            const indexHeightRatio = 0.086185;
            const indexHeight = `calc(${radius} * ${indexHeightRatio})`;

            const indexMarginTopRatio = 0.021546;
            const indexMarginTop = `calc(${radius} * ${indexMarginTopRatio})`;

            const indexBorderRadiusRatio = 0.005;
            const indexBorderRadius = `calc(${radius} * ${indexBorderRadiusRatio})`;

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

            const childWidth = `calc(${radius} * 0.032708)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            
            childInner.setAttribute('style', `position: absolute; top: 43.0520%; width: 100%; height: 48.8186%; background: ${handsColor};`);
            childTriangle.setAttribute('style', `position: absolute; top: 37.3583%; width: 100%; height: 11.2874%; background: ${handsColor}; clip-path:polygon(0 50%, 50% 100%,100% 50%,50% 0);`);
            childGlow.setAttribute('style', `position: relative; top: 45.7938%; width: 37.8777%; height: 41.1280%; margin: 0 auto; background: ${glowColor}; box-shadow: rgba(0, 0, 0, 0.06) 0px 1px calc(${radius} * 0.004) 0px inset, rgba(0, 0, 0, 0.06) 0px 1px calc(${radius} * 0.002) 1px inset;`);

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

            const childWidth = `calc(${radius} * 0.027796)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            childInner.setAttribute('style', `position: absolute; top: 14.1541%; width: 100%; height: 79.36159%; background: ${handsColor};`);

            childTriangle.setAttribute('style', `position: absolute; top: 9.4805%; width: 100%; height: 9.3472%; background: ${handsColor}; clip-path:polygon(0 50%, 50% 100%,100% 50%,50% 0);`);
            childGlow.setAttribute('style', `position: relative; top: 17.5642%; width: 45.1378%; height: 69.6573%; margin: 0 auto; background: ${glowColor}; box-shadow: rgba(0, 0, 0, 0.06) 0px 1px calc(${radius} * 0.004) 0px inset, rgba(0, 0, 0, 0.06) 0px 1px calc(${radius} * 0.002) 1px inset;`);

            child.appendChild(childInner);

            child.appendChild(childTriangle);
            child.appendChild(childGlow);

            minuteElement.innerHTML = '';
            minuteElement.appendChild(child);
        })();

        // second
        (() => {
            const child = document.createElement('div');
            const childInner = document.createElement('div');

            const childWidth = `calc(${radius} * 0.006)`;
            child.setAttribute('style', `position: relative; width: ${childWidth}; height: 50%;`);
            childInner.setAttribute('style', `position: absolute; top: 19.5460%; width: 100%; height: 75.9913%; background: ${handsColor};`);

            child.appendChild(childInner);

            secondElement.innerHTML = '';
            secondElement.appendChild(child);
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
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.02) 1px;`
            );

            childSecond.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 49.3151%; ` +
                `height: 49.3151%; ` +
                `margin: 25.34245%; ` +
                `background: white;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.02) 1px;`
            );

            childEmboss.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 20.5479%; ` +
                `height: 20.5479%; ` +
                `margin: 39.72605%; ` +
                `background: white;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.02) 1px;`
            );

            childDot.setAttribute('style',
                `position: absolute;` +
                `border-radius: 50%;` +
                `width: 6.8493%; ` +
                `height: 6.8493%; ` +
                `margin: 46.57535%; ` +
                `background: #393939;` +
                `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px inset, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.002) 1px inset;` +
                `z-index: 7;`
            );

            handsCircleElement.appendChild(childMinute);
            handsCircleElement.appendChild(childSecond);
            handsCircleElement.appendChild(childEmboss);
            handsCircleElement.appendChild(childDot);
        })();
    }
};