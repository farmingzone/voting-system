import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = path.join(__dirname, '../voting.db');

if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Database reset successfully.');
}

const db = new sqlite3.Database(dbPath, (err: Error | null) => {
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
