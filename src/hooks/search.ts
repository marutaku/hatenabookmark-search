import { useState } from "react";
import { callHantenaAPI } from "../lib/hatena";
import { showToast, Toast } from "@raycast/api";

export const LIMIT = 20;

type Entry = {
  title: string;
  count: string;
  url: string;
  eid: string;
  snippet: string;
};

type Bookmark = {
  entry: Entry;
  timestamp: number;
  comment: string;
  is_private: boolean;
};

type Meta = {
  total: number;
  query: {
    original: string;
    queries: string[];
  };
  status: number;
  elapsed: number;
};

type Response = {
  bookmarks: Bookmark[];
  meta: Meta;
};

export interface SearchAPI {
  search: (url: string, username: string, apikey: string) => Promise<Response>;
}

export const defaultSearchAPI: SearchAPI = {
  search: async (url: string, username: string, apikey: string) => {
    return callHantenaAPI<Response>(url, username, apikey);
  },
};

export const useHantenaFullTextSearch = (
  username?: string,
  apikey?: string,
  searchAPI: SearchAPI = defaultSearchAPI,
) => {
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const hasNextPage = total > 0 && offset < total - LIMIT;
  const hasPreviousPage = offset > 0;

  const handleAPIError = (error: unknown) => {
    showToast({
      title: "Search failed",
      message: `Error: ${error}`,
      style: Toast.Style.Failure,
    });
  };

  const buildSearchURL = (query: string, offset: number): string => {
    const baseURL = `https://b.hatena.ne.jp/my/search/json`;
    const url = new URL(baseURL);
    url.searchParams.append("q", query);
    url.searchParams.append("limit", LIMIT.toString());
    url.searchParams.append("of", offset.toString());
    return url.toString();
  };

  const callSearchAPI = async (query: string, offset: number) => {
    if (!username || !apikey) {
      showToast({
        title: "Empty credentials",
        message: `Please set your Hatena Bookmark credentials in the settings`,
        style: Toast.Style.Failure,
      });
      return;
    }
    try {
      setLoading(true);
      const url = buildSearchURL(query, offset);
      const data = await searchAPI.search(url, username, apikey);
      setBookmarks(data.bookmarks);
      setTotal(data.meta.total);
      showToast({
        title: "Search completed",
        message: `Found ${data.meta.total} bookmarks`,
        style: Toast.Style.Success,
      });
    } catch (e) {
      handleAPIError(e);
    } finally {
      setLoading(false);
    }
  };

  const search = async (query: string) => {
    await callSearchAPI(query, 0);
    setQuery(query);
    setOffset(0);
  };

  const fetchNextPage = async () => {
    if (!hasNextPage) return;
    const nextOffset = offset + LIMIT;
    await callSearchAPI(query, nextOffset);
    setOffset(nextOffset);
  };

  const fetchPreviousPage = async () => {
    if (!hasPreviousPage) return;
    const previousOffset = offset - LIMIT;
    await callSearchAPI(query, previousOffset);
    setOffset(previousOffset);
  };

  const resetState = () => {
    setBookmarks([]);
    setOffset(0);
    setTotal(0);
    setQuery("");
  };

  const reset = () => {
    resetState();
  };

  return {
    bookmarks,
    loading,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    search,
    reset,
  };
};
