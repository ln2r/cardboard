import { readFileSync, statSync, createReadStream } from 'fs';
import { STORAGE_DIRECTORY } from '../../consts/StoragegDirectory';

export default async function handler(req, res) {
  const r = {
    query: req.query,
    body: req.body
  }

  switch (req.method) {
    case "GET":     
      const filename = r.query.path.match(/[a-zA-Z1-9]*\.[a-zA-Z1-9]*/gm).pop();
      const fileData = readFileSync(`${STORAGE_DIRECTORY}/${r.query.path}`, (err) => {
        if (err) {
          return null
        };
      })
      const stat = statSync(`${STORAGE_DIRECTORY}/${r.query.path}`)

      if (!fileData) {
        res.status(404).json({
          status: 404,
          body: "File not found"
        })
      } else {
        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Disposition": `attachment; filename="${filename}"`
        })
        // using readstream
        const fileStream = createReadStream(`${STORAGE_DIRECTORY}/${r.query.path}`)
        await new Promise(function (resolve) {
          fileStream.pipe(res)
          fileStream.on('end', resolve)
        })
      }     
    break;
  }
}