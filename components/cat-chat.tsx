"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "assistant" | "user";
  text: string;
};

type CatChatProps = {
  styles: Record<string, string>;
};

const starterQuestions = [
  "你叫什么名字？",
  "你最近在忙什么？",
  "你最喜欢什么？",
];

const persona = {
  name: "馒头",
  species: "黑狸花猫",
  birthday: "2026 年 2 月 2 日",
  features: "右耳旁边那根很有存在感的呆毛",
  tone: "熟一点会撒娇，陌生时先观察，但整体愿意聊天",
  routine: "在窗边看一会儿、守着饭点、追纸团、跟小鸭子玩具狠狠干一架",
  favorites: "干饭、纸团、小鸭子玩具，还有别人主动来跟它说话",
  boundaries: "不知道真实联系方式、工作经历、没写进设定里的新事实",
};

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function getMantouReply(input: string) {
  const raw = input.trim();
  const text = raw.toLowerCase();

  if (!raw) {
    return "喵？先和我打个招呼吧。你开口以后，我才比较好决定要认真聊哪一题。";
  }

  if (includesAny(text, ["你好", "嗨", "hello", "hi", "在吗"])) {
    return `在呀。我是${persona.name}，现在状态还不错，愿意陪你慢慢聊两句。你想先认识我，还是直接问我最近在忙什么？`;
  }

  if (includesAny(text, ["名字", "叫什", "mantou"])) {
    return `我叫${persona.name}，是一只${persona.species}。如果你第一次见我，大概率会先注意到${persona.features}。`;
  }

  if (includesAny(text, ["多大", "几岁", "出生", "生日"])) {
    return `我出生在 ${persona.birthday}。现在还是小猫阶段，所以很多事情都想先靠近闻闻、看看，再决定要不要认真参与。`;
  }

  if (includesAny(text, ["长相", "特点", "耳朵", "呆毛", "你什么样"])) {
    return `如果只允许我挑一个记忆点，那一定是${persona.features}。再加上黑狸花纹路，就比较容易一眼认出来。`;
  }

  if (includesAny(text, ["最近", "忙", "在做", "今天在干嘛"])) {
    return `我最近的日常其实挺稳定的：${persona.routine}。听起来不复杂，但我做这些事的时候都很认真。`;
  }

  if (includesAny(text, ["喜欢", "爱好", "兴趣"])) {
    return `我喜欢的东西不算少，但顺序 usually 很稳定：${persona.favorites}。如果一定要排第一，那大概率还是饭。`;
  }

  if (includesAny(text, ["吃", "饭", "罐头", "零食"])) {
    return "关于吃饭这件事，我的态度一直很明确：可以等，但不能忘；可以慢一点端来，但最好别改时间。";
  }

  if (includesAny(text, ["纸团", "玩具", "小鸭子", "小黄鸭"])) {
    return "纸团和小鸭子玩具对我来说不是普通摆设，它们更像我一天里会认真处理的小事件。纸团要追，小鸭子要狠狠干一架。";
  }

  if (includesAny(text, ["性格", "脾气", "好相处", "你是什么性格"])) {
    return `我不是那种一上来就特别热情的类型，会先观察一下。但如果气氛舒服，我其实挺会接话，也比看起来更会撒娇。`;
  }

  if (includesAny(text, ["你爸妈", "主人", "谁养你", "谁照顾你"])) {
    return "照顾我的人，就是每天给我准备饭饭、看我闹腾、还会记得把纸团从沙发底下捞出来的人类。这个答案不花哨，但对我来说已经很具体了。";
  }

  if (includesAny(text, ["联系方式", "微信", "电话", "邮箱", "怎么联系"])) {
    return "这个我现在不知道，也不会乱编。当前这版我更适合聊馒头本身的设定、日常和喜好。";
  }

  if (includesAny(text, ["工作", "职业", "项目", "做过什么"])) {
    return "这类信息不在我现在这版设定里，我不想为了接话就乱说。如果你之后要让我更像本人，这类内容需要你手动补进来。";
  }

  if (includesAny(text, ["你知道什么", "你不知道什么", "你会什么"])) {
    return `我现在主要知道这些：我是谁、长什么样、什么时候出生、平时在忙什么、喜欢什么。至于 ${persona.boundaries}，这部分我现在不会假装知道。`;
  }

  return "这个问题我不想随口编一个答案糊弄你。现在这版我更擅长聊这些：我是谁、平时在做什么、喜欢什么、吃饭态度、纸团和玩具。你也可以换个更贴近这些方向的问法。";
}

export function CatChat({ styles }: CatChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "喵呜，我是馒头的数字分身。现在这版我最擅长聊自己的日常、喜好、性格和吃饭态度。",
    },
  ]);

  function submitQuestion(question: string) {
    const value = question.trim();

    if (!value) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: value },
      { role: "assistant", text: getMantouReply(value) },
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(input);
  }

  return (
    <section className={styles.chatCard}>
      <div className={styles.chatTop}>
        <div>
          <p className={styles.chatKicker}>Mantou Chat</p>
          <h3 className={styles.chatTitle}>和馒头聊两句</h3>
        </div>
        <div className={styles.chatStatus}>可直接提问</div>
      </div>

      <div className={styles.bubbleWrap}>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? styles.assistantBubble
                : styles.userBubble
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className={styles.chipIntro}>点一下，问题会直接发出去：</div>
      <div className={styles.chipRow}>
        {starterQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => submitQuestion(question)}
            className={styles.chip}
          >
            {question}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="比如：你是什么性格？"
          className={styles.chatInput}
        />
        <button type="submit" className={styles.chatButton}>
          发送问题
        </button>
      </form>
    </section>
  );
}
