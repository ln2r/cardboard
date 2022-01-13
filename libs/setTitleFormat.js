export const setTitleFormat = (path) => {
  const links = []

  let currentLink = ``
  for(let i=0; i<(path.length - 1); i++) {
    currentLink = `${currentLink}/${path[i]}`;
    links.push({
      name: path[i],
      link: currentLink
    }) 
  }

  return links
}