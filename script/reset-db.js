const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../voting.db');

// 데이터베이스 파일 삭제
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Database reset successfully.');
}

// 데이터베이스 및 테이블 재생성
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        return;
    }
    db.serialize(() => {
        db.run('CREATE TABLE polls (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL)');
        db.run('CREATE TABLE options (id INTEGER PRIMARY KEY AUTOINCREMENT, poll_id INTEGER, text TEXT, votes INTEGER DEFAULT 0)', () => {
            console.log('Database tables created successfully.');
        });
    });
    db.close(() => {
        console.log('Database connection closed.');
    });
});
