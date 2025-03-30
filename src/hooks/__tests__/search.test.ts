import { renderHook, act } from "@testing-library/react-hooks";
import { vi, describe, it, expect, beforeEach } from "vitest";
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

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it("should handle search", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    expect(mockSearchAPI.search).toHaveBeenCalled();
    expect(result.current.bookmarks).toEqual(mockResponse.bookmarks);
    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Search completed",
      message: `Found ${mockResponse.meta.total} bookmarks`,
      style: "success",
    });
  });

  it("should handle pagination", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    // Initial search
    await act(async () => {
      await result.current.search("test");
    });

    // Test next page
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockSearchAPI.search).toHaveBeenCalledWith(expect.stringContaining(`of=${LIMIT}`), "username", "apikey");

    // Wait for the state to be updated
    await act(async () => {
      // 非同期の状態更新を待つ
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Test previous page
    await act(async () => {
      await result.current.fetchPreviousPage();
    });

    expect(mockSearchAPI.search).toHaveBeenCalledWith(expect.stringContaining(`of=0`), "username", "apikey");
  });

  it("should handle error", async () => {
    const error = new Error("API Error");
    (mockSearchAPI.search as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Search failed",
      message: `Error: ${error}`,
      style: "failure",
    });
  });

  it("should handle reset", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch("username", "apikey", mockSearchAPI));

    // Perform search first
    await act(async () => {
      await result.current.search("test");
    });

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it("should handle missing credentials", async () => {
    const { result } = renderHook(() => useHantenaFullTextSearch(undefined, undefined, mockSearchAPI));

    await act(async () => {
      await result.current.search("test");
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: "Empty credentials",
      message: "Please set your Hatena Bookmark credentials in the settings",
      style: "failure",
    });
    expect(mockSearchAPI.search).not.toHaveBeenCalled();
  });
});
