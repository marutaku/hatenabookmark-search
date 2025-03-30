import { useState } from 'react';
import { callHantenaAPI } from '../lib/hatena';
import { showToast, Toast } from '@raycast/api';

const LIMIT = 20;

type Entry = {
  title: string;
  count: string;
  url: string;
  eid: string;
  snippet: string;
}

type Bookmark = {
  entry: Entry;
  timestamp: number;
  comment: string;
  is_private: boolean
}

type Meta = {
  total: number;
  query: {
    original: string;
    queries: string[];
  }
  status: number;
  elapsed: number;
}

type Response = {
  bookmarks: Bookmark[];
  meta: Meta;
}

export const useHantenaFullTextSearch = (username?: string, apikey?: string) => {
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const hasNextPage = offset > 0 && offset < total;
  const hasPreviousPage = offset > 0;

  const callSearchAPI = async (offset: number) => {
    if (!username || !apikey) {
      showToast({
        title: "Empty credentials",
        message: `Please set your Hatena Bookmark credentials in the settings`,
        style: Toast.Style.Failure,
      })
      return;
    }
    try {
      setLoading(true);
      const baseURL = `https://b.hatena.ne.jp/my/search/json`;
      const url = new URL(baseURL);
      url.searchParams.append("q", query);
      url.searchParams.append("limit", LIMIT.toString());
      url.searchParams.append("of", offset.toString());
      const data = await callHantenaAPI<Response>(url.toString(), username, apikey);
      setLoading(false);
      setBookmarks(data.bookmarks);
      setTotal(data.meta.total);
      showToast({
        title: "Search completed",
        message: `Found ${data.meta.total} bookmarks`,
        style: Toast.Style.Success,
      })
    } catch (e) {
      setLoading(false);
      showToast({
        title: "Search failed",
        message: `Error: ${e}`,
        style: Toast.Style.Failure,
      })
    }
  }

  const search = async (query: string) => {
    setQuery(query);
    await callSearchAPI(0);
    setOffset(0);
  }
  const fetchNextPage = async () => {
    if (!hasNextPage) return;
    const nextOffset = offset + LIMIT;
    await callSearchAPI(nextOffset);
    setOffset(nextOffset);
  }
  const fetchPreviousPage = async () => {
    if (!hasPreviousPage) return;
    const previousOffset = offset - LIMIT;
    await callSearchAPI(previousOffset);
    setOffset(previousOffset);
  }
  return {
    bookmarks,
    loading,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    search,
  }
}