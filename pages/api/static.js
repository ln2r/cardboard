import path from 'path';
import fs from 'fs';
import mime from 'mime'

const storageDir = path.join(process.cwd(), 'warehouse')
export default async function Handler(req, res) {
  switch(req.method) {
    case "GET":
      const objectData = fs.readFileSync(`${storageDir}/${req.query.path}`);
      const type = mime.getType(`${storageDir}/${req.query.path}`)
      
      // serving video file in chunk
      if (type.includes("video")) {
        const path = `${storageDir}/${req.query.path}`;
        const stats = fs.statSync(path);
        const size = stats.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1]? parseInt(parts[1], 10) : size - 1;
          const chunk = (end - start) + 1;
          const file = fs.createReadStream(path, {start, end});
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
          fs.createReadStream(path).pipe(res);
        }
      // serve everything else normally
      } else {
        res.setHeader("Content-Type", type)
        res.status(200).send(objectData);
      }     
    break;
  }
}