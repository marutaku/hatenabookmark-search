import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { showToast } from "@raycast/api";
import { useHantenaFullTextSearch, SearchAPI, LIMIT } from "../search";

const mockShowToast = showToast as ReturnType<typeof vi.fn>;

describe("useHantenaFullTextSearch", () => {
  const mockSearchAPI: SearchAPI = {
    search: vi.fn(),
  };

  const mockResponse = {
    bookmarks: [
      {
        entry: {
          title: "Test Title",
          count: "1",
          url: "https://example.com",
          eid: "123",
          snippet: "Test Snippet",
        },
        timestamp: 1234567890,
        comment: "Test Comment",
        is_private: false,
      },
    ],
    meta: {
      total: 50,
      query: {
        original: "test",
        queries: ["test"],
      },
      status: 200,
      elapsed: 0.1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mockSearchAPI.search as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
  });

  it("should initialize with default values", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  it("should handle search", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    await act(async () => {
      expect(mockSearchAPI.search).toHaveBeenCalledWith(
        "https://b.hatena.ne.jp/my/search/json?q=test&limit=20&of=0",
        "username",
        "apikey",
      );
      expect(result.current.bookmarks).toEqual(mockResponse.bookmarks);
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Search completed",
        message: `Found ${mockResponse.meta.total} bookmarks`,
        style: "success",
      });
    });
  });

  it("should handle pagination", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await act(async () => {
      expect(mockSearchAPI.search).toHaveBeenCalledWith(
        `https://b.hatena.ne.jp/my/search/json?q=test&limit=20&of=${LIMIT}`,
        "username",
        "apikey",
      );
    });

    await act(async () => {
      await result.current.fetchPreviousPage();
    });

    await act(async () => {
      expect(mockSearchAPI.search).toHaveBeenCalledWith(
        "https://b.hatena.ne.jp/my/search/json?q=test&limit=20&of=0",
        "username",
        "apikey",
      );
    });
  });

  it("should handle error", async () => {
    const error = new Error("API Error");
    (mockSearchAPI.search as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    await act(async () => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Search failed",
        message: `Error: ${error}`,
        style: "failure",
      });
    });
  });

  it("should handle reset", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    await act(async () => {
      result.current.reset();
    });

    await act(async () => {
      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  it("should handle missing credentials", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch(undefined, undefined, mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    await act(async () => {
      expect(mockShowToast).toHaveBeenCalledWith({
        title: "Empty credentials",
        message: "Please set your Hatena Bookmark credentials in the settings",
        style: "failure",
      });
      expect(mockSearchAPI.search).not.toHaveBeenCalled();
    });
  });
});
