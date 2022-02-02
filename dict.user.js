// ==UserScript==
// @name         Dict
// @version      0.1
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @connect      api.dictionaryapi.dev
// ==/UserScript==

let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(el => { try { el.style['-webkit-user-select'] = "text"; } catch(e) {} })
        } else if (mutation.type === 'attributes') {
            try { mutation.target.style['-webkit-user-select'] = "text"; } catch(e) {}
        }
    }
});

observer.observe(unsafeWindow.document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
});

let current = unsafeWindow.current = false;

unsafeWindow.onselectstart = () => {
    if (current) return;
    current = true;
    setTimeout(() => {
        let selected = unsafeWindow.getSelection().toString().trim();
        console.log(selected)
        GM_xmlhttpRequest({
            url: `https://api.dictionaryapi.dev/api/v2/entries/en/${selected}`,
            method: 'GET',
            responseType: 'json',
            timeout: 10000,
            onload: (data) => {
                try {
                    let def = data.response[0].meanings[0].definitions.map(r => r.definition).join('  |  ');
                    let div = document.createElement('div')
                    div.style.zIndex = 2147483647;
                    div.style.position = 'fixed';
                    div.style.top = "50%";
                    div.style.left = "50%";
                    div.style.transform = "translate(-50%, -50%);";
                    div.style.width = '200px';
                    div.style.fontSize = '8px'
                    div.style.lineHeight = "100%";
                    div.style.color = 'darkgrey';
                    div.style.backgroundColor = 'white';
                    div.style.padding = '3px';
                    div.textContent = def;
                    div.onclick = () => {document.body.removeChild(div)}
                    document.body.appendChild(div);
                    console.log(div)
                } catch(e) { console.log(e) }
            }
        })
        setTimeout(() => {current = false}, 3000);
    }, 2000)
}
