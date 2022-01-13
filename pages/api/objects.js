import fs from 'fs'
import path from 'path'
import mime from 'mime'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'

const storageDir = path.join(process.cwd(), 'warehouse')
export default async function Handler(req, res) {
  switch(req.method) {
    case "POST":
      try {
        const objects = []
        const path = (req.body.path == "root")? "" : req.body.path;

        // check if the object exist
        if (!fs.existsSync(`${storageDir}/${path}`)) {
          res.status(404).json({
            req: path,
            res: {
              name: req.body.path,
              type: "invalid",
              contents: []
            }
          })

          break;
        }

        // check if its folder or some "weird" file without extension
        if (!/\.[a-zA-Z0-9]*/gm.test(path)) {
          const storage = fs.readdirSync(`${storageDir}/${path}`);

          storage.forEach(object => {
            let type = mime.getType(`${storageDir}/${path}/${object}`)

            if (!type) {
              type = (!/\.[a-zA-Z0-9]*/gm.test(req.body.path))? "folder" : "file/unknown";
            }

            objects.push({
              name: object,
              content: null,
              type: type,
            })
          })

          // sorting with folder on top
          const sorted = (files) => {
            const copy = [];
            for (let i = 0; i - files.length; i ++) {
              if (!files[i].type.includes("folder")) {
                copy.push(files[i]);
              } else {
                copy.unshift(files[i]);
              };
              continue;
            };
            return copy;
          }

          res.status(200).json({
            req: req.body.path,
            res: {
              name: req.body.path,
              type: "directory",
              contents: sorted(objects)
            }         
          })
        // ordinary "objects" handler
        } else {
          let content;
          const type = (mime.getType(`${storageDir}/${path}`))? mime.getType(`${storageDir}/${path}`) : "file/unknown";
          const objectStats = fs.statSync(`${storageDir}/${path}`);
          const creationTime = new Date(objectStats.birthtimeMs)

          // markdown file handler          
          if (type.includes("markdown")) {
            const text = fs.readFileSync(`${storageDir}/${path}`, 'utf8');

            const matterResult = matter(text);
            const processed = await remark()
              .use(gfm)
              .use(html)
              .process(matterResult.content)

            content = processed.toString()
          // plain text handler
          } else if (type.includes('text/plain')) {
            content = fs.readFileSync(`${storageDir}/${path}`, 'utf8');
          
          // other object handler
          } else {
            content = path;
          }

          res.status(200).json({
            req: req.body.path,
            res: {
              name: path,
              type: "file",
              contents: [
                {
                  name: path.replace(/\S+\//gm, ""),
                  content: content,
                  type: type,
                  size: objectStats.size,
                  added: creationTime.toLocaleString()
                }
              ]
            }         
          })
        }

      } catch (err) {
        if (err) throw err;

        res.status(500).json({
          res: 'Error Occured',
        })
      }
    break;
  }
}