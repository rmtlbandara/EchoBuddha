// Public profiles approved by the publisher in the official social-links release (#52).
export const OFFICIAL_SOCIAL_PROFILES = [
  { label: "Facebook", href: "https://www.facebook.com/EchoBuddha/" },
  { label: "Medium", href: "https://medium.com/@echo_buddha" },
  { label: "Pinterest", href: "https://www.pinterest.com/echobuddha/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/echobuddha/" }
] as const;

// Footer presentation is independent of the publisher's established sameAs identities.
const [facebook, medium, pinterest] = OFFICIAL_SOCIAL_PROFILES;
export const FOOTER_SOCIAL_PROFILES = [
  pinterest,
  { label: "YouTube", href: "https://www.youtube.com/@EchoBuddha" },
  facebook,
  medium
] as const;

export const PUBLISHER_LOGO = { path: "/images/publisher-logo.png", width: 512, height: 512 } as const;
export const DEFAULT_SHARE_IMAGE = { path: "/og-default.png", width: 1200, height: 630, alt: "Echo Buddha — Buddhist wisdom for everyday life" } as const;

export function getShareImage(route: string) {
  const section = route.startsWith("/meditation") ? "meditation"
    : route.startsWith("/learn/buddhist-handbook/") ? "handbook"
    : route.startsWith("/learn/") ? "learn"
    : route.startsWith("/quotes") ? "quotes" : undefined;
  return section ? { ...DEFAULT_SHARE_IMAGE, path: `/og-${section}.png`, alt: `Echo Buddha — ${section === "handbook" ? "Buddhist Life & Practice Handbook" : section === "learn" ? "Learn Buddhism" : section === "meditation" ? "Meditation and gentle practice" : "Original quotes and reflections"}` } : DEFAULT_SHARE_IMAGE;
}
