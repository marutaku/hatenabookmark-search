import crypto from "crypto";
const generateNonce = () => {
  return crypto.randomBytes(16).toString("base64");
};

const buildWSSEHeader = (username: string, apikey: string) => {
  const nonce = generateNonce();
  const created = new Date().toISOString();
  const digest = crypto
    .createHash("sha1")
    .update(nonce + created + apikey)
    .digest("base64");

  return `UsernameToken Username="${username}", PasswordDigest="${digest}", Nonce="${nonce}", Created="${created}"`;
};

export const callHantenaAPI = async <T>(url: string, username: string, apikey: string): Promise<T> => {
  const wsseHeader = buildWSSEHeader(username, apikey);
  const headers = {
    "X-WSSE": wsseHeader,
    "Content-Type": "application/json",
  };
  console.log("Request URL:", url);
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  if (!response.ok) {
    console.warn(`Error: ${response.status} ${await response.text()}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data as T;
};
