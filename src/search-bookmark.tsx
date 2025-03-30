import { ActionPanel, Action, Icon, List } from "@raycast/api";
import { AuthorizationProvider } from "./providers/authentication";
import { useHantenaFullTextSearch } from "./hooks/search";
import { useAuth } from "./hooks/auth";
import { useState } from "react";

const SearchList = () => {
  const { username, apikey } = useAuth();
  const [query, setQuery] = useState("");
  const { bookmarks, search, reset } = useHantenaFullTextSearch(username, apikey);
  const handleOnSearch = async (query: string) => {
    setQuery(query);
    if (!query) {
      reset();
      return;
    }
    await search(query);
  };
  return (
    <AuthorizationProvider>
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
        {bookmarks.map(({ entry }) => (
          <List.Item
            key={entry.eid}
            title={entry.title}
            subtitle={entry.url}
            icon={Icon.Link}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={entry.url} />
              </ActionPanel>
            }
          />
        ))}
      </List>
    </AuthorizationProvider>
  );
};

export default function Command() {
  return (
    <AuthorizationProvider>
      <SearchList />
    </AuthorizationProvider>
  );
}
