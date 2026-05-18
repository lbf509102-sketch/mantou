export type Article = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  date: string;
  readTime: string;
  category: string;
  heroImage: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const navItems = [
  { label: "Work", href: "#work" },
  { label: "Notes", href: "#notes" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const featuredProjects = [
  {
    title: "Signal Garden",
    description:
      "A playful dashboard for tracking focus rituals, energy levels, and personal experiments without turning life into corporate analytics.",
    tag: "Product Design",
    accent: "var(--secondary)",
  },
  {
    title: "Frame/Break",
    description:
      "A writing lab for short essays, interface notes, and visual references with tactile navigation and loud editorial typography.",
    tag: "Editorial System",
    accent: "var(--muted)",
  },
  {
    title: "Pocket Arcade",
    description:
      "A collection of tiny browser toys built to study motion, delight, and responsive interaction patterns in public.",
    tag: "Creative Code",
    accent: "var(--accent)",
  },
];

export const articles: Article[] = [
  {
    slug: "building-a-louder-personal-site",
    title: "Building a Louder Personal Site",
    kicker: "Notes from the anti-boring internet",
    summary:
      "Why personal sites should feel authored, tactile, and unmistakably human instead of blending into another polished template feed.",
    date: "APR 29, 2026",
    readTime: "5 MIN READ",
    category: "Design Essay",
    heroImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    sections: [
      {
        heading: "A personal site should leave fingerprints",
        body: [
          "The internet gets flatter every year. Product pages melt into one another, portfolios read like investor decks, and the rough edges that used to signal a real person keep disappearing.",
          "I want a personal site to feel like an object someone made on purpose. That means obvious structure, loud choices, and enough friction to remind you that taste is not a bug.",
        ],
      },
      {
        heading: "Use systems, not sameness",
        body: [
          "A design system is not there to iron out personality. It should give personality a repeatable form. Colors, borders, shadows, spacing, and motion become a vocabulary rather than a constraint.",
          "Once those pieces are stable, every new page can stay coherent while still feeling alive. That's where the fun starts.",
        ],
      },
      {
        heading: "Mechanical interaction creates memory",
        body: [
          "Soft fades are forgettable. A button that physically snaps into place, a card that lifts when you hover, a sticker badge that tilts harder under the pointer: those details create memory through motion.",
          "The goal is not nostalgia for its own sake. The goal is to make digital surfaces feel touched.",
        ],
      },
    ],
  },
  {
    slug: "systems-for-small-creative-projects",
    title: "Systems for Small Creative Projects",
    kicker: "How to keep experiments moving",
    summary:
      "A lightweight structure for shipping side projects without draining the energy that made them interesting in the first place.",
    date: "APR 18, 2026",
    readTime: "4 MIN READ",
    category: "Process",
    heroImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    sections: [
      {
        heading: "Start with the smallest repeatable move",
        body: [
          "Creative projects die when every decision becomes a referendum on the final form. I like to define one repeatable action per project, something tiny enough to survive mood swings and busy weeks.",
          "That action might be one sketch, one paragraph, one interaction, or one testable release note. Repeatability is the engine.",
        ],
      },
      {
        heading: "Give each idea a visual home",
        body: [
          "A project gets easier to revisit when it already has a shape. Names, colors, headers, and a place to collect fragments all help the work feel alive even when it is unfinished.",
          "Design is not decoration here. It is commitment made visible.",
        ],
      },
    ],
  },
];
