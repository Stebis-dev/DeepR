const sourceLangElement = document.getElementById("source-lang");
const targetLangElement = document.getElementById("target-lang");
const sourceTextElement = document.getElementById("source-text");

sourceLangElement.addEventListener("input", changeOptions);

let timer;

const waitTime = 1500;

const messageInput = document.getElementById('source-text');

messageInput.addEventListener('keyup', event => {
    clearTimeout(timer);

    timer = setTimeout(() => {
        if (!window.matchMedia('(max-width: 620px)').matches) {
            doneTyping();
        }
    }, waitTime);
});

function doneTyping() {
    // console.log(`The user is done typing: ${value}`);
    translateText()
}


function changeOptions() {
    const selectedSourceLang = sourceLangElement.value;

    if (selectedSourceLang === targetLangElement.options[targetLangElement.selectedIndex].value) {
        let currentIndex = sourceLangElement.selectedIndex;

        currentIndex = (currentIndex + 1) % targetLangElement.options.length;
        targetLangElement.selectedIndex = currentIndex;
    }

    for (let i = 0; i < targetLangElement.options.length; i++) {
        if (targetLangElement.options[i].value === selectedSourceLang) {
            targetLangElement.options[i].style.display = 'none';
        } else {
            targetLangElement.options[i].style.display = 'block';
        }
    }
}


function translateText() {
    const azureFunctionUrl = 'https://deepropenai.azurewebsites.net/api/http_trigger?code=O5mDT87drM49UMiHKqjPqTSnrxrQw0mBsY83sh1XVomlAzFuVxzjwQ==';
    const styleElement = document.getElementById('language-style');

    if (!sourceLangElement || !targetLangElement) {
        console.error('Language selection elements not found');
        return;
    }
    const data = {
        'text': document.getElementById('source-text').value,
        'source_lang': sourceLangElement.options[sourceLangElement.selectedIndex].text,
        'target_lang': targetLangElement.options[targetLangElement.selectedIndex].text,
        'style': styleElement.options[styleElement.selectedIndex].text
    };
    fetch(azureFunctionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`Failed to translate. Status code: ${response.status}`);
            }
        })
        .then(text => {
            document.getElementById('translated-text').value = text;
        })
        .catch(error => {
            console.error(error.message);
        });
}