/** The origin of `url`, with a `localhost` host swapped for the host this page
 *  was opened from — so a phone on the LAN reaches the dev machine rather than
 *  itself. A real domain is returned unchanged. */
const onCurrentHost = (url: string): string => {
  const resolved = new URL(url, window.location.href);
  if (resolved.hostname === "localhost") {
    resolved.hostname = window.location.hostname;
  }
  return resolved.origin;
};

const CONFIGURED_SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;

/** The website every admin preview frame loads, reachable from this device. */
export const SITE_URL = CONFIGURED_SITE_URL
  ? onCurrentHost(CONFIGURED_SITE_URL)
  : undefined;
