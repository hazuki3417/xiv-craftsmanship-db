export const PUPPETEER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/127.0.0.0 Safari/537.36";

export const PUPPETEER_LAUNCH_OPTION = {
  headless: true,
  executablePath:
    "/home/pptruser/.cache/puppeteer/chrome/linux-143.0.7499.42/chrome-linux64/chrome",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--ignore-certificate-errors",
    "--disable-dev-shm-usage",
  ],
};

export const PUPPETEER_PAGE_VIEWPORT = {
  width: 1080,
  height: 1024,
};

// 1ページあたりの表示件数
export const PAGE_PAR_ITEM = 50;

// webサイト上の大分類とID・ラベルのマッピング
export const MAP_ITEM_CATEGORY2 = {
  weapons: {
    id: 1,
    label: "武器",
  },
  tools: {
    id: 2,
    label: "道具",
  },
  armors: {
    id: 3,
    label: "防具",
  },
  accessorys: {
    id: 4,
    label: "アクセサリ",
  },
  medicines: {
    id: 5,
    label: "薬品・調理品",
  },
  materials: {
    id: 6,
    label: "素材",
  },
  other: {
    id: 7,
    label: "その他",
  },
  cc: {
    id: 99, // 使用しないID
    label: "カンパニー製作工程",
  },
} as const;

// webサイト上の大分類とID・ラベルのマッピング
export const MAP_RECIPE_CATEGORY2 = {
  carpenter: {
    id: 0,
    label: "木工師",
  },
  blacksmith: {
    id: 1,
    label: "鍛冶師",
  },
  armorer: {
    id: 2,
    label: "甲冑師",
  },
  goldsmith: {
    id: 3,
    label: "彫金師",
  },
  leatherworker: {
    id: 4,
    label: "皮細工師",
  },
  tailor: {
    id: 5,
    label: "裁縫師",
  },
  alchemist: {
    id: 6,
    label: "錬金術師",
  },
  cook: {
    id: 7,
    label: "調理師",
  },
  cc: {
    id: 99, // 使用しないID
    label: "カンパニー製作",
  },
} as const;
