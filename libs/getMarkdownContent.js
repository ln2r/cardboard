import { existsSync, readFileSync } from 'fs'
import { STORAGE_DIRECTORY } from '../consts/StoragegDirectory';

export const getMarkdownContent = (path) => {
  if (existsSync(`${STORAGE_DIRECTORY}/${path}`)) {
    const file = readFileSync(`${STORAGE_DIRECTORY}/${path}`, 'utf-8')
  
    return {
      path: path,
      content: file,
    };
  } else {
    return 'Not Found';
  }
}