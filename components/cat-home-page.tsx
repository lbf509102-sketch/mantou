import { CatAvatar } from "./cat-avatar";
import { CatChat } from "./cat-chat";
import { MantouPet } from "./mantou-pet";
import styles from "./cat-home-page.module.css";

const profileCards = [
  {
    label: "今天在忙",
    value: "认真守着饭点，也顺便看你有没有来打招呼",
  },
  {
    label: "最近喜欢",
    value: "干饭、追纸团，还有把小鸭子玩具拖来拖去",
  },
  {
    label: "初次见面",
    value: "右耳边那根呆毛很有存在感，性格也比看起来更会撒娇",
  },
];

const quickFacts = [
  ["名字", "馒头"],
  ["生日", "2026.02.02"],
  ["身份", "调皮又有主见的狸花猫"],
  ["最近日常", "在窗边发呆、等饭、顺手研究纸团"],
  ["聊天气质", "熟了以后会很会接话"],
];

const stickerNotes = ["黑狸花", "会等你说话", "爱咬纸团"];

export function CatHomePage() {
  return (
    <main className={styles.page}>
      <MantouPet styles={styles} />

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.badge}>欢迎来到馒头的小猫主页</div>
              <h1 className={styles.heroTitle}>
                <span>馒头</span>
              </h1>
              <p className={styles.heroIntro}>
                这不是一张冷冰冰的资料页，而是馒头留给你的一个小角落。你可以在这里认识它、
                看看它最近在忙什么，也可以直接去聊天区和它打个招呼。
              </p>

              <div className={styles.heroWarmNote}>
                <p className={styles.heroWarmTitle}>适合慢慢看的小主页</p>
                <p className={styles.heroWarmText}>
                  馒头平时最擅长的事情是守着饭点、观察窗外、把纸团叼走研究一下。
                  如果你愿意停一下，它也很乐意陪你聊两句。
                </p>
              </div>

              <div className={styles.stickerRow}>
                {stickerNotes.map((item, index) => (
                  <span
                    key={item}
                    className={`${styles.sticker} ${
                      index === 1
                        ? styles.stickerPink
                        : index === 2
                          ? styles.stickerYellow
                          : styles.stickerBlue
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className={styles.statGrid}>
                {profileCards.map((card) => (
                  <article key={card.label} className={styles.statCard}>
                    <p className={styles.statLabel}>{card.label}</p>
                    <p className={styles.statValue}>{card.value}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.avatarWrap}>
              <CatAvatar styles={styles} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={`${styles.sectionTag} ${styles.pinkTag}`}>
                About Mantou
              </div>
              <h2 className={styles.sectionTitle}>认识一下馒头</h2>
              <p className={styles.sectionDesc}>
                这里放的是几条最容易记住的小信息，不像简历，更像第一次见面时会顺口聊到的内容。
              </p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            {quickFacts.map(([label, value]) => (
              <article key={label} className={styles.infoCard}>
                <span className={styles.infoIcon} aria-hidden="true" />
                <p className={styles.infoLabel}>{label}</p>
                <p className={styles.infoValue}>{value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.chatSection}>
        <div className={styles.container}>
          <div className={styles.chatGrid}>
            <aside className={styles.chatAside}>
              <div className={`${styles.sectionTag} ${styles.blueTag}`}>
                Digital Twin
              </div>
              <h2 className={styles.chatAsideTitle}>来和馒头聊两句</h2>
              <p className={styles.chatAsideText}>
                如果你不想只是看资料，可以直接在这里提问。它会用一种更像聊天、而不是像填表的方式回应你。
              </p>
            </aside>

            <CatChat styles={styles} />
          </div>
        </div>
      </section>
    </main>
  );
}
