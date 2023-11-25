function translateText() {
    const azureFunctionUrl = 'https://deepropenai.azurewebsites.net/api/http_trigger?code=O5mDT87drM49UMiHKqjPqTSnrxrQw0mBsY83sh1XVomlAzFuVxzjwQ==';
    const sourceLangElement = document.getElementById('source-lang');
    const targetLangElement = document.getElementById('target-lang');
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