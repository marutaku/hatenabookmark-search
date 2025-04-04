import { Detail, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { AuthorizationContext } from "../hooks/auth";
import { getPreference } from "../lib/preference";

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [apikey, setApikey] = useState<string | undefined>(undefined);
  const fetchAuthenticationData = async () => {
    try {
      const { username: storedUsername, apikey: storedApikey } = getPreference();
      setUsername(storedUsername?.toString());
      setApikey(storedApikey?.toString());
    } catch (error) {
      console.error("Error fetching authorization data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // フラグを使用してコンポーネントがマウントされているか確認
    fetchAuthenticationData().then(() => {
      if (!isMounted) return; // アンマウントされている場合は状態を更新しない
    });

    return () => {
      isMounted = false; // クリーンアップ時にフラグを更新
    };
  }, []);

  if (isLoading) {
    return <Detail markdown={`Loading...`} />;
  }

  if (!username || !apikey) {
    return (
      <Detail
        markdown="# 認証情報が設定されていません\n\n設定画面から以下の情報を設定してください：\n\n- はてなID\n- APIキー"
        actions={
          <ActionPanel>
            <Action.Open title="設定画面を開く" target="raycast://extensions/marutaku/hatena-raycast/configure" />
          </ActionPanel>
        }
      />
    );
  }

  return <AuthorizationContext.Provider value={{ username, apikey }}>{children}</AuthorizationContext.Provider>;
};
