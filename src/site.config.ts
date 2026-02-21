export const defaultSiteConfig = {
  title: "I'm Sorry",
  description: "A premium interactive apology template",
  images: [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800", // Confession (Section 2)
    "https://images.unsplash.com/photo-1516589174184-c684846b674a?auto=format&fit=crop&q=80&w=800", // Memory Lane (Section 3)
    "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&q=80&w=800", // Puzzle (Section 5)
  ],
  hero: {
    typingText: "Esha ❤️ I know you're mad at me right now...",
    sliderText: "Slide to hear me out",
  },
  confession: {
    text: "And I hate being the reason this smile is gone. Here are 3 reasons why I'm officially an idiot...",
    reasons: [
      "I was being stubborn and didn't listen to you.",
      "I let my mood get the better of me.",
      "I forgot how much your feelings matter to me.",
    ],
  },
  memoryLane: {
    apologyMessage: "I miss our inside jokes more than anything. I am truly sorry for what I said.",
  },
  peaceOffering: {
    bribes: [
      { label: "Free Foot Rub", probability: 0.25 },
      { label: "Sushi Date On Me", probability: 0.25 },
      { label: "I'll Do The Dishes For A Week", probability: 0.5 },
    ],
    winningIndex: 2,
  },
  puzzle: {
    finalPlea: "We are better together. Can we fix this?",
  },
  verdict: {
    forgiveText: "I Forgive You",
    nopeText: "Nope. Still Mad.",
    whatsappMessage: "Fine, I forgive you. When are you taking me to get my prize?",
    whatsappNumber: "1234567890", // User should customize this
  },
};

// Backward-compatible alias
export const siteConfig = defaultSiteConfig;

export type SiteConfig = typeof defaultSiteConfig;
