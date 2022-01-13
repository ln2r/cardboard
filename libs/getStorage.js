import { readdir, statSync} from 'fs'

export const getStorage = (dir) => {
  let result = [];
  function read(dir, done) {    
    readdir(dir, (err, list) => {
      if (err) throw err;
      // console.log(`reading ${dir}`)
      let pending = list.length;
      if (!pending) return done(null, result);

      list.forEach((file) => {
        const currentPath = dir.concat(`\\${file}`)
        const stat = statSync(currentPath)

        // crawl deeper
        if (stat.isDirectory()) {
          result.push({
            name: currentPath,
            type: "folder"
          });  
          // console.log(`${file} - ${stat.isDirectory()}:`)
          read(dir.concat(`\\${file}`), (err, data) => {            
            if (!--pending) return done(null, result);
          })
        } else {
          result.push({
            name: currentPath,
            type: "file"
          });
          // console.log(`-- ${file}`)
          if (!--pending) return done(null, result);
        }
      })
    })
  }

  return new Promise((resolve, reject) => {
    read(dir, (err, data) => {
      if (err) throw err;
      
      if (data) {
        resolve(data)
      } else {
        reject(data)
      }
    })
  })
}
