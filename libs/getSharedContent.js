import fetch from 'node-fetch'

export const getSharedContent = async (shareId) => {
  const object = await fetch(`http://localhost:3000/api/share/object/${shareId}`, {
    method: "GET"
  })
  
  const res = await object.json();
  return res;
}