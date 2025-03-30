import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";
import { decode } from "html-entities";

interface HatenaRDFItem {
  title: string;
  link: string;
  description: string;
  "dc:date": string;
  "hatena:bookmarkcount": string;
}

interface HatenaRDFFeed {
  "rdf:RDF": {
    channel: {
      title: string;
      link: string;
      description: string;
      items: {
        "rdf:Seq": {
          "rdf:li": Array<{ "@_rdf:resource": string }>;
        };
      };
    };
    item: HatenaRDFItem[];
  };
}

export interface HatenaHotEntry {
  title: string;
  link: string;
  description: string;
  date: string;
  bookmarkCount?: number;
}

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

export const fetchHotEntries = async (category: string = "it"): Promise<HatenaHotEntry[]> => {
  try {
    console.log("Fetching hot entries...");
    const response = await fetch(`https://b.hatena.ne.jp/hotentry/${category}.rss`);
    if (!response.ok) {
      console.error("HTTP Error Response:", await response.text());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log("Received XML:", xmlText);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      removeNSPrefix: false,
      isArray: (name) => ["item", "rdf:li"].includes(name),
    });

    const result = parser.parse(xmlText) as HatenaRDFFeed;
    console.log("Parsed result:", JSON.stringify(result, null, 2));

    if (!result["rdf:RDF"] || !Array.isArray(result["rdf:RDF"].item)) {
      console.error("Unexpected RSS format:", result);
      throw new Error("Invalid RSS format: items not found");
    }

    const items = result["rdf:RDF"].item;
    console.log("Processing entries:", items.length);

    return items.map((item) => ({
      title: decode(item.title),
      link: item.link,
      description: decode(item.description || ""),
      date: item["dc:date"],
      bookmarkCount: parseInt(item["hatena:bookmarkcount"] || "0", 10),
    }));
  } catch (error) {
    console.error("Error in fetchHotEntries:", error);
    throw error;
  }
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
