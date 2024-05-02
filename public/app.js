// app.js

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
            pollsDropdown.innerHTML = '';  // 기존 목록을 비웁니다.
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
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, options })
    }).then(response => response.json())
      .then(data => {
          console.log(data);
          loadPolls();  // 투표 생성 후 목록을 다시 불러옵니다.
      });
}

function submitVote() {
    const pollId = document.getElementById('pollsDropdown').value;
    const selectedOption = document.querySelector('input[name="voteOption"]:checked');
    if (selectedOption) {
        fetch(`/polls/${pollId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ optionId: selectedOption.value })
        }).then(response => response.json())
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
        .then(response => response.json())
        .then(results => {
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';  // 기존 결과를 비웁니다.
            results.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.textContent = `${result.text}: ${result.votes} votes`;
                resultsContainer.appendChild(resultDiv);
            });
        });
}

function loadPollOptions(pollId) {
    fetch(`/polls/${pollId}/options`)  // 서버에 특정 투표의 옵션을 요청하는 URL
        .then(response => response.json())
        .then(options => {
            const optionsContainer = document.getElementById('voteOptions');
            optionsContainer.innerHTML = '';  // 이전 옵션들을 지우고 새로 시작
            options.forEach(option => {
                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = 'voteOption';  // 이 이름을 submitVote에서 참조
                optionInput.value = option.id;
                
                const label = document.createElement('label');
                label.appendChild(optionInput);
                label.appendChild(document.createTextNode(option.text));

                optionsContainer.appendChild(label);
                optionsContainer.appendChild(document.createElement('br'));
            });
        });
}

// Polls dropdown이 변경될 때마다 새로운 옵션을 로드합니다.
document.getElementById('pollsDropdown').addEventListener('change', function() {
    const pollId = this.value;
    if (pollId) {
        loadPollOptions(pollId);
    }
});


// Additional functions to load polls and handle user interaction
