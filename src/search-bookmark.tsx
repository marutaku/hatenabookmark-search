import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { AuthorizationProvider } from "./providers/authentication";
import { useHantenaFullTextSearch } from "./hooks/search";
import { useAuth } from "./hooks/auth";
import { useState } from "react";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, "/");
};

const SearchList = () => {
  const { username, apikey } = useAuth();
  const [query, setQuery] = useState("");
  const { bookmarks, search, reset } = useHantenaFullTextSearch(username!, apikey!);

  const handleOnSearch = async (query: string) => {
    setQuery(query);
    if (!query) {
      reset();
      return;
    }
    await search(query);
  };

  return (
    <List
      searchText={query}
      onSearchTextChange={handleOnSearch}
      throttle={true}
      filtering={false}
      navigationTitle="Search Hatena Bookmark"
      actions={
        <ActionPanel>
          <Action title="Search" onAction={() => handleOnSearch(query)} />
        </ActionPanel>
      }
    >
      {bookmarks.map(({ entry, timestamp }) => (
        <List.Item
          key={entry.eid}
          title={entry.title}
          subtitle={`${entry.count} users`}
          icon={Icon.Link}
          accessories={[{ text: formatDate(timestamp) }]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={entry.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default function Command() {
  return (
    <AuthorizationProvider>
      <SearchList />
    </AuthorizationProvider>
  );
}
