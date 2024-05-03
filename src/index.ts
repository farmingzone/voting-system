import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database('./voting.db', (err) => {
    if (err) console.error('Error opening database', err.message);
    else {
        console.log('Database connected.');
        db.serialize(() => {
            db.run('DROP TABLE IF EXISTS polls');
            db.run('DROP TABLE IF EXISTS options');
            db.run('CREATE TABLE polls (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL)');
            db.run('CREATE TABLE options (id INTEGER PRIMARY KEY AUTOINCREMENT, poll_id INTEGER, text TEXT, votes INTEGER DEFAULT 0)');
        });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.get('/polls', (req, res) => {
    db.all('SELECT * FROM polls', [], (err, polls) => {
        if (err) res.status(500).send({ message: 'Error retrieving polls.' });
        else res.status(200).send(polls);
    });
});

// 옵션 배열을 다루는 부분
app.post('/polls', (req, res) => {
    const { question, options } = req.body;
    if (!question || !options || options.length === 0) {
        return res.status(400).send({ message: 'Question and options are required.' });
    }

    db.run('INSERT INTO polls (question) VALUES (?)', [question], function(err) {
        if (err) {
            return res.status(500).send({ message: 'Error creating poll.' });
        }
        const pid = this.lastID;
        const sql = 'INSERT INTO options (poll_id, text) VALUES (?, ?)';
        options.forEach((opt: string) => db.run(sql, [pid, opt]));
        res.status(201).send({ message: 'Poll created.', pollId: pid });
    });
});

app.get('/polls/:pollId/options', (req, res) => {
    const pid = req.params.pollId;
    db.all('SELECT * FROM options WHERE poll_id = ? ORDER BY id ASC', [pid], (err, opts) => {
        if (err) res.status(500).send({ message: 'Error retrieving options.' });
        else res.status(200).send(opts);
    });
});

app.post('/polls/:pollId/vote', (req, res) => {
    const oid = req.body.optionId;
    db.run('UPDATE options SET votes = votes + 1 WHERE id = ?', [oid], function(err) {
        if (err) res.status(500).send({ message: 'Error voting.' });
        else if (this.changes === 0) res.status(404).send({ message: 'Option not found.' });
        else res.status(200).send({ message: 'Vote registered.' });
    });
});

// 투표 결과 조회 부분
interface OptionResult {
    text: string;
    votes: number;
}

app.get('/polls/:pollId/results', (req, res) => {
    const { pollId } = req.params;
    db.all('SELECT text, votes FROM options WHERE poll_id = ?', [pollId], (err, results: OptionResult[]) => {
        if (err) {
            res.status(500).send({ message: 'Error retrieving results.' });
            return;
        }
        if (results.length === 0 || results.every(opt => opt.votes === 0)) {
            res.status(200).send({ message: 'No votes have been submitted yet.' });
            return;
        }
        res.status(200).json(results);
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
