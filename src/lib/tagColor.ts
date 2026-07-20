const TAG_PALETTE = ["brand", "mango", "leaf", "cherry", "grape"] as const;

export type TagColor = (typeof TAG_PALETTE)[number];

// Deterministic string -> color hash, so a given tag always renders in the
// same accent color across the app without any manual per-tag config.
export function tagColor(tag: string): TagColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_PALETTE[hash % TAG_PALETTE.length];
}
