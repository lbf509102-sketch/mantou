# 馒头主页说明书

这是一个本地可运行的 Next.js 小主页项目，当前主页主角是“馒头”，并带有一个规则型数字分身聊天区。

## 1. 它现在知道什么

当前数字分身的回答是手写规则，不是真正接模型自由生成。

它现在主要知道这些内容：

- 馒头叫什么名字
- 馒头大概是什么样子
- 馒头什么时候出生
- 馒头最近在忙什么
- 馒头喜欢什么
- 馒头和吃饭、纸团、小鸭子玩具有关的基础设定

相关代码主要在：

- [components/cat-chat.tsx](D:/mantou/components/cat-chat.tsx)

## 2. 它现在不知道什么

它现在还不知道这些：

- 更细的个人经历
- 更长的连续上下文
- 你的真实联系方式
- 你没有手动写进规则里的新信息

也就是说，当前这版更像“带设定的聊天组件”，还不是一个真正长期记忆型数字分身。

## 3. 如果出问题，先怎么查

### 不回复

先看：

- `components/cat-chat.tsx`

重点查：

- `handleSubmit`
- `submitQuestion`
- 输入框和按钮是否正常触发

### 答偏了

先看：

- `components/cat-chat.tsx`

重点查：

- `getMantouReply`

因为现在回答是按关键词分支写的，答偏一般就是关键词判断不够准，或者文案没写好。

### 风格不对

先看：

- `components/cat-chat.tsx`
- `components/cat-home-page.tsx`

前者决定聊天语气，后者决定页面整体欢迎语和介绍口吻。

### 编造信息

当前这版不是模型自由生成，主要风险不是“AI乱编”，而是：

- 规则里写进了不准确内容
- 页面文案和聊天文案互相不一致

所以要优先核对：

- `components/cat-chat.tsx`
- `components/cat-home-page.tsx`

## 4. 以后如果接 API，要记住什么

API Key 不能写死在代码里。

不要这样做：

- 把 key 直接写进 `ts`、`tsx`、`js` 文件
- 把 key 提交进项目目录里的明文代码

应该这样做：

- 用环境变量
- 本地放在 `.env.local`
- 上线前检查部署平台里的环境变量是否正确配置

上线前至少检查：

- `OPENAI_API_KEY` 这类变量是否已经配置
- 代码里有没有硬编码 key
- `.env.local` 有没有被误传

## 5. 当前最关键的文件地图

- 主页入口：`app/page.tsx`
- 主页主体：`components/cat-home-page.tsx`
- 数字分身聊天：`components/cat-chat.tsx`
- 主要样式：`components/cat-home-page.module.css`
- 桌宠逻辑：`components/mantou-pet.tsx`

## 6. 本地运行

```powershell
cd /d D:\mantou
npm run dev -- --port 3001
```

打开：

- [http://localhost:3001](http://localhost:3001)
