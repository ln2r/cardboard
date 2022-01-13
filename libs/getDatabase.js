import { Database, OPEN_READWRITE } from '@vscode/sqlite3'
import { DATABASE_DIRECTORY } from '../consts/DatabaseDirectory';


export const getDatabase = (sql) => {
  const db = new Database(`${DATABASE_DIRECTORY}/cardboard.db`, OPEN_READWRITE, (err)=> {
    if (err) {
      throw err
    }
  });

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) throw err
      
      if (rows) {
        resolve(rows)
      } else {
        reject('Unable to get table data.')
      }
    })
  
    db.close((err) => {
      if (err) throw err;
    });
  });
}