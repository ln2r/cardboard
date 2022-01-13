import { getDatabase } from "../../../libs/getDatabase";
import { setDatabaseTable } from "../../../libs/setDatabaseTable";

export default async function Handler (req, res) {
  switch (req.method) {
    // getting shared objects
    case "GET":
      try {
        // view shared object
        // url: http://<domain>:<port>/api/share/<objectType>/<shareId>
        // body: {"shareId": <shareId>, "type": <objectType>}
        if (req.query.param[0] === "object") {
          const db = await getDatabase(`SELECT * FROM shares WHERE ShareId = "${req.query.param[1]}";`);
          if (db.length !== 0) {
            // call objects endpoint
            const object = await fetch("http://localhost:3000/api/objects", {
              method: "POST",
              body: JSON.stringify({path: db[0].Object}),
              headers: {'Content-Type': 'application/json'}
            })

            res.status(200).json({
              res: "OK",
              owner: db[0].Owner,
              permission: db[0].Permission,
              object: await object.json()
            })
          } else {
            res.status(404).json({
              res: "Not Found",
              message: `Can not find any object under "${req.query.param[1]}".`
            })
          }
          
        // view list of shared objects
        // url: http://<domain>:<port>/api/share/list/<User>
        } else if (req.query.param[0] === "list") {
          const db = await getDatabase(`SELECT * FROM shares WHERE Owner = "${req.query.param[1]}"`);

          res.status(200).json({
            res: "OK",
            objects: db
          })

        // handling mismatched types
        } else {
          req.status(400).json({
            res: "Bad Request",
            message: "Invalid Type"
          })
        }        
      } catch (err) {
        if (err) {
          res.status(500).json({
            res: "Internal Server Error",
            message: err
          })
        }
      }
    break;

    // adding object
    // url: http://<domain>:<port>/api/share/add/
    // body: {"path": <path>, "owner": <username>, "permission": <permission_boolean>}
    case "POST":
      try {  
        if (req.query.param[0] === "add") {
          // id generation
          const generate = (max) => {
            const set = "abcdefghijklmnopqrstuvwxyz0123456789";
            let id = "";
            for (let i = 0; i <= max; i ++) {
              id += set.charAt(Math.floor(Math.random() * set.length))
            }

            return id;
          }

          let shareId = generate(5);

          // checking for id duplication
          // try to make another until "timeout" reached
          let found = true;
          let timeout = 0;
          while (found && timeout < 5) {
            const db = await getDatabase(`SELECT * FROM shares WHERE ShareId = "${shareId}"`)
            if (db.length == 0) {
              found = false;
            }

            timeout ++;
          }

          if (!found) {
            await setDatabaseTable(`
              INSERT INTO 
                shares(ShareId, Object, Owner, Permission)
              VALUES
                ("${shareId}", "${req.body.path}", "${req.body.owner}", ${req.body.permission});
            `)

            res.status(200).json({
              res: "OK",
              share_id: shareId,
              request: {
                "path": req.body.path,
                "owner": req.body.owner,
                "permission": req.body.permission
              }
            })
          } else {
            res.status(400).json({
              res: "Bad Request",
              message: "Id duplicated and exceeding creation timeout, please try again or contact administrator."
            })
          }  
        } else {
          req.status(400).json({
            res: "Bad Request",
            message: "Invalid Type"
          })
        }   
      } catch (err) {
        if (err) {
          res.status(500).json({
            res: "Internal Server Error",
            message: err
          })
        }
      }    
    break;
   
    // deleting shared object
    // url: http://<domain>:<port>/api/share/remove
    // body: {"shareId": <shareId>}
    case "DELETE": 
      try {
        if (req.query.param[0] === "remove") {
          const db = await getDatabase(`SELECT * FROM shares WHERE ShareId = "${req.body.shareId}";`);
          if (db.length !== 0) {
            await setDatabaseTable(`
              DELETE FROM
                shares
              WHERE
                ShareId = "${req.body.shareId}";
            `)

            res.status(200).json({
              res: "OK",
              object: db[0]
            })
          } else {
            res.status(404).json({
              res: "Not Found",
              message: `Can not find any object under "${req.body.shareId}".`
            })
          }
        } else {
          req.status(400).json({
            res: "Bad Request",
            message: "Invalid Type"
          })
        }  
      } catch (err) {
        if (err) {
          res.status(500).json({
            res: "Internal Server Error",
            message: err
          })
        }
      }
    break;

    // updating shared object permission
    // url: http://<domain>:<port>/api/share/
    // body: {"shareId": <shareId>, "permission": <permissionBoolean>}
    case "PATCH":
      try {
        if (req.query.param[0] === "update") {
          // checking if permission parameter exist
          if (req.body.permission === 0 || req.body.permission === 1) {
            const db = await getDatabase(`SELECT * FROM shares WHERE ShareId = "${req.body.shareId}";`);
            if (db.length !== 0) {
              await setDatabaseTable(`
                UPDATE 
                  shares
                SET 
                  Permission = "${req.body.permission}"
                WHERE 
                  ShareId = "${req.body.shareId}";
              `)

              res.status(200).json({
                res: "OK",
                object: {
                  new: {
                    ShareId: db[0].ShareId,
                    Object: db[0].Object,
                    Owner: db[0].Owner,
                    Permission: req.body.permission,
                  },
                  old: db[0],              
                }
              })
            } else {
              res.status(404).json({
                res: "Not Found",
                message: `Can not find any object under "${req.body.shareId}".`
              })
            }
          } else {
            res.status(400).json({
              res: "Bad Request",
              message: "Missing Permission Parameter"
            })
          }
        } else {
          req.status(400).json({
            res: "Bad Request",
            message: "Invalid Type"
          })
        }  
      } catch (err) {
        if (err) {
          res.status(500).json({
            res: "Internal Server Error",
            message: err
          })
        }
      }
    break;

    default: 
      res.status(405).json({
        res: "Method Not Allowed",
        message: "Invalid Method Used"
      })
  }
}