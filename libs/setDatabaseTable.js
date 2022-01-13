import { Database, OPEN_READWRITE } from '@vscode/sqlite3';
import { DATABASE_DIRECTORY } from '../consts/DatabaseDirectory';

export const setDatabaseTable = (sql) => {
  const db = new Database(`${DATABASE_DIRECTORY}/cardboard.db`, OPEN_READWRITE, (err) => {
    if (err) throw err
  });

  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err)
      }

      resolve('OK')
    })

    db.close((err) => {
      if (err) throw err;
    })
  })
}