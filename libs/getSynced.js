import fetch from 'node-fetch';

export const getSynced = async () => {
  const object = await fetch("http://localhost:3000/api/sync", {
    method: "GET",
  })

  const res = await object.json();  
  return res;
}