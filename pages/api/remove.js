import path from 'path'
import fs from 'fs'

import { getDatabase, setTableData } from '../../lib/storage'
const storageDir = path.join(process.cwd(), 'warehouse')

export default async function handler(req, res) {
  switch (req.method) {
    case "DELETE":
      try {
        const object = req.body.path.replace(/\//gm, "\\")
        const db = await getDatabase(`SELECT * FROM files WHERE ObjectName = "${storageDir}\\${object}";`)
        if (db.length != 0) {
          if (req.body.type == "file") {
            fs.rm(`${storageDir}\\${object}`, (err) => {
              if (err) throw err;
            })
          // recursivly deleting the folder
          } else {
            fs.rmdir(`${storageDir}\\${object}`, {recursive: true}, (err) => {
              if (err) throw err;
            })
          }

          await setTableData(`
            DELETE FROM
              files
            WHERE
              ObjectId = "${db[0].ObjectId}";
          `)
        }
        
        res.status(200).json({
          res: "OK",
          object: db[0]
        })
      } catch (err) {
        if (err) {
          res.status(500).json({
            res: "Fail",
            message: "Error Occured"
          })
        }
      }
    break;
  }
}