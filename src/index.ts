import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const PORT = 3000;

// JSON 요청 본문 파싱을 위해
app.use(express.json());

// 정적 파일 제공을 위한 설정
app.use(express.static(path.join(__dirname, '../public')));

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./voting.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Database connected.');
        // 데이터베이스 연결 성공 후 테이블 생성
        db.run('CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL)', [], (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                console.log('Table created');
            }
        });
    }
});

// 기본 경로 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 투표 목록 조회
app.get('/polls', (req, res) => {
    const query = 'SELECT * FROM polls';
    db.all(query, [], (err, polls) => {
        if (err) {
            return res.status(500).send({ message: 'Error retrieving polls.' });
        }
        res.status(200).send(polls);
    });
});

// 투표 생성
app.post('/polls', (req, res) => {
    const { question, options } = req.body;
    if (!question || !options || options.length === 0) {
        return res.status(400).send({ message: 'Question and options are required.' });
    }

    const insertPoll = 'INSERT INTO polls (question) VALUES (?)';
    db.run(insertPoll, [question], function(err) {
        if (err) {
            return res.status(500).send({ message: 'Error creating poll.' });
        }

        const pollId = this.lastID;
        const insertOptions = 'INSERT INTO options (poll_id, text, votes) VALUES (?, ?, 0)';
        const promises = options.map((option: string) => {
            return new Promise<void>((resolve, reject) => {
                db.run(insertOptions, [pollId, option], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                res.status(201).send({ message: 'Poll created.', pollId: pollId });
            })
            .catch((err) => {
                res.status(500).send({ message: 'Error adding options.' });
            });

    });
});

// 투표하기
app.post('/polls/:pollId/vote', (req, res) => {
    const { optionId } = req.body;
    const { pollId } = req.params;

    if (!optionId) {
        return res.status(400).send({ message: 'Option ID is required.' });
    }

    const updateVote = 'UPDATE options SET votes = votes + 1 WHERE id = ? AND poll_id = ?';
    db.run(updateVote, [optionId, pollId], function(err) {
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
app.get('/polls/:pollId/options', (req, res) => {
    const { pollId } = req.params;
    const query = 'SELECT * FROM options WHERE poll_id = ?';
    db.all(query, [pollId], (err, options) => {
        if (err) {
            res.status(500).send({ message: 'Error retrieving options.' });
        } else {
            res.status(200).send(options);
        }
    });
});


// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
