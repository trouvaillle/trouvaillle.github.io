window.onload = () => {
    let header = document.querySelector('body > header');
    header.removeAttribute('style');
    window.onscroll = (evt) => {
        let percentage = Math.floor(100 * window.scrollY / (document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight));
        header.setAttribute('style', `border-top: transparent; border-bottom: 2px solid; border-image: linear-gradient(to right,#3135cc ${percentage}%,#404040 ${percentage}%) 100;`);
    };
}
