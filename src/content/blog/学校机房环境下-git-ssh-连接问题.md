---
title: 学校机房环境下 Git SSH 连接问题
description: "关于「学校机房环境下 Git SSH 连接问题」的记录与想法"
pubDate: 2025-06-12
image: /image/p23.png
categories:
  - tech
tags:
  - 😅
---
📅 **时间**: 15:05  
🌤️ **天气**: 银川 21~34℃ 多云

> 新秋逢闰，鹊桥重驾，两度人间乞巧。

<cite style="text-align: right; display: block;">— 顾太清 · 《鹊桥仙·云林瞩题闰七夕联吟图》</cite>


### 解决学校机房环境下 Git SSH 连接问题

在学校的网络环境中，使用 Git 提交代码时经常会遇到各种连接问题，尤其是在尝试通过 SSH 协议连接到远程仓库（如 Gitee 或 GitHub）时。

#### 1. 确认网络环境对 SSH 的影响

首先，在学校机房或类似受限网络环境中，SSH 默认端口（22）经常被屏蔽。这意味着直接使用 SSH 方式连接 Gitee 或 GitHub 将会失败：

```bash
ssh -T git@gitee.com
# 输出: ssh: connect to host gitee.com port 22: Connection timed out
```

#### 2. 检查 DNS 和基本连通性

虽然 SSH 不通，但可以通过 `ping` 命令检查是否能正常解析和访问目标域名：

```bash
ping gitee.com
```

如果 ping 成功，说明 DNS 和基础网络连通没有问题。

#### 3. 切换至 HTTPS 提交代码（推荐）

由于 SSH 在受限网络中可能无法使用，最简单可靠的替代方案是切换为 HTTPS 方式提交代码。具体步骤如下：

- 查看当前远程仓库地址：
  ```bash
  git remote -v
  ```
- 修改为 HTTPS 地址：
  ```bash
  git remote set-url origin https://gitee.com/你的用户名/项目名123.git
  ```
- 设置 Git 凭证缓存避免每次输入账号密码：
  ```bash
  git config --global credential.helper store
  ```

#### 4. 尝试 SSH over HTTPS（GitHub）

对于 GitHub ，可以尝试通过端口 443 使用 SSH。编辑 `.ssh/config` 文件添加以下内容：

```config
Host github.com
    HostName ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_rsa.github
```

然后测试连接：

```bash
ssh -T -p 443 git@github.com
```

注意：此方法不适用于 Gitee，因为 Gitee 不支持 SSH over 443。😅

#### 5. 总结

- **优先使用 HTTPS**：在学校等受限网络环境中，HTTPS 是最稳定可靠的方式。
- **配置凭证缓存**：使用 `git config --global credential.helper store` 可以记住你的凭证信息，避免频繁输入账号密码。
