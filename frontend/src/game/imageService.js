import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const memoryCache = new Map(); // scene_id -> dataUrl
const failed = new Set(); // ids whose generation failed this session (don't retry)

async function getCached(id) {
  if (memoryCache.has(id)) return memoryCache.get(id);
  try {
    const cached = await axios.get(`${API}/scene/image/${id}`);
    const url = toDataUrl(cached.data);
    memoryCache.set(id, url);
    return url;
  } catch {
    return null;
  }
}

// Returns art for `sceneId`; if it can't be generated (e.g. no key budget), walks the
// `fallbacks` list (ids of already-painted scenes) so no screen is ever left blank.
export async function fetchSceneImage(sceneId, prompt, style = "scene", fallbacks = []) {
  const cached = await getCached(sceneId);
  if (cached) return cached;

  if (!failed.has(sceneId)) {
    try {
      const res = await axios.post(`${API}/scene/image`, { scene_id: sceneId, prompt, style });
      const url = toDataUrl(res.data);
      memoryCache.set(sceneId, url);
      return url;
    } catch (e) {
      failed.add(sceneId);
      console.warn("scene image unavailable", sceneId, e?.response?.data?.detail || e.message);
    }
  }
  for (const id of fallbacks) {
    const url = await getCached(id);
    if (url) return url;
  }
  return null;
}

function toDataUrl(payload) {
  const mime = payload.mime_type || "image/png";
  return `data:${mime};base64,${payload.image_data}`;
}
