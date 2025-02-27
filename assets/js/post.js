
window.onload = () => {
    let hide = document.querySelector('.sidebar .header .page-heading .hide');
    hide.addEventListener('click', () => {
      let sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('hidden');
        if (sidebar.classList.contains('hidden')) {
          hide.innerHTML = '&#x276F;';
        } else {
          hide.innerHTML = '&#x276E;';
        }
      }
    });

   let onScrollFunctions = [];
   window.onscroll = (_) => {
        onScrollFunctions.forEach(
            (it) => {
                it.call();
            }
        );
    };

    function createProgressIndicator() {
        let progressIndicatorOuter = document.querySelector('#progress-indicator-outer');
        if (progressIndicatorOuter == null) {
            let contentElement = document.document.querySelector("body > article > div.post-content.e-content");
            if (contentElement != null) {
                let div = document.createElement('div');
                div.id = "progress-indicator-outer";
                div.setAttribute('style', 'position: fixed; left: 0; top: 0; width: 100%; height: 3px; pointer-events: none;')
                
                let divInner = document.createElement('div');
                divInner.id = "progress-indiciator"
                divInner.classList.add('progress-indicator');
                divInner.setAttribute('style', 'width: 0%;');
        
                div.appendChild(divInner);
                document.body.appendChild(div);
                
                
                // let maxScrollHeight = document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight;
                let maxScrollHeight = Array.from(document.querySelectorAll('header')).reduce((prev, curr) => prev.clientHeight + curr.clientHeight) +
                    contentElement.clientHeight - 
                    document.scrollingElement.clientHeight;
        
                onScrollFunctions.push(
                    () => {
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
                    }
                );
            }
        }
    }

    let siteHeader = document.querySelector('header.site-header');
    let mainElement = document.querySelector('body > main');
    if (siteHeader != null && !siteHeader.classList.contains('attached')) {
        siteHeader.classList.add('attached');
        onScrollFunctions.push(
            () => {
                if (document.scrollingElement.scrollTop > siteHeader.clientHeight) {
                    siteHeader.classList.add('fixed');
                    if (mainElement != null && mainElement.getAttribute('style') == null) {
                        mainElement.setAttribute('style', `margin-top: ${siteHeader.clientHeight}px;`);
                    }
                } else {
                    siteHeader.classList.remove('fixed');
                    if (mainElement != null && mainElement.getAttribute('style') != null) {
                        mainElement.removeAttribute('style');
                    }
                }
            }
        );
    }

    function menuBehavior() {
        const menu = document.querySelector('#menu');
        const floatingSidebar = document.querySelector("#root > .floating-sidebar");
        const root = document.querySelector('#root');
        if (menu === null || floatingSidebar === null) return;
        menu.addEventListener('click', () => {
            floatingSidebar.toggleAttribute('data-open');
            root.toggleAttribute('data-floating-open');
        });
    }

    function hideMainHits() {
        document.addEventListener('scroll', () => {
            const hits = document.querySelector('.sidebar > .hits');
            if (hits) {
                if (document.scrollingElement.scrollTop > 0) {
                    hits.style.opacity = '0';
                } else {
                    hits.style.opacity = '1';
                }
            }
        });
    }

    // createProgressIndicator();
    menuBehavior();
    hideMainHits();
};
