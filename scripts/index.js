const languageStyleElement = document.getElementById("language-style");
const sourceLangElement = document.getElementById("source-lang");
const targetLangElement = document.getElementById("target-lang");
const sourceTextElement = document.getElementById("source-text");
const translatedTextElement = document.getElementById("translated-text");
const sourceDeleteBtn = document.getElementById("source-input-delete-btn");
const sourceLimitLabel = document.getElementById("source-input-limit-label");
const copyToClipboardBtn = document.getElementById("output-copy-btn");
const outputVoiceBtn = document.getElementById("output-voice-btn");
const loaderElement = document.getElementById("loader");
const maxTextLength = 50;
let recognition;
let utterance;
let timer;
const waitTime = 1500;
let isRecognitionActive = false;
let finalTranscript = '';
var select = document.getElementById("selectNumber");
var options = ["English", "Lithuanian", "German", "Latvian", "Polish", "Portuguese", "Romanian", "Russian", "Slovenian", "Swedish", "Turkish", "Greek", "Dutch", "Italian", "Indonesian", "Korean", "Chinese (simplified)", "Estonian", "French", "Japan"];
populateLanguages(sourceLangElement, 1);
populateLanguages(targetLangElement, 0);

document.addEventListener('DOMContentLoaded', function () {
    initSpeechRecognition();
});
sourceLangElement.addEventListener("input", function () {
    sourceFilter();
    translateText();
});
targetLangElement.addEventListener("input", function () {
    targetFilter();
    translateText();
});
languageStyleElement.addEventListener("input", function () {
    translateText();
});

sourceTextElement.addEventListener('input', function () {
    inputCalculator();
});

sourceTextElement.addEventListener('keyup', event => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        if (!window.matchMedia('(max-width: 620px)').matches && sourceTextElement.value != "") {
            translateText();
        }
    }, waitTime);
});

function sourceFilter() {
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
            targetLangElement.options[i].style.display = 'flex';
        }
    }
}
function targetFilter() {
    const selectedSourceLang = targetLangElement.value;
    if (selectedSourceLang === sourceLangElementargetLangElement.options[sourceLangElementargetLangElement.selectedIndex].value) {
        let currentIndex = targetLangElement.selectedIndex;
        currentIndex = (currentIndex + 1) % sourceLangElementargetLangElement.options.length;
        sourceLangElementargetLangElement.selectedIndex = currentIndex;
    }
    for (let i = 0; i < sourceLangElementargetLangElement.options.length; i++) {
        if (sourceLangElementargetLangElement.options[i].value === selectedSourceLang) {
            sourceLangElementargetLangElement.options[i].style.display = 'none';
        } else {
            sourceLangElementargetLangElement.options[i].style.display = 'flex';
        }
    }
}

function inputCalculator() {
    const sourceTextElement = document.getElementById('source-text');
    const textLength = sourceTextElement.value.length;
    if (checkIfZero()) {
        sourceDeleteBtn.style.display = "flex";
        sourceLimitLabel.style.display = "flex";
        sourceLimitLabel.textContent = textLength + "/" + maxTextLength;
    } else {
        hide();
    }
}

