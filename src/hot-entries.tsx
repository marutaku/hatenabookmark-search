import { List, Action, ActionPanel, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchHotEntries, HatenaHotEntry } from "./lib/hatena";

export default function HotEntries() {
  const [entries, setEntries] = useState<HatenaHotEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchHotEntries();
        setEntries(data);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "エラーが発生しました",
          message: error instanceof Error ? error.message : "ホットエントリの取得に失敗しました",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <List isLoading={isLoading}>
      {entries.map((entry) => (
        <List.Item
          key={entry.link}
          title={entry.title}
          subtitle={`${entry.bookmarkCount || 0} users`}
          accessories={[{ date: new Date(entry.date) }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={entry.link} />
              <Action.CopyToClipboard content={entry.link} title="URLをコピー" />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
