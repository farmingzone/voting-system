import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database('./voting.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Database connected.');

        // 테이블을 드롭하고 다시 생성
        db.serialize(() => {
            db.run('DROP TABLE IF EXISTS polls');
            db.run('DROP TABLE IF EXISTS options');
            db.run('CREATE TABLE polls (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL)');
            db.run('CREATE TABLE options (id INTEGER PRIMARY KEY AUTOINCREMENT, poll_id INTEGER, text TEXT, votes INTEGER DEFAULT 0)');
        });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/polls', (req, res) => {
    db.all('SELECT * FROM polls', [], (err, polls) => {
        if (err) {
            return res.status(500).send({ message: 'Error retrieving polls.' });
        }
        res.status(200).send(polls);
    });
});

app.post('/polls', (req, res) => {
    const { question, options } = req.body;
    if (!question || !options || options.length === 0) {
        return res.status(400).send({ message: 'Question and options are required.' });
    }

    db.run('INSERT INTO polls (question) VALUES (?)', [question], function(err) {
        if (err) {
            return res.status(500).send({ message: 'Error creating poll.' });
        }
        const pollId = this.lastID;
        const insertOptions = 'INSERT INTO options (poll_id, text) VALUES (?, ?)';
        options.forEach((option:string )=> {
            db.run(insertOptions, [pollId, option]);
        });
        res.status(201).send({ message: 'Poll created.', pollId: pollId });
    });
});

app.get('/polls/:pollId/options', (req, res) => {
    const { pollId } = req.params;
    db.all('SELECT * FROM options WHERE poll_id = ? ORDER BY id ASC', [pollId], (err, options) => {
        if (err) {
            return res.status(500).send({ message: 'Error retrieving options.' });
        }
        res.status(200).send(options);
    });
});

app.post('/polls/:pollId/vote', (req, res) => {
    const { optionId } = req.body;
    db.run('UPDATE options SET votes = votes + 1 WHERE id = ?', [optionId], function(err) {
        if (err) {
            return res.status(500).send({ message: 'Error voting.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ message: 'Option not found.' });
        }
        res.status(200).send({ message: 'Vote registered.' });
    });
});

// 투표 결과 조회
app.get('/polls/:pollId/results', (req, res) => {
    const { pollId } = req.params;
    const query = 'SELECT text, votes FROM options WHERE poll_id = ?';
    db.all(query, [pollId], (err, results) => {
        if (err) {
            res.status(500).send({ message: 'Error retrieving results.' });
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: 'No results found.' });
            return;
        }
        res.status(200).json(results);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
