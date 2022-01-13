import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'

import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { getType } from 'mime'

import { STORAGE_DIRECTORY } from '../../consts/StoragegDirectory'

export default async function Handler(req, res) {
  switch(req.method) {
    case "POST":
      try {
        const objects = []
        const path = (req.body.path == "root")? "" : req.body.path;

        // check if the object exist
        if (!existsSync(`${STORAGE_DIRECTORY}/${path}`)) {
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
          const storage = readdirSync(`${STORAGE_DIRECTORY}/${path}`);

          storage.forEach(object => {
            let type = getType(`${STORAGE_DIRECTORY}/${path}/${object}`)

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
          const type = (getType(`${STORAGE_DIRECTORY}/${path}`))? getType(`${STORAGE_DIRECTORY}/${path}`) : "file/unknown";
          const objectStats = statSync(`${STORAGE_DIRECTORY}/${path}`);
          const creationTime = new Date(objectStats.birthtimeMs)

          // markdown file handler          
          if (type.includes("markdown")) {
            const text = readFileSync(`${STORAGE_DIRECTORY}/${path}`, 'utf8');

            const matterResult = matter(text);
            const processed = await remark()
              .use(gfm)
              .use(html)
              .process(matterResult.content)

            content = processed.toString()
          // plain text handler
          } else if (type.includes('text/plain')) {
            content = readFileSync(`${STORAGE_DIRECTORY}/${path}`, 'utf8');
          
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