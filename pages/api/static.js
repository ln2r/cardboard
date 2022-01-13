import { getType } from 'mime';
import { readFileSync, createReadStream, statSync } from 'fs';

import { STORAGE_DIRECTORY } from '../../consts/StoragegDirectory';

export default async function Handler(req, res) {
  switch(req.method) {
    case "GET":
      const objectData = readFileSync(`${STORAGE_DIRECTORY}/${req.query.path}`);
      const type = getType(`${STORAGE_DIRECTORY}/${req.query.path}`)
      
      // serving video file in chunk
      if (type.includes("video")) {
        const path = `${STORAGE_DIRECTORY}/${req.query.path}`;
        const stats = statSync(path);
        const size = stats.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1]? parseInt(parts[1], 10) : size - 1;
          const chunk = (end - start) + 1;
          const file = createReadStream(path, {start, end});
          const head = {
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Range": 'bytes',
            "Content-Length": chunk,
            "Content-Type": type,
          };

          res.writeHead(206, head);
          file.pipe(res);
        } else {
          const head = {
            "Content-Length": size,
            "Content-Type": type,
          };

          res.writeHead(200, head);
          createReadStream(path).pipe(res);
        }
      // serve everything else normally
      } else {
        res.setHeader("Content-Type", type)
        res.status(200).send(objectData);
      }     
    break;
  }
}