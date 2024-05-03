// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', function () {
    var _a, _b, _c, _d;
    (_a = document.getElementById('addOptionButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', addOption);
    (_b = document.getElementById('createPollButton')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', createPoll);
    (_c = document.getElementById('submitVoteButton')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', submitVote);
    (_d = document.getElementById('showResultsButton')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', showResults);
    loadPolls();
    var pollsDropdown = document.getElementById('pollsDropdown');
    pollsDropdown.addEventListener('change', function () {
        var pid = pollsDropdown.value;
        loadPollOptions(parseInt(pid));
    });
});
function addOption() {
    var optCont = document.getElementById('optionsContainer');
    var newOpt = document.createElement('input');
    newOpt.type = 'text';
    newOpt.className = 'option';
    newOpt.placeholder = "Option ".concat(optCont.children.length + 1);
    optCont.appendChild(newOpt);
}
function loadPolls() {
    fetch('/polls')
        .then(function (resp) { return resp.json(); })
        .then(function (polls) {
        var pd = document.getElementById('pollsDropdown');
        pd.innerHTML = '<option>Select a poll</option>';
        polls.forEach(function (p) {
            var opt = document.createElement('option');
            opt.value = p.id.toString();
            opt.textContent = p.question;
            pd.appendChild(opt);
        });
    });
}
function createPoll() {
    var qi = document.getElementById('question');
    var q = qi.value;
    var opts = Array.from(document.getElementsByClassName('option'), function (inp) { return inp.value; });
    fetch('/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, options: opts })
    })
        .then(function (resp) { return resp.json(); })
        .then(function () {
        loadPolls();
    });
}
function loadPollOptions(pid) {
    fetch("/polls/".concat(pid, "/options"))
        .then(function (resp) { return resp.json(); })
        .then(function (opts) {
        var optCont = document.getElementById('voteOptions');
        optCont.innerHTML = '';
        opts.forEach(function (opt) {
            var label = document.createElement('label');
            var optInput = document.createElement('input');
            optInput.type = 'radio';
            optInput.name = 'voteOption';
            optInput.value = opt.id.toString();
            label.appendChild(optInput);
            label.appendChild(document.createTextNode(opt.text));
            optCont.appendChild(label);
            optCont.appendChild(document.createElement('br'));
        });
    });
}
function submitVote() {
    var pd = document.getElementById('pollsDropdown');
    var pid = parseInt(pd.value);
    var selOpt = document.querySelector('input[name="voteOption"]:checked');
    if (selOpt) {
        fetch("/polls/".concat(pid, "/vote"), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionId: parseInt(selOpt.value) })
        })
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
            alert('Vote submitted!');
        });
    }
    else {
        alert('You must select an option to vote!');
    }
}
function showResults() {
    var pd = document.getElementById('pollsDropdown');
    if (pd) {
        var pid = pd.value;
        fetch("/polls/".concat(pid, "/results"))
            .then(function (resp) {
            var _a;
            if (resp.ok && ((_a = resp.headers.get("Content-Type")) === null || _a === void 0 ? void 0 : _a.includes("application/json"))) {
                return resp.json();
            }
            throw new Error('Invalid response format');
        })
            .then(function (data) {
            var resCont = document.getElementById('resultsContainer');
            resCont.innerHTML = '';
            if ('message' in data) {
                resCont.textContent = data.message;
            }
            else {
                data.forEach(function (r) {
                    var resDiv = document.createElement('div');
                    resDiv.textContent = "".concat(r.text, ": ").concat(r.votes, " votes");
                    resCont.appendChild(resDiv);
                });
            }
        })["catch"](function (error) {
            console.error('Error loading the results:', error);
            alert('Failed to load results: ' + error.message);
        });
    }
}
