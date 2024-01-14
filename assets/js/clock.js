window.onload = () => {

    const radius = getComputedStyle(document.documentElement)
        .getPropertyValue('--radius');

    function romanize(num) {
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

    const indexNumberUL = document.querySelector('#index-number > ul');
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

    const indexLineOuterUL = document.querySelector('#index-line-outer > ul');
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

    const hour = document.querySelector('#hour');
    const minute = document.querySelector('#minute');
    const second = document.querySelector('#second');
    const day = document.querySelector('#day-inner');

    const timer = setInterval(() => {
        let now = new Date();

        hour.setAttribute('style', `position: absolute; ` +
            `left: calc(${radius} * 0.05); ` +
            `top: calc(${radius} * 0.5); ` +
            `box-shadow: calc(${radius} * 0.15) 0 0 white inset, calc(${radius} * 0.45) 0 0 black inset;` +
            `width: calc(${radius} * 0.9);` +
            `height: calc(${radius} * 0.006);` +
            `transform: rotateZ(${2 * Math.PI / 12 * (now.getHours() + now.getMinutes() / 60 + 3)}rad);`);

        minute.setAttribute('style', `position: absolute; ` +
            `left: calc(${radius} * 0.05); ` +
            `top: calc(${radius} * 0.5); ` +
            `box-shadow: calc(${radius} * 0.03) 0 0 white inset, calc(${radius} * 0.45) 0 0 black inset;` +
            `width: calc(${radius} * 0.9);` +
            `height: calc(${radius} * 0.006);` +
            `transform: rotateZ(${2 * Math.PI / 60 * (now.getMinutes() + now.getSeconds() / 60 + 15)}rad);`);

        second.setAttribute('style', `position: absolute; ` +
            `left: calc(${radius} * 0.05); ` +
            `top: calc(${radius} * 0.5); ` +
            `box-shadow: calc(${radius} * 0.03) 0 0 white inset, calc(${radius} * 0.45) 0 0 black inset;` +
            `width: calc(${radius} * 0.9);` +
            `height: calc(${radius} * 0.006);` +
            `transform: rotateZ(${2 * Math.PI / 60 * (now.getSeconds() + now.getMilliseconds() / 1000 + 15)}rad);`);

        day.innerText = now.getDate();
    }, 1000 / 10);
};