window.onload = () => {

    const { radius, romanize } = define();
    const { indexNumberUL, indexLineOuterUL, hourElement, minuteElement, secondElement, dateElement } = getElements();

    setDial();
    clockwork({ hourElement, minuteElement, secondElement, dateElement });

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
        const indexNumberUL = document.querySelector('#index-number > ul');
        const indexLineOuterUL = document.querySelector('#index-line-outer > ul');

        const hourElement = document.querySelector('#hour');
        const minuteElement = document.querySelector('#minute');
        const secondElement = document.querySelector('#second');
        const dateElement = document.querySelector('#day-inner');

        return {
            indexNumberUL,
            indexLineOuterUL,
            hourElement,
            minuteElement,
            secondElement,
            dateElement
        };
    }

    function setDial(type) {
        switch (type) {
            case 'prague':
                setDialPrague();
                break;
            default:
                setDialPrague();
                break;
        }
    }

    function setDialPrague() {
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
            child.setAttribute('style', `position: absolute; ` +
                `left: calc(${radius} * 0.00); ` +
                `top: calc(${radius} * 0.47); ` +
                `border-right: calc(${radius} * 0.02) solid black;` +
                `width: calc(${radius} * 0.92);` +
                (it % 5 == 0 ? `height: calc(${radius} * 0.006);` : `height: calc(${radius} * 0.003);`) +
                `transform: rotateZ(${2 * Math.PI / 60 * (it)}rad);`);
            indexLineOuterUL.appendChild(
                child
            );
        });
    }

    function clockwork(params) {
        const { hourElement, minuteElement, secondElement, dateElement } = params;

        const timer = setInterval(() => {
            const now = new Date();

            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const millseconds = now.getMilliseconds();

            hourElement.setAttribute('style', `position: absolute; ` +
                `left: calc(${radius} * 0.05); ` +
                `top: calc(${radius} * 0.5); ` +
                `box-shadow: calc(${radius} * 0.15) 0 0 white inset, calc(${radius} * 0.45) 0 0 black inset;` +
                `width: calc(${radius} * 0.9);` +
                `height: calc(${radius} * 0.006);` +
                `transform: rotateZ(${2 * Math.PI / 12 * (hours + minutes / 60 + 3)}rad);`);

            minuteElement.setAttribute('style', `position: absolute; ` +
                `left: calc(${radius} * 0.05); ` +
                `top: calc(${radius} * 0.5); ` +
                `box-shadow: calc(${radius} * 0.03) 0 0 white inset, calc(${radius} * 0.45) 0 0 black inset;` +
                `width: calc(${radius} * 0.9);` +
                `height: calc(${radius} * 0.006);` +
                `transform: rotateZ(${2 * Math.PI / 60 * (minutes + seconds / 60 + 15)}rad);`);

            secondElement.setAttribute('style', `position: absolute; ` +
                `left: calc(${radius} * 0.05); ` +
                `top: calc(${radius} * 0.5); ` +
                `box-shadow: calc(${radius} * 0.03) 0 0 white inset, calc(${radius} * 0.45) 0 0 black inset;` +
                `width: calc(${radius} * 0.9);` +
                `height: calc(${radius} * 0.006);` +
                `transform: rotateZ(${2 * Math.PI / 60 * (seconds + millseconds / 1000 + 15)}rad);`);

            const date = now.getDate();
            if (dateElement.innerText !== date) {
                dateElement.innerText = date;
            }
        }, 1000 / 10);

        return timer;
    }
};