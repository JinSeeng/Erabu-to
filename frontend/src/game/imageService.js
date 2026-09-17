import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const memoryCache = new Map(); // scene_id -> dataUrl

export async function fetchSceneImage(sceneId, prompt) {
  if (memoryCache.has(sceneId)) return memoryCache.get(sceneId);
  try {
    const cached = await axios.get(`${API}/scene/image/${sceneId}`);
    const url = toDataUrl(cached.data);
    memoryCache.set(sceneId, url);
    return url;
  } catch {
    // not cached yet — generate
  }
  try {
    const res = await axios.post(`${API}/scene/image`, { scene_id: sceneId, prompt });
    const url = toDataUrl(res.data);
    memoryCache.set(sceneId, url);
    return url;
  } catch (e) {
    console.error("scene image failed", e?.response?.data || e.message);
    return null;
  }
}

function toDataUrl(payload) {
  const mime = payload.mime_type || "image/png";
  return `data:${mime};base64,${payload.image_data}`;
}
