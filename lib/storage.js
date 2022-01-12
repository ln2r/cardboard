import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import fetch from 'node-fetch'
// TODO: add jsdocs

const storageDir = path.join(process.cwd(), 'warehouse')
const dbDir = path.join(process.cwd(), 'db/')


export async function getContent(path) {
  const object = await fetch("http://localhost:3000/api/objects", {
    method: "POST",
    body: JSON.stringify({path: path}),
    headers: {'Content-Type': 'application/json'}
  })

  const res = await object.json();  
  return res.res;
}

export function getMarkdownData(path) { 
  if (fs.existsSync(`${storageDir}/${path}`)) {
    const file = fs.readFileSync(`${storageDir}/${path}`, "utf-8")
    const res = {
      path: path,
      content: file,
    }
    
    return res
  } else {
    return "Not Found"
  }
}

// FIXME: not working
export function getPrev(currentFileName, folderName) {
  const folder = fs.readdirSync(`${storageDir}/${folderName}`);

  let prev;
  let found = false;
  let idx = 0;
  let currentIdx;
  while (idx < folder.length && !found) {
    if (folder[idx] == currentFileName) {
      currentIdx = idx;
      found = true;
    }

    idx ++;

  }

  if (currentIdx !== 0) {
    prev = {
      folder: folderName,
      file: folder[currentIdx - 1]
    }
  } else {
    prev = {
      folder: folderName,
      file: folder[folder.length - 1]
    }
  }

  return prev;
}

// FIXME: not working
export function getNext(currentFileName, folderName) {
  const folder = fs.readdirSync(`${storageDir}/${folderName}`);

  let next;
  let found = false;
  let idx = 0;
  let currentIdx;
  while (idx < folder.length && !found) {
    if (folder[idx] == currentFileName) {
      currentIdx = idx;
      found = true;
    }

    idx ++;
  }

  if (folder.length == 1) {
    next = {
      folder: folderName,
      file: null
    }
  } else {
    if (currentIdx < folder.length - 1) {
      next = {
        folder: folderName,
        file: folder[currentIdx + 1]
      }
    } else {
      next = {
        folder: folderName,
        file: folder[0]
      }
    }
  }

  return next;
}

export function getDatabase(sql) {
  const db = new sqlite3.Database(`${dbDir}/cardboard.db`, sqlite3.OPEN_READWRITE, (err) => {
    if (err) throw err
  });

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) throw err
      
      if (rows) {
        resolve(rows)
      } else {
        reject('Unable to get table data.')
      }
    })
  
    db.close((err) => {
      if (err) throw err;
    }) 
  })
}

export function setTableData(sql) {
  const db = new sqlite3.Database(`${dbDir}/cardboard.db`, sqlite3.OPEN_READWRITE, (err) => {
    if (err) throw err
  });

  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err)
      }

      resolve('OK')
    })

    db.close((err) => {
      if (err) throw err;
    })
  })
}

export function getStorageData(dir){
  let result = [];
  function read(dir, done) {    
    fs.readdir(dir, (err, list) => {
      if (err) throw err;
      // console.log(`reading ${dir}`)
      let pending = list.length;
      if (!pending) return done(null, result);

      list.forEach((file) => {
        const currentPath = dir.concat(`\\${file}`)
        const stat = fs.statSync(currentPath)

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

export async function getSharedContent(shareId) {
  const object = await fetch(`http://localhost:3000/api/share/object/${shareId}`, {
    method: "GET"
  })
  
  const res = await object.json();
  return res;
}

export async function getSyncedData() {
  const object = await fetch("http://localhost:3000/api/sync", {
    method: "GET",
  })

  const res = await object.json();  
  return res;
}