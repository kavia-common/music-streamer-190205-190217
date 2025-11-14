/**
 * PUBLIC_INTERFACE
 * getTracks loads track metadata. If REACT_APP_FEATURE_FLAGS includes "useBackend"
 * and a backend base URL is available, it attempts to fetch /api/tracks from the backend.
 * Otherwise, it falls back to local mock JSON.
 */
// CRA supports importing JSON directly
import localTracks from "../data/tracks.json";

const ENV_FLAGS = (process.env.REACT_APP_FEATURE_FLAGS || "").split(",").map((s) => s.trim()).filter(Boolean);
const SHOULD_USE_BACKEND = ENV_FLAGS.includes("useBackend");

function getBackendBase() {
  return process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || undefined;
}

/**
 * PUBLIC_INTERFACE
 * getTracks returns a list of tracks, preferring backend if enabled and reachable.
 */
export async function getTracks() {
  /** Fetch tracks from backend when feature flag and env URL are present, else mock data. */
  if (SHOULD_USE_BACKEND) {
    const base = getBackendBase();
    if (base) {
      try {
        const res = await fetch(`${base.replace(/\/+$/, "")}/api/tracks`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Minimal normalization to expected shape
          return data.map((t, idx) => ({
            id: String(t?.id ?? idx),
            title: String(t?.title ?? "Unknown Title"),
            artist: String(t?.artist ?? "Unknown Artist"),
            durationSec: Number.isFinite(Number(t?.durationSec)) ? Number(t.durationSec) : 0,
            audioUrl: String(t?.audioUrl ?? ""),
            coverUrl: String(t?.coverUrl ?? "/assets/figmaimages/figma_image_0_48.png"),
          }));
        }
      } catch (err) {
        // Silently fall back to local mock
        // eslint-disable-next-line no-console
        console.warn("Falling back to local tracks due to backend error:", err);
      }
    }
  }
  return localTracks;
}
