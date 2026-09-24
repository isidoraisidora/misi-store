export type InstagramImportCandidate = {
  sourceId: string;
  permalink: string;
  caption: string;
  imageUrls: string[];
  publishedAt: string;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: { data?: Array<{ media_url?: string }> };
};

type InstagramResponse = {
  data?: InstagramMedia[];
  paging?: { next?: string };
};

export async function fetchInstagramCandidates(limit = 25): Promise<InstagramImportCandidate[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  if (!token || !accountId) throw new Error("Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_ACCOUNT_ID");

  const fields = "id,caption,media_type,media_url,permalink,timestamp,children{media_url}";
  const url = new URL(`https://graph.facebook.com/v21.0/${accountId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));
  url.searchParams.set("access_token", token);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Instagram media could not be loaded");
  const payload = (await response.json()) as InstagramResponse;

  return (payload.data ?? []).flatMap((media) => {
    const imageUrls = [media.media_url, ...(media.children?.data ?? []).map((child) => child.media_url)].filter((url): url is string => Boolean(url));
    if (!media.id || !media.permalink || imageUrls.length === 0) return [];
    return [{ sourceId: media.id, permalink: media.permalink, caption: media.caption ?? "", imageUrls, publishedAt: media.timestamp ?? "" }];
  });
}
