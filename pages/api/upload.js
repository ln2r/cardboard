import multer from 'multer'

import { existsSync, mkdirSync, writeFile, } from 'fs'

import { getDatabase } from '../../libs/getDatabase'
import { setDatabaseTable } from '../../libs/setDatabaseTable'
import { STORAGE_DIRECTORY } from '../../consts/StoragegDirectory'

export const config = {
  api: {
    bodyParser: false
  }
}

const upload = multer(); 
export default async function handler(req, res) {
  switch(req.method) {
    case "GET": 
      res.status(200).json({
        res: 'OK',
      })
    break;
    
    case "POST":
      try {
        console.log(`[API] Request received`);
      
        let response;        
        upload.array("objects")(req, {}, async (err) => {
          if (err) {
            response = {
              code: 500,
              message: "Error Occured",
            }

            throw err;
          }

          console.log(`[API] path: ${req.body.path}, author: ${req.body.author}, type: ${req.body.type}`);

          const path = (req.body.path == "root")? `${STORAGE_DIRECTORY}` : `${STORAGE_DIRECTORY}\\${req.body.path.replace(/\//gm, "\\")}`;
          let newObjects = []    

          // creation
          switch (req.body.type) {
            // folder handler
            case "folder" :
              if (!existsSync(`${path}/${req.body.objects}`)){
                mkdirSync(`${path}/${req.body.objects}`);
                
                newObjects.push(`("${path}\\${req.body.objects}", "${req.body.author}", "${req.body.type}")`);
                console.log(`[API] object added to database.`)
              } else {
                response = {
                  code: 409,
                  message: "Folder exist, creation request ignored"
                }
  
                console.log(`[API] Folder exist, creation request ignored`);
              }

              break;
            
            // files handler
            case "file": 
              req.files.forEach((request) => {
                // only add if it doesnt exist
                if (!existsSync(`${path}/${req.body.objects}`)){
                  writeFile(`${path}/${request.originalname}`, request.buffer, err => {
                    if (err) {
                      throw err;
                    }
                  })
                  
                  newObjects.push(`("${path}\\${request.originalname}", "${req.body.author}", "${req.body.type}")`);
                  console.log(`[API] object added to the queue.`)
                }
              });

              response = {
                code: 200,
                message: "OK"
              }            
              break;
            
            default:
              const objectsDb = await getDatabase(`
                SELECT * FROM 
                  files 
                WHERE 
                  ObjectName = "${path.replace(/\//gm, "\\")}\\${req.body.filename}";
              `);

              writeFile(`${path}/${req.body.filename}.md`, req.body.content, err => {
                if (err) {
                  throw err;
                }
              })

              if (objectsDb.length == 0) {
                newObjects.push(`("${path.replace(/\//gm, "\\")}\\${req.body.filename}.md", "${req.body.author}", "${req.body.type}")`);
                console.log(`[API] object added to database.`)
              }

              console.log(`[API] "${req.body.filename}.md" file created.`);
          }

          // adding files to db
          await setDatabaseTable(`
            INSERT INTO
              files(ObjectName, Owner, ObjectType)
            VALUES
              ${newObjects.join(', ')};
          `)

          console.log(`[API] ${req.files.length} files added`);
        })
        
        res.status(response.code).json({
          res: response.message,
        })
      } catch (err) {
        if (err) {
          res.status(500).json({
            res: "Error Occured"
          })
        }
      }
    break;

    case "PATCH":
      console.log(`[API] Patch endpoint requeststed`)
         
      upload.array("objects")(req, {}, async (err) => {
        if (err) throw err;
        console.log(`[API] path: ${req.body.path}, author: ${req.body.author}, type: ${req.body.type}`);

        const path = (req.body.path == "root")? `${STORAGE_DIRECTORY}` : `${STORAGE_DIRECTORY}\\${req.body.path.replace(/\//gm, "\\")}`;
        // creation
        writeFile(`${path}`, req.body.content, err => {
          if (err) {
            throw err;
          }
        })

        console.log(`[API] "${req.body.filename}.md" modified.`)
      })

      res.status(200).json({
        res: "OK",
      })
    break;
  }
}