function hide() {
    sourceDeleteBtn.style.display = "none";
    sourceLimitLabel.style.display = "none";
    copyToClipboardBtn.style.display = 'none';
    outputVoiceBtn.style.display = 'none';
}

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
    sourceFilter();
    translateText();
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
    // alert("Copied!");
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "flex";
    tooltip.style.opacity = "1";

    setTimeout(function () {
        tooltip.style.opacity = "0";
        setTimeout(function () { tooltip.style.display = "none"; }, 300); // Hide after fade out
    }, 1000); // Tooltip display duration
}
function startLoading() {
    translatedTextElement.style.display = "none";
    loaderElement.style.display = "flex"
}
function stopLoading() {
    translatedTextElement.style.display = "flex";
    loaderElement.style.display = "none";
}
function checkIfZero() {
    const textLength = sourceTextElement.value.length;
    return textLength > 0;
}
function translateText() {
    if (checkIfZero()) {
        startLoading();
        const azureFunctionUrl = 'https://deepropenai.azurewebsites.net/api/http_trigger?code=O5mDT87drM49UMiHKqjPqTSnrxrQw0mBsY83sh1XVomlAzFuVxzjwQ==';
        const styleElement = document.getElementById('language-style');
        // const azureFunctionUrl = '';
        if (!sourceLangElement || !targetLangElement) {
            console.error('Language selection elements not found');
            showError("Language selection elements not found")
            return;
        }
        const data = {
            'text': sourceTextElement.value,
            'source_lang': sourceLangElement.options[sourceLangElement.selectedIndex].text,
            'target_lang': targetLangElement.options[targetLangElement.selectedIndex].text,
            'style': styleElement.options[styleElement.selectedIndex].text
        };
        console.log(data);
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
                    copyToClipboardBtn.style.display = 'flex';
                    outputVoiceBtn.style.display = 'flex';
                }
                stopLoading();
            })
            .catch(error => {
                stopLoading();
                showError("Error oqured")
                console.error(error.message);
            });
    }
}
function textToSpeech() {
    const text = document.getElementById('translated-text').value;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCodes[targetLangElement.options[targetLangElement.selectedIndex].text] || 'en-US';
    speechSynthesis.speak(utterance);
}

const languageCodes = {
    "English": "en-US",
    "Lithuanian": "lt-LT",
    "German": "de-DE",
    "Latvian": "lv-LV",
    "Polish": "pl-PL",
    "Portuguese": "pt-PT",
    "Romanian": "ro-RO",
    "Russian": "ru-RU",
    "Slovenian": "sl-SI",
    "Swedish": "sv-SE",
    "Turkish": "tr-TR",
    "Greek": "el-GR",
    "Dutch": "nl-NL",
    "Italian": "it-IT",
    "Indonesian": "id-ID",
    "Korean": "ko-KR",
    "Chinese (simplified)": "zh-CN",
    "Estonian": "et-EE",
    "French": "fr-FR"
};



function initSpeechRecognition() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("No support for speech recognition.");
        return false;
    } else {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.lang = languageCodes[sourceLangElement.options[sourceLangElement.selectedIndex].text] || 'lt-LT';
        recognition.onresult = function (event) {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            const textLength = sourceTextElement.value.length;
            document.getElementById('source-text').value = finalTranscript + interimTranscript;
            inputCalculator()
            if (textLength >= maxTextLength) {
                voiceRecordEnd();
                showMic();
            }

        };
        recognition.onend = function () {
            if (isRecognitionActive) {
                recognition.start();
            }
        };
        recognition.onerror = function (event) {
            console.error("Speech recognition error", event);
        };
        return true;
    }
}
function voiceRecordStart() {

    if (recognition) {
        initSpeechRecognition();
        finalTranscript = '';
        recognition.start();
        document.getElementById('voice-to-text-start-btn').disabled = true;
        hideMic();
    } else {
        console.error("Speech recognition is not initialized");
    }
}
function voiceRecordEnd() {
    if (recognition) {
        recognition.stop();
        document.getElementById('voice-to-text-start-btn').disabled = false;
        translateText();
        showMic();
    } else {
        showMic()
        console.error("Speech recognition is not initialized");
    }
}
function hideMic() {
    document.getElementById("voice-to-text-start-btn").style.display = "none";
    document.getElementById("voice-to-text-stop-btn").style.display = "flex";
}
function showMic() {
    document.getElementById("voice-to-text-stop-btn").style.display = "none";
    document.getElementById("voice-to-text-start-btn").style.display = "flex";
}

function showError(message) {
    var errorMessageDiv = document.getElementById('errorMessage');
    var errorText = document.getElementById('errorText');
    errorText.innerHTML = message;
    errorMessageDiv.style.display = 'flex';

    // Hide the message after 5 seconds
    setTimeout(function () {
        errorMessageDiv.style.display = 'none';
    }, 5000);
}

function apiCall() {
    startLoading();
    setTimeout(() => {
        var textarea = sourceTextElement;
        textarea.value = 'API response text';

        if (textarea.value.trim().length > 0) {
            document.getElementById('translated-text').value = "text";
            copyToClipboardBtn.style.display = 'flex';
            outputVoiceBtn.style.display = 'flex';
        }
        stopLoading();
    }, 1000);
}
hide();
sourceFilter();
targetFilter();
// apiCall();
