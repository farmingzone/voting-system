// app.js

function addOption() {
    const optionsContainer = document.getElementById('optionsContainer');
    const newOption = document.createElement('input');
    newOption.type = 'text';
    newOption.className = 'option';
    newOption.placeholder = `Option ${optionsContainer.children.length + 1}`;
    optionsContainer.appendChild(newOption);
}

function createPoll() {
    const question = document.getElementById('question').value;
    const options = Array.from(document.getElementsByClassName('option'), input => input.value);
    fetch('/polls', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, options })
    }).then(response => response.json())
      .then(data => console.log(data));
}

function submitVote() {
    // Function to submit a vote
}

function showResults() {
    // Function to show results
}

// Additional functions to load polls and handle user interaction
