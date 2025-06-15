---
title: 在 Astro 中实现 Obsidian 风格的视频播放
description: 如何在 Astro 博客中支持 Obsidian 风格的视频播放
pubDate: 2025-06-14
image: /image/p22.png
categories:
  - tech
tags:
  - astro
  - obsidian
  - video
---

在 Astro 博客中，如果需要展示视频内容。特别是当我们使用 Obsidian 写作时，会使用类似这样的语法：

```markdown
![](assets/2025-06-14.assets/我一直在哭.mp4)
```

但是，这种语法在 Astro 中默认会被渲染为图片标签，无法播放视频。本文将介绍如何解决这个问题。

## 安装依赖

首先，我们需要安装必要的依赖：

```bash
pnpm add unist-util-visit
```

这个库用于遍历和修改 Markdown 转换后的 HTML 树。

## 实现方案

我们使用了 Astro 的 `rehypePlugins` 功能，在 Markdown 转换为 HTML 的过程中自动处理视频链接。具体实现如下：

1. 首先，在 `astro.config.mjs` 中添加自定义的 rehype 插件和配置：

```javascript
import { visit } from "unist-util-visit";

export default defineConfig({
  markdown: {
    rehypePlugins: [
      // ... 其他插件
      () => {
        return (tree) => {
          visit(tree, "element", (node) => {
            if (node.tagName === "img" && node.properties?.src?.endsWith(".mp4")) {
              node.tagName = "video";
              node.properties = {
                controls: true,
                style: "max-width: 800px; margin: 1rem auto; border-radius: 8px; overflow: hidden;",
                src: `/content/blog/${node.properties.src}`,
              };
            }
          });
        };
      },
    ],
  },
  vite: {
    assetsInclude: ["**/*.mp4"],
    publicDir: "src/content",
  },
});
```

2. 这个配置会：
   - 检测所有以 `.mp4` 结尾的图片链接
   - 将它们转换为 `<video>` 标签
   - 添加播放控制按钮
   - 设置合适的样式
   - 直接从 `src/content` 目录提供视频文件

## 使用方法

现在，你可以在 Markdown 文件中直接使用 Obsidian 风格的视频链接：

```markdown
![](assets/2025-06-14.assets/我一直在哭.mp4)
```

它会自动被转换为一个视频播放器。

## 优点

1. 保持 Obsidian 的写作习惯
2. 无需修改现有的 Markdown 文件
3. 自动处理视频播放器的样式和功能
4. 代码简洁，易于维护
5. 视频文件直接存放在 `src/content` 目录下，无需复制到 `public` 目录,这样子可以使用obsidian中的有个插件,是那个插件我忘记了.....

## 注意事项

1. 确保视频文件放在正确的位置（`src/content/blog/assets/` 目录下）
2. 视频文件路径要正确（包括大小写）
3. 视频格式要使用浏览器支持的格式（如 MP4）
4. **路径处理的重复叠加**：
   - Markdown 原始路径：`assets/2025-06-14.assets/我一直在哭.mp4`
   - Astro 自动处理：`/blog/assets/2025-06-14.assets/我一直在哭.mp4`
   - 我们的 rehype 插件又加了一次：`/blog/blog/assets/...`
   - ObsidianVideo 组件又加了一次：`/blog/blog/blog/assets/...`
	**问题根源**：
   - 我们错误地假设 Astro 不会处理路径
   - 实际上 Astro 已经自动将 `assets/` 开头的路径转换为相对于 `public` 目录的路径
   - 我们的代码又重复添加了 `/blog/` 前缀，导致路径重复
	**解决方案**：
   - 在 `astro.config.mjs` 中：直接使用 Astro 处理过的路径，不再添加 `/blog/` 前缀
   - 在 `ObsidianVideo.astro` 中：直接使用传入的 `src`，不再添加 `/blog/` 前缀

4. **正确的路径处理流程**：
   ```
   Markdown: assets/2025-06-14.assets/我一直在哭.mp4
   ↓ (Astro 自动处理)
   /blog/assets/2025-06-14.assets/我一直在哭.mp4
   ↓ (我们的组件直接使用)
   最终路径：/blog/assets/2025-06-14.assets/我一直在哭.mp4
   ```

这个问题的教训是：在使用框架时，需要先了解框架的默认行为，避免重复处理已经被框架处理过的内容。
nmd
## 总结

通过这个实现，我们：

1. 使用 `unist-util-visit` 库处理 Markdown 转换
2. 配置了 Astro 的 rehype 插件
3. 设置了 Vite 的 `publicDir` 和 `assetsInclude` 选项
4. 实现了 Obsidian 风格的视频播放

这样，我们就可以在保持 Obsidian 写作习惯的同时，在 Astro 博客中展示视频内容了。


![](assets/在%20Astro%20中实现%20Obsidian%20风格的视频播放.assets/我怀念的.mp4)