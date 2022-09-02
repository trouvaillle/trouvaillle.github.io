window.onload = () => {
    /*
    let header = document.querySelector('body > header');
    header.removeAttribute('style');
    window.onscroll = (evt) => {
        let percentage = Math.floor(100 * window.scrollY / (document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight));
        header.setAttribute('style', `border-top: transparent; border-bottom: 2px solid; border-image: linear-gradient(to right,#3135cc ${percentage}%,#404040 ${percentage}%) 100;`);
    };
    */
   let progressIndicator = document.querySelector('#progress-indicator');
    if (progressIndicator == null) {
        let div = document.createElement('div');
        div.id = "progress-indicator";
        div.setAttribute('style', 'position: fixed; left: 0; top: 0; width: 100%; height: 3px; pointer-events: none;')
        
        let divInner = document.createElement('div');
        divInner.classList.add('progress-indicator');
        divInner.setAttribute('style', '');

        div.appendChild(divInner);
        document.body.appendChild(div);

        // let maxScrollHeight = document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight;
        let maxScrollHeight = Array.from(document.querySelectorAll('header')).reduce((prev, curr) => prev.clientHeight + curr.clientHeight) +
            document.querySelector('body > main > div > article > div.post-content.e-content').clientHeight - 
            document.scrollingElement.clientHeight;

        window.onscroll = (_) => {
            let percentage = Math.ceil(
                1000 * 
                document.scrollingElement.scrollTop / 
                maxScrollHeight
            ) / 10;
            
            if (percentage != NaN && percentage != null && percentage != undefined) {
                if (percentage < 0) {
                    percentage = 0;
                } else if (percentage > 100) {
                    percentage = 100;
                }
                // divInner.setAttribute('style', `background-color: #fff; width: ${percentage}%; height: 100%; pointer-events: none; transition:0.1s;`);
                divInner.setAttribute('style', `width: ${percentage}%;`);
            }
        };
    }
}
