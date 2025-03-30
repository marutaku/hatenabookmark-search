import crypto from 'crypto'
import wsse from 'wsse';

const generateNonce = () => {
  return crypto.randomBytes(16).toString("base64");
}


export const callHantenaAPI = async <T>(url: string, username: string, apikey: string): Promise<T> => {
  const token = wsse({ username, password: apikey });
  const headers = {
    "X-WSSE": token.getWSSEHeader({nonceBase64: true}),
    "Content-Type": "application/json"
  }
  console.log("Calling Hatena API", url, headers);
  const response = await fetch(url, {
    method: "GET",
    headers
  });
  if (!response.ok) {
    console.log(`Error: ${response.status} ${response.statusText}`);
    console.log(`Response: ${await response.text()}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data as T;
}