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
        const timer = setInterval(() => {
            const now = new Date();

            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const millseconds = now.getMilliseconds();

            hourElement.setAttribute('style',
                `position: absolute; ` +
                `left: calc(${radius} * 0.05); ` +
                `top: calc(${radius} * 0.5); ` +
                `box-shadow: calc(${radius} * 0.15) 0 0 ${dialColor} inset, calc(${radius} * 0.45) 0 0 ${handsColor} inset;` +
                `width: calc(${radius} * 0.9);` +
                `height: calc(${radius} * 0.006);` +
                `transform: rotateZ(${2 * Math.PI / 12 * (hours + minutes / 60 + 3)}rad);`
            );

            minuteElement.setAttribute('style',
                `position: absolute; ` +
                `left: calc(${radius} * 0.05); ` +
                `top: calc(${radius} * 0.5); ` +
                `box-shadow: calc(${radius} * 0.03) 0 0 ${dialColor} inset, calc(${radius} * 0.45) 0 0 ${handsColor} inset;` +
                `width: calc(${radius} * 0.9);` +
                `height: calc(${radius} * 0.006);` +
                `transform: rotateZ(${2 * Math.PI / 60 * (minutes + seconds / 60 + 15)}rad);`
            );

            secondElement.setAttribute('style',
                `position: absolute; ` +
                `left: calc(${radius} * 0.05); ` +
                `top: calc(${radius} * 0.5); ` +
                `box-shadow: calc(${radius} * 0.03) 0 0 ${dialColor} inset, calc(${radius} * 0.45) 0 0 ${handsColor} inset;` +
                `width: calc(${radius} * 0.9);` +
                `height: calc(${radius} * 0.006);` +
                `transform: rotateZ(${2 * Math.PI / 60 * (seconds + millseconds / 1000 + 15)}rad);`
            );

            const date = now.getDate();
            if (dateInnerElement.innerText !== `${date}`) {
                dateInnerElement.innerText = date;
            }
        }, 1000 / hz);

        return timer;
    }



    function setDialPrague() {
        dialColor = 'white';
        handsColor = 'black';
        hz = 10;

        faceElement.setAttribute('style', 'background: white;');
        indexLineOuter.setAttribute('style', 'width: 94%; height: 94%; margin: 3%; border: calc(var(--radius) * 0.003) solid black; ');
        indexLineInner.setAttribute('style', 'border: calc(var(--radius) * 0.003) solid black;');

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
    }

    function setDialSpeedMaster() {
        dialColor = '#282828';
        handsColor = 'white';
        hz = 6;

        faceElement.setAttribute('style', `background: linear-gradient(135deg, #515151, #1C1C1C);`);
        faceInnerElement.setAttribute('style',
            `width: 79.2142%; ` +
            `height: 79.2142%; margin: 10.3929%; ` +
            `background: background: linear-gradient(135deg, #353535, #272727);` +
            `box-shadow: rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.004) 0px, rgba(0, 0, 0, 0.4) 0px 1px calc(${radius} * 0.02) 1px;`
        );

        indexLineOuter.setAttribute('style', 'width: 100%; height: 100%; margin: 0%; border: none; background-image: none;');
        indexLineInner.setAttribute('style', 'border: none; background-image: none;');
        dateOuterElement.setAttribute('style', 'display: none');

        handsCircleElement.setAttribute('style', `width: calc(${radius} * 0.0076046); height: calc(${radius} * 0.0076046); background: black;`);

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

            childInner.setAttribute('style', `width: ${indexWidth}; height: ${indexHeight}; margin-top: ${indexMarginTop}; background: #D7E1C3; border-radius: ${indexBorderRadius};`);

            child.appendChild(childInner);
            indexLineOuterUL.appendChild(
                child
            );
        });
    }
};