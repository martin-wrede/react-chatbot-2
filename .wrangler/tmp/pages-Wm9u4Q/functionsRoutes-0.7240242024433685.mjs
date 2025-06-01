import { onRequestOptions as __ai_js_onRequestOptions } from "D:\\Documents\\CODING\\JAVASCRIPT\\ReactChatGPTChatbot-main\\functions\\ai.js"
import { onRequestPost as __ai_js_onRequestPost } from "D:\\Documents\\CODING\\JAVASCRIPT\\ReactChatGPTChatbot-main\\functions\\ai.js"

export const routes = [
    {
      routePath: "/ai",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [],
      modules: [__ai_js_onRequestOptions],
    },
  {
      routePath: "/ai",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__ai_js_onRequestPost],
    },
  ]