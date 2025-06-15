import { getImage } from "astro:assets";

export async function getVideo(src: string) {
  // 从 src/content 目录导入视频
  const videoModule = await import(`../content/blog/${src}`);
  return videoModule.default;
}

export function getVideoPath(src: string) {
  // 从 src/content 目录获取视频路径
  return `../../content/blog/${src}`;
} 