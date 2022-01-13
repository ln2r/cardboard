import { rm, rmdir } from 'fs'

import { getDatabase } from '../../libs/getDatabase'
import { setDatabaseTable } from '../../libs/setDatabaseTable'
import { STORAGE_DIRECTORY } from '../../consts/StoragegDirectory'

export default async function handler(req, res) {
  switch (req.method) {
    case "DELETE":
      try {
        const object = req.body.path.replace(/\//gm, "\\")
        const db = await getDatabase(`SELECT * FROM files WHERE ObjectName = "${STORAGE_DIRECTORY}\\${object}";`)
        if (db.length != 0) {
          if (req.body.type == "file") {
            rm(`${STORAGE_DIRECTORY}\\${object}`, (err) => {
              if (err) throw err;
            })
          // recursivly deleting the folder
          } else {
            rmdir(`${STORAGE_DIRECTORY}\\${object}`, {recursive: true}, (err) => {
              if (err) throw err;
            })
          }

          await setDatabaseTable(`
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