import { getDatabase } from "./getDatabase";


export const getPinnedContent = (listing, sort = "name") => {
  const pinsDB = await getDatabase(`SELECT * FROM pins;`)
  let pinned = [];
  let regular = [];
  
  listing.forEach(data => {
    let found = false;
    let idx = 0;
    while (!found && idx < pinsDB.length) {
      if (data.name == pinsDB[idx].ObjectName) {
        found = true
        pinned.push(data)
      }

      idx ++;
    }

    if (!found) {
      regular.push(data)
    }
  })

  return {
    pinned: pinned.sort(function(a, b) {
      if (sort == "name") {
        let textA = a.name.toUpperCase();
        let textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      } else {
        let textA = a.type.toUpperCase();
        let textB = b.type.toUpperCase();
        return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
      }
  }),
    regular: regular.sort(function(a, b) {
      if (sort == "name") {
        let textA = a.name.toUpperCase();
        let textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      } else {
        let textA = a.type.toUpperCase();
        let textB = b.type.toUpperCase();
        return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
      }
  }),
  }
}
