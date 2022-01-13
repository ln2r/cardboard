import fetch from 'node-fetch';

export const getContent = async (path) => {
  const object = await fetch("http://localhost:3000/api/objects", {
    method: "POST",
    body: JSON.stringify({
      path: path 
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return (await object.json()).res;
}