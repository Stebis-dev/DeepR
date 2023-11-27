const sourceLangElement = document.getElementById("source-lang");
const targetLangElement = document.getElementById("target-lang");
const sourceTextElement = document.getElementById("source-text");
const translatedTextElement = document.getElementById("translated-text");
const sourceDeleteBtn = document.getElementById("source-input-delete-btn");
const sourceLimitLabel = document.getElementById("source-input-limit-label");
const copyToClipboardBtn = document.getElementById("output-copy-btn");
const outputVoiceBtn = document.getElementById("output-voice-btn");
const loaderElement = document.getElementById("loader");

var select = document.getElementById("selectNumber");
var options = ["English", "Lithuanian", "German", "Latvian", "Polish", "Portuguese", "Romanian", "Russian", "Slovenian", "Swedish", "Turkish", "Greek", "Dutch", "Italian", "Indonesian", "Korean", "Chinese (simplified)", "Estonian", "French"];
populateLanguages(sourceLangElement, 1);
populateLanguages(targetLangElement, 0);

sourceLangElement.addEventListener("input", function () {
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
});

let timer;
const waitTime = 1500;
sourceTextElement.addEventListener('input', function () {
    if (this.value.length > 0) {
        sourceDeleteBtn.style.display = "block";
        sourceLimitLabel.style.display = "block";
        sourceLimitLabel.textContent = sourceTextElement.value.length + "/50";
    } else {
        sourceDeleteBtn.style.display = "none";
        sourceLimitLabel.style.display = "none";
        copyToClipboardBtn.style.display = 'none';
        outputVoiceBtn.style.display = 'none';
    }
});

sourceTextElement.addEventListener('keyup', event => {

    clearTimeout(timer);

    timer = setTimeout(() => {
        if (!window.matchMedia('(max-width: 620px)').matches && sourceTextElement.value != "") {
            translateText();
        }
    }, waitTime);
});

function populateLanguages(element, select) {
    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = i;
        element.appendChild(el);
    }
    element.options[select].selected = 'selected';

}
function swapText() {
    const selectedSourceLang = sourceLangElement.value;
    sourceLangElement.value = targetLangElement.value;
    targetLangElement.value = selectedSourceLang;

    const t = sourceTextElement.value;
    sourceTextElement.value = translatedTextElement.value;
    translatedTextElement.value = t;
}
function deleteInputText() {
    sourceTextElement.value = "";
    translatedTextElement.value = "";
    sourceDeleteBtn.style.display = "none";
    sourceLimitLabel.style.display = "none";
    copyToClipboardBtn.style.display = 'none';
    outputVoiceBtn.style.display = 'none';
}
function copyToClipboard() {
    navigator.clipboard.writeText(translatedTextElement.value);
}
function startLoading() {
    translatedTextElement.style.display = "none";
    loaderElement.style.display = "block"
}
function stopLoading() {
    translatedTextElement.style.display = "block";
    loaderElement.style.display = "none";
}
function translateText() {
    startLoading();
    const azureFunctionUrl = 'https://deepropenai.azurewebsites.net/api/http_trigger?code=O5mDT87drM49UMiHKqjPqTSnrxrQw0mBsY83sh1XVomlAzFuVxzjwQ==';
    const styleElement = document.getElementById('language-style');
    // azureFunctionUrl = '';
    if (!sourceLangElement || !targetLangElement) {
        console.error('Language selection elements not found');
        return;
    }
    const data = {
        'text': sourceTextElement.value,
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
            if (translatedTextElement.value.trim().length > 0) {
                copyToClipboardBtn.style.display = 'block';
                outputVoiceBtn.style.display = 'block';
            }
            stopLoading();
        })
        .catch(error => {
            stopLoading();
            console.error(error.message);
        });
}
function textToSpeech() {
    const text = document.getElementById('translated-text').value;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);

}

function apiCall() {
    startLoading();
    // Simulating an API call
    setTimeout(() => {
        var textarea = sourceTextElement;
        textarea.value = 'API response text'; // Set this to your actual API response

        if (textarea.value.trim().length > 0) {
            document.getElementById('translated-text').value = "text";
            copyToClipboardBtn.style.display = 'block';
            outputVoiceBtn.style.display = 'block';// Show the button
        }
        stopLoading();
    }, 1000);
}

// apiCall(); // Simulate API call