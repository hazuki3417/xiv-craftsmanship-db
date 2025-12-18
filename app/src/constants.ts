export const PUPPETEER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/127.0.0.0 Safari/537.36";

export const PUPPETEER_LAUNCH_OPTION = {
  headless: true,
  executablePath:
    "/home/pptruser/.cache/puppeteer/chrome/linux-143.0.7499.42/chrome-linux64/chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};

export const PUPPETEER_PAGE_VIEWPORT = {
  width: 1080,
  height: 1024,
};
