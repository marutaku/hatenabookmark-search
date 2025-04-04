import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { MockInstance } from "vitest";
import crypto from "crypto";
import { callHantenaAPI } from "../hatena";

vi.mock("crypto", () => ({
  default: {
    randomBytes: vi.fn(),
    createHash: vi.fn(),
  },
}));

// グローバルなfetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("buildWSSEHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // デフォルトのfetchレスポンスを設定
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate valid WSSE header", async () => {
    const mockDate = new Date("2025-04-04T12:00:00.000Z");
    vi.setSystemTime(mockDate);

    const mockNonce = "mockNonce123=";
    const mockDigest = "mockDigest456=";
    const mockHash = {
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue(mockDigest),
    };

    (crypto.randomBytes as unknown as MockInstance).mockReturnValue({
      toString: () => mockNonce,
    });
    (crypto.createHash as unknown as MockInstance).mockReturnValue(mockHash);

    const username = "testuser";
    const apikey = "testapikey";
    const url = "https://api.example.com/test";
    
    await callHantenaAPI(url, username, apikey);

    expect(crypto.randomBytes).toHaveBeenCalledWith(16);
    expect(crypto.createHash).toHaveBeenCalledWith("sha1");
    expect(mockHash.update).toHaveBeenCalledWith(mockNonce + mockDate.toISOString() + apikey);
    expect(mockHash.digest).toHaveBeenCalledWith("base64");

    // WSSEヘッダーの検証
    expect(mockFetch).toHaveBeenCalledWith(url, {
      method: "GET",
      headers: expect.objectContaining({
        "X-WSSE": expect.stringContaining(`UsernameToken Username="${username}"`),
        "Content-Type": "application/json",
      }),
    });
  });

  it("should handle fetch errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const url = "https://api.example.com/test";
    const username = "testuser";
    const apikey = "testapikey";

    await expect(callHantenaAPI(url, username, apikey)).rejects.toThrow("Network error");
  });
});