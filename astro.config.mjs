import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import playformCompress from "@playform/compress";
import terser from "@rollup/plugin-terser";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";

import { CODE_THEME, USER_SITE } from "./src/config.ts";

import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

// 复制视频文件的函数
function copyVideos() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.join(__dirname);
  const sourceDir = path.join(rootDir, "src", "content", "blog", "assets");
  const targetDir = path.join(rootDir, "public", "blog", "assets");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      }
      else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDir(sourceDir, targetDir);
  console.log("视频文件已复制到 public 目录");
}

// https://astro.build/config
export default defineConfig({
  site: USER_SITE,
  output: "static",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [
    mdx({
      rehypePlugins: [
        () => {
          return (tree) => {
            visit(tree, "element", (node) => {
              // 处理 Markdown 图片语法
              if (node.tagName === "img") {
                const src = node.properties?.src;
                if (src && src.endsWith(".mp4")) {
                  // 创建 VideoPlayer 组件
                  const videoComponent = {
                    type: "mdxJsxFlowElement",
                    name: "VideoPlayer",
                    attributes: [
                      {
                        type: "mdxJsxAttribute",
                        name: "src",
                        value: src,
                      },
                    ],
                    children: [],
                  };

                  // 替换原始节点
                  Object.assign(node, videoComponent);
                }
              }
              // 处理 video 标签
              else if (node.tagName === "video") {
                const videoSrc = node.properties?.src;
                if (videoSrc) {
                  // 创建 VideoPlayer 组件
                  const videoComponent = {
                    type: "mdxJsxFlowElement",
                    name: "VideoPlayer",
                    attributes: [
                      {
                        type: "mdxJsxAttribute",
                        name: "src",
                        value: videoSrc,
                      },
                    ],
                    children: [],
                  };

                  // 替换原始节点
                  Object.assign(node, videoComponent);
                }
              }
              // 处理包裹视频的 p 标签
              else if (node.tagName === "p") {
                // 检查是否包含 video 标签或 img 标签
                const hasVideo = node.children.some((child) =>
                  (child.type === "element" && child.tagName === "video")
                  || (child.type === "element" && child.tagName === "img" && child.properties?.src?.endsWith(".mp4")),
                );

                if (hasVideo) {
                  // 移除 p 标签，保留其子元素
                  Object.assign(node, {
                    type: "element",
                    tagName: "div",
                    properties: {},
                    children: node.children,
                  });
                }
              }
            });
          };
        },
      ],
    }),
    icon(),
    terser({
      compress: true,
      mangle: true,
    }),
    sitemap(),
    tailwind({
      configFile: "./tailwind.config.mjs",
    }),
    playformCompress(),
  ],
  markdown: {
    shikiConfig: {
      theme: CODE_THEME,
      transformers: [{
        preprocess(code, options) {
          this.meta = { lang: options.lang || "plaintext" };
          return code;
        },
        pre(node) {
          const language = this.meta?.lang.toUpperCase() || "plaintext";

          return {
            type: "element",
            tagName: "div",
            properties: {
              class: "not-prose frosti-code",
            },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: {
                  class: "frosti-code-toolbar",
                },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: { class: "frosti-code-toolbar-language" },
                    children: [{ type: "text", value: language }],
                  },
                  {
                    type: "element",
                    tagName: "button",
                    properties: {
                      "class": "btn-copy",
                      "aria-label": "Copy code",
                      "type": "button",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "span",
                        properties: {
                          "class": "frosti-code-toolbar-copy-icon",
                          "aria-hidden": "true",
                        },
                        children: [
                          {
                            type: "element",
                            tagName: "svg",
                            properties: {
                              "xmlns": "http://www.w3.org/2000/svg",
                              "width": "18",
                              "height": "18",
                              "viewBox": "0 0 24 24",
                              "fill": "none",
                              "stroke": "currentColor",
                              "stroke-width": "2",
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "class": "copy-icon",
                            },
                            children: [
                              {
                                type: "element",
                                tagName: "rect",
                                properties: {
                                  x: "9",
                                  y: "9",
                                  width: "13",
                                  height: "13",
                                  rx: "2",
                                  ry: "2",
                                },
                                children: [],
                              },
                              {
                                type: "element",
                                tagName: "path",
                                properties: {
                                  d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
                                },
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "element",
                        tagName: "span",
                        properties: {
                          "class": "frosti-code-toolbar-copy-success hidden",
                          "aria-hidden": "true",
                        },
                        children: [
                          {
                            type: "element",
                            tagName: "svg",
                            properties: {
                              "xmlns": "http://www.w3.org/2000/svg",
                              "width": "18",
                              "height": "18",
                              "viewBox": "0 0 24 24",
                              "fill": "none",
                              "stroke": "currentColor",
                              "stroke-width": "2",
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "class": "success-icon",
                            },
                            children: [
                              {
                                type: "element",
                                tagName: "path",
                                properties: {
                                  d: "M20 6L9 17l-5-5",
                                },
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                ...node,
                properties: {
                  ...node.properties,
                  class: "frosti-code-content",
                },
                children: [
                  {
                    type: "element",
                    tagName: "code",
                    properties: {
                      class: "grid [&>.line]:px-4",
                      style: "counter-reset: line",
                    },
                    children: node.children,
                  },
                ],
              },
            ],
          };
        },
        line(node) {
          return {
            ...node,
            properties: {
              ...node.properties,
              class: "line before:content-[counter(line)]",
              style: "counter-increment: line",
            },
          };
        },
        code(node) {
          delete node.properties.style;
          return node;
        },
      }],
    },
    remarkPlugins: [remarkMath, remarkReadingTime],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypeExternalLinks,
        {
          content: { type: "text", value: "↗" },
        },
      ],
      () => {
        return (tree) => {
          visit(tree, "element", (node) => {
            // 处理图片标签
            if (node.tagName === "img") {
              const src = node.properties?.src;
              if (src) {
                // 如果是视频文件
                if (src.endsWith(".mp4")) {
                  // 创建视频容器
                  const videoContainer = {
                    type: "element",
                    tagName: "div",
                    properties: {
                      class: "video-container",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "video",
                        properties: {
                          "controls": true,
                          "crossorigin": "anonymous",
                          "playsinline": true,
                          "preload": "metadata",
                          "x-webkit-airplay": "allow",
                          "webkit-playsinline": "true",
                        },
                        children: [
                          {
                            type: "element",
                            tagName: "source",
                            properties: {
                              src,
                              type: "video/mp4",
                            },
                            children: [],
                          },
                          {
                            type: "element",
                            tagName: "p",
                            properties: {
                              class: "vjs-no-js",
                            },
                            children: [
                              {
                                type: "text",
                                value: "要观看此视频，请启用 JavaScript，并考虑升级到支持 HTML5 视频的 Web 浏览器",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  };

                  // 替换原始节点
                  Object.assign(node, videoContainer);
                }
                // 如果是图片文件
                else if (src.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
                  // 保持原样，只添加响应式类
                  node.properties.class = "responsive-image";
                }
              }
            }
          });
        };
      },
    ],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    assetsInclude: ["**/*.mp4"],
    optimizeDeps: {
      include: [],
    },
  },
  hooks: {
    "astro:build:start": () => {
      copyVideos();
    },
  },
});
