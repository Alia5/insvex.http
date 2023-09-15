import { DatabaseAdapter } from 'fliessheck';
import type { Database as BetterSqLite3Database } from 'better-sqlite3';
import type { Database } from 'bun:sqlite';


interface Row {
    path: string;
    thumbPath: string;
}

export class ThumbDbAdapter extends DatabaseAdapter<Database|BetterSqLite3Database> {

    public constructor(protected db: Database) {
        super(db);
        db.exec('CREATE TABLE IF NOT EXISTS thumbs (path TEXT, thumbPath TEXT)');
    }

    public removeThumb(path: string): void {
        this.db.prepare('DELETE FROM thumbs WHERE path = (?)').run(path);
        // return new Promise((resolve, reject) => {
        //     this.db.run('DELETE FROM thumbs WHERE path = (?)', path, (err) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve();
        //         }
        //     });
        // });
    }

    public addThumb(path: string, thumbPath: string) {
        const stmt = this.db.prepare('INSERT INTO thumbs VALUES (?, ?)');
        stmt.run(path, thumbPath);
    }

    public getThumb(path: string): string|undefined {
        const row = this.db.prepare('SELECT * FROM thumbs WHERE path = (?)').get(path) as Row;
        return row?.thumbPath;
    }

}
