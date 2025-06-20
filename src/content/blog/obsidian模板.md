---
title: obsidian模板
description: obsidian的blog模板
pubDate: 2025-06-10
image: /image/p8.png
categories:
  - tech
tags:
  - day
---
📅 **时间**: 10:47  
🌤️ **天气**: 银川 20~33℃ 晴

> 初惊河汉落，半洒云天里。

<cite style="text-align: right; display: block;">— 李白 · 《望庐山瀑布水二首》</cite>

## 正文

obsidian模板

```javascript
<%*
// 获取天气信息，增加了完整的错误处理
async function getWeather(cityName = 'yinchuan', cityLabel = '银川') {
    try {
        const url = `https://www.tianqi.com/${cityName}/`;
        // 设置超时，防止请求卡死
        const res = await request({ url: url, method: "GET" });
        
        if (!res) return `${cityLabel} 天气获取失败`;

        const cleanedHtml = res.replace(/\s/g, '');
        
        const weatherContainerMatch = /<ddclass="weather">.*?<\/dd>/.exec(cleanedHtml);
        if (!weatherContainerMatch) return `${cityLabel} 天气数据解析失败 (容器未找到)`;
        
        const weatherDetailsMatch = /<span><b>(.*?)<\/b>(.*?)<\/span>/.exec(weatherContainerMatch[0]);
        if (!weatherDetailsMatch || !weatherDetailsMatch[1] || !weatherDetailsMatch[2]) {
            return `${cityLabel} 天气数据解析失败 (详情未找到)`;
        }
        
        return `${cityLabel} ${weatherDetailsMatch[2]} ${weatherDetailsMatch[1]}`;
    } catch (error) {
        console.error("获取天气时出错:", error);
        return `${cityLabel} 天气获取异常`;
    }
}
// 获取诗词，增加了完整的错误处理
async function getDailyPoem(tp) {
    try {
        const response = await tp.obsidian.request({ url: 'https://v1.jinrishici.com/all.json' });
        const data = JSON.parse(response);
        if (data && data.content) {
            return `> ${data.content}\n\n<cite style="text-align: right; display: block;">— ${data.author} · 《${data.origin}》</cite>`;
        }
        return "> 远方传来风笛，而我只在意你。"; 
    } catch (error) {
        console.error("获取诗词时出错:", error);
        return "> 远方传来风笛，而我只在意你。"; 
    }
}
// 1. 获取并校验日期
const today = tp.date.now("YYYY-MM-DD");
const inputDateStr = await tp.system.prompt("输入日期（格式：YYYY-MM-DD）", today);
const momentDate = window.moment(inputDateStr, "YYYY-MM-DD", true); // 使用严格模式
if (!momentDate.isValid()) {
    // 如果日期无效，则停止模板并通知用户
    new Notice("❌ 日期格式无效，请使用 YYYY-MM-DD 格式。");
    // 使用 throw 来中断模板执行，Obsidian 会捕获它
    throw new Error("Invalid date format");
}
// 2. 生成文件名和元数据
// 优化文件名，加入年份避免冲突： "2023-08-23"
const newFileName = momentDate.format("YYYY-MM-DD"); 
const titleName = momentDate.format("MM-DD"); // frontmatter 里的 title 保持 MM-DD
// 3. 并行获取网络数据（天气和诗词），提升速度
const [weather, dailyPoem] = await Promise.all([
    getWeather('yinchuan', '银川'), // 如果需要，可以改成 prompt 让用户输入
    getDailyPoem(tp)
]);
// 4. 定义文件元数据和内容
const modificationTime = tp.file.last_modified_date("HH:mm");
-%>
---
title: <% titleName %>
description: "<% titleName %> 的生活记录"
pubDate: <% momentDate.format("YYYY-MM-DD") %>
image: /images/blog/default.png
categories:
  - life
tags:
  - day
---
📅 **时间**: <% modificationTime %>  
🌤️ **天气**: <% weather %>

<% dailyPoem %>

## 正文

在这里写下今天的故事...
<%*
// 5. 移动文件到目标位置
// 修正了路径，去掉了开头的 "/"
const destDir = "blog/src/content/blog"; 
// 使用包含年份的文件名
await tp.file.move(destDir + "/" + newFileName); 
// 将光标定位，方便立即开始写作
tp.file.cursor();
-%>

```

