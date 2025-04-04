import { getPreferenceValues } from "@raycast/api";

export const USER_NAME_PREFERENCE_KEY = "username";
export const API_KEY_PREFERENCE_KEY = "apikey";

export type Preference = {
  username?: string;
  apikey?: string;
};

export const getPreference = (): Preference => {
  return getPreferenceValues<Preference>();
};
