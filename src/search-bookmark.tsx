import { ActionPanel, Action, Icon, List, Toast, showToast } from "@raycast/api";
import { AuthorizationProvider } from "./providers/authentication";
import { useHantenaFullTextSearch } from "./hooks/search";
import { useAuth } from "./hooks/auth";
import { useState } from "react";

const SearchList = () => {
  const { username, apikey } = useAuth();
  const [query, setQuery] = useState("");
  const { bookmarks, search } = useHantenaFullTextSearch(username, apikey);
  const handleOnSearch = async () => {
    if (!query) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter a search query",
      });
      return;
    }
    await search(query);
  };
  return (
    <AuthorizationProvider>
      <List
        searchText={query}
        onSearchTextChange={setQuery}
        navigationTitle="Search Hatena Bookmark"
        actions={
          <ActionPanel>
            <Action title="Search" onAction={handleOnSearch} />
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
