export const getObjectCount = (objects) => {
  let folders = 0;
  let files = 0;
  objects.forEach(object => {
    if (object.type.includes("folder")) {
      folders++;
    } else {
      files++;
    }
  })

  if (folders == 0) {
    if (files == 1) {
      return `1 files.`
    } else {
      return `${files} files.`
    }    
  } else if (files == 0) {
    if (folders == 1) {
      return `1 folder.`
    } else {
      return `${folders} folders.`
    }
  } else {
    if (folders == 1) {
      return `1 folder, ${files} files.`
    } else if (files == 1) {
      return `${folders} folders, 1 file.`
    } else {
      return `${folders} folders, ${files} files.`
    }
  }
}