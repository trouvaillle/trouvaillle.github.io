window.onload = () => {


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

    const indexNumber = document.querySelector('#index-number > ul');
    [...Array(12).keys()].forEach(it => {
        const child = document.createElement('li');
        child.setAttribute('style', `position: absolute; ` +
            `left: 54px; ` +
            `top: 18px; ` +
            `padding-bottom: 70px;` +
            `transform: rotateZ(${2 * Math.PI / 12 * (it + 1)}rad);`);
        child.innerText = `${romanize(it + 1)}`;
        indexNumber.appendChild(
            child
        );
    });
};