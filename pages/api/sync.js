import path from 'path'

import { getDatabase, getStorageData, setTableData } from '../../lib/storage'
const storageDir = path.join(process.cwd(), 'warehouse')

export default async function handler(req, res) {
  // TODO:
  // - add db for files

  switch (req.method) {
    case "GET":
      const filesDB = await getDatabase(`SELECT * FROM files;`);
      const storage = await getStorageData(storageDir)

      let newObject = [];
      let newObjectValue = [];
      let oldObject = [];
      let oldObjectValue = [];

      // comparing storage and db
      storage.forEach((file) => {
        let idx = 0;
        let found = false;
        while (!found && idx < filesDB.length) {
          
          if (file.name == filesDB[idx].ObjectName) {
            found = true;
          }

          idx++;
        }

        if (!found) {
          newObject.push(`("${file.name}", "${file.type}", "ln2r")`)
          newObjectValue.push(file)
        }
      })

      // comparing db and storage
      filesDB.forEach((object) => {
        let idx = 0;
        let found = false;
        while (!found && idx < storage.length) {
          if (object.ObjectName == storage[idx].name) {
            found = true;
          }

          idx++;
        }

        if (!found) {
          oldObject.push(object.ObjectId);
          oldObjectValue.push(object.ObjectName);
        }
      })

      if (newObject.length != 0) {
        setTableData(`
          INSERT INTO 
            files (ObjectName, ObjectType, Owner)
          VALUES ${newObject.join(', ')};
        `)
      }
      
      if (oldObject.length != 0) {
        const currentIncrement =  await getDatabase(`SELECT seq FROM sqlite_sequence WHERE name = "files";`)
        setTableData(`
          DELETE FROM
            files
          WHERE ObjectId IN (${oldObject.join(', ')})
        `)

        // update the auto increment
        setTableData(`
          UPDATE 
            sqlite_sequence
          SET seq = ${currentIncrement[0].seq - oldObject.length}
          WHERE name = "files";
        `)
      }

      res.status(200).json({
        added: newObjectValue,
        removed: oldObjectValue
      })
  }
}