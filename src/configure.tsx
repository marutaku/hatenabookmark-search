import { Action, ActionPanel, Form, Icon, LocalStorage, showToast, Toast } from "@raycast/api";
import { API_KEY_STORE_KEY, USER_NAME_STORE_KEY } from "./const";
import { useEffect, useState } from "react";

export default function ConfigureCommand() {
  const [username, setUsername] = useState("");
  const [apikey, setApikey] = useState("");
  const loadCredentials = async () => {
    try {
      const username = await LocalStorage.getItem(USER_NAME_STORE_KEY);
      const apikey = await LocalStorage.getItem("hatena-bookmark-apikey");
      if (username) {
        setUsername(username?.toString() || "");
      }
      if (apikey) {
        setApikey(apikey?.toString() || "");
      }
    } catch (error) {
      console.error("Failed to load credentials", error);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);
  return (
    <Form
      actions={
        <ActionPanel>
          <ShareSecretAction />
        </ActionPanel>
      }
    >
      <Form.TextField id="username" title="Username" defaultValue={username} placeholder="Enter your username" />
      <Form.TextField id="apikey" title="API Key" defaultValue={apikey} placeholder="Enter your API key" />
      <Form.Description text="Please enter your Hatena Bookmark credentials." />
    </Form>
  );
}

function ShareSecretAction() {
  async function handleSubmit({ username, apikey }: { username: string; apikey: string }) {
    if (!username || !apikey) {
      showToast({
        style: Toast.Style.Failure,
        title: "Username and API Key are required",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Store secret",
    });
    console.log("Storing secret", username, apikey);
    try {
      await LocalStorage.setItem(USER_NAME_STORE_KEY, username);
      await LocalStorage.setItem(API_KEY_STORE_KEY, apikey);
      toast.style = Toast.Style.Success;
      toast.title = "Success";
      toast.message = "Successfully stored your secrets.";
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed sharing secret";
      toast.message = String(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Store} title="Configure" onSubmit={handleSubmit} />;
}
