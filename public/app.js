document.addEventListener('DOMContentLoaded', function() {
    loadPolls();

    document.getElementById('pollsDropdown').addEventListener('change', function() {
        const pollId = this.value;
        loadPollOptions(pollId);
    });
});

function addOption() {
    const optionsContainer = document.getElementById('optionsContainer');
    const newOption = document.createElement('input');
    newOption.type = 'text';
    newOption.className = 'option';
    newOption.placeholder = `Option ${optionsContainer.children.length + 1}`;
    optionsContainer.appendChild(newOption);
}

function loadPolls() {
    fetch('/polls')
        .then(response => response.json())
        .then(polls => {
            const pollsDropdown = document.getElementById('pollsDropdown');
            pollsDropdown.innerHTML = '<option>Select a poll</option>';
            polls.forEach(poll => {
                const option = document.createElement('option');
                option.value = poll.id;
                option.textContent = poll.question;
                pollsDropdown.appendChild(option);
            });
        });
}

function createPoll() {
    const question = document.getElementById('question').value;
    const options = Array.from(document.getElementsByClassName('option'), input => input.value);
    fetch('/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        loadPolls();  // Refresh the polls list after creating a new poll
    });
}

function loadPollOptions(pollId) {
    fetch(`/polls/${pollId}/options`)
        .then(response => response.json())
        .then(options => {
            const optionsContainer = document.getElementById('voteOptions');
            optionsContainer.innerHTML = '';
            options.forEach(option => {
                const label = document.createElement('label');
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = 'voteOption';
                optionInput.value = option.id;

                label.appendChild(optionInput);
                label.appendChild(document.createTextNode(option.text));
                optionsContainer.appendChild(label);
                optionsContainer.appendChild(document.createElement('br'));
            });
        });
}

function submitVote() {
    const pollId = document.getElementById('pollsDropdown').value;
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (selectedOption) {
        fetch(`/polls/${pollId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId: selectedOption.value })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert('Vote submitted!');
        });
    } else {
        alert('You must select an option to vote!');
    }
}

function showResults() {
    const pollId = document.getElementById('pollsDropdown').value;
    fetch(`/polls/${pollId}/results`)
        .then(response => {
            if (response.ok && response.headers.get("Content-Type").includes("application/json")) {
                return response.json();
            }
            throw new Error('Invalid response format');
        })
        .then(results => {
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';
            results.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.textContent = `${result.text}: ${result.votes} votes`;
                resultsContainer.appendChild(resultDiv);
            });
        })
        .catch(error => {
            console.error('Error loading the results:', error);
            alert('Failed to load results: ' + error.message);
        });
}
