import { existsSync, readFileSync } from 'fs'

export const getMarkdownContent = (path) => {
  if (existsSync(`${storageDir}/${path}`)) {
    const file = readFileSync(`${storageDir}/${path}`, 'utf-8')
  
    return {
      path: path,
      content: file,
    };
  } else {
    return 'Not Found';
  }
}