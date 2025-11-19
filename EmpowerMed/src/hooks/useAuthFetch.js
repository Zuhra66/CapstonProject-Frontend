import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useCallback } from "react";

// Custom hook to fetch API with Auth0 token
export default function useAuthFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const authFetch = useCallback(async (url, options = {}) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email" // same as provider
        },
      });

      const res = await axios(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      });

      return res;
    } catch (err) {
      console.error("AuthFetch failed", err);
      throw err;
    }
  }, [getAccessTokenSilently]);

  return authFetch;
}
