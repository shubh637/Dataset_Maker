let data = loadData();

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const newData = {
                content: content,
                questions: []
            };
            data.push(newData);
            saveData();
            displayText(content);
        };
        reader.readAsText(file, 'UTF-8');
    }
});

document.getElementById('text-display').addEventListener('mouseup', function() {
    const selectedText = window.getSelection();
    const startIndex = selectedText.anchorOffset;
    const endIndex = selectedText.focusOffset;

    if (startIndex !== endIndex) {
        document.getElementById('start-index').value = Math.min(startIndex, endIndex);
        document.getElementById('end-index').value = Math.max(startIndex, endIndex);
        document.getElementById('answer').value = selectedText.toString();
    }
});

document.getElementById('qa-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    const startIndex = document.getElementById('start-index').value;
    const endIndex = document.getElementById('end-index').value;

    const newData = {
        id: getNextQuestionId(),
        question: question,
        answer: answer,
        startIndex: parseInt(startIndex),
        endIndex: parseInt(endIndex)
    };

    const currentData = data[data.length - 1];
    currentData.questions.push(newData);
    saveData();
    displayQA(newData);

    // Clear the input fields
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
    document.getElementById('start-index').value = '';
    document.getElementById('end-index').value = '';
});

document.getElementById('download-json').addEventListener('click', function() {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions_and_answers.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

function displayText(content) {
    const textDisplay = document.getElementById('text-display');
    textDisplay.innerText = content;
}
// Event listener to delete a particular context
document.getElementById('delete-context').addEventListener('click', function() {
    const lastIndex = data.length - 1;
    data.splice(lastIndex, 1);
    saveData();
    location.reload(); // Reload the page to reflect the changes
});

// Event delegation to handle delete buttons for question-answer pairs
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-question')) {
        const contextIndex = event.target.getAttribute('data-context-index');
        const questionIndex = event.target.getAttribute('data-question-index');
        data[contextIndex].questions.splice(questionIndex, 1);
        saveData();
        location.reload(); // Reload the page to reflect the changes
    }
});

function displayQA(qaEntry) {
    const qaList = document.getElementById('qa-list');
    const qaDiv = document.createElement('div');
    qaDiv.classList.add('question-answer');
    qaDiv.innerHTML = `
        <span>ID:</span> ${qaEntry.id}<br>
        <span>Q:</span> ${qaEntry.question}<br>
        <span>A:</span> ${qaEntry.answer}<br>
        <span>Start Index:</span> ${qaEntry.startIndex}<br>
        <span>End Index:</span> ${qaEntry.endIndex}
    `;
    qaList.appendChild(qaDiv);
}

function saveData() {
    localStorage.setItem('qaData', JSON.stringify(data));
}

function loadData() {
    const storedData = localStorage.getItem('qaData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData.forEach(textData => {
            displayText(textData.content);
            textData.questions.forEach(question => {
                displayQA(question);
            });
        });
        return parsedData;
    }
    return [];
}

function getNextQuestionId() {
    let maxId = 0;
    data.forEach(textData => {
        textData.questions.forEach(question => {
            if (question.id > maxId) {
                maxId = question.id;
            }
        });
    });
    return maxId + 1;
}
