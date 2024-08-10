import puppeteer from 'puppeteer';


// main function
(async () => {
  // アイテムの一覧
  // https://jp.finalfantasyxiv.com/lodestone/playguide/db/item
  // アイテムの詳細
  // https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/{id}

  //  recipeの一覧
  // https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe
  // recipeの詳細
  // https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/{id}

// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7&category3=19
// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7&category3=c1
// 秘伝書1
// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7&category4=0&category3=c1
// 秘伝書2
// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7&category4=1&category3=c1
// 秘伝書3
// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7&category4=2&category3=c1

// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7
// https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/?category2=7&category3=0
/**
 * 木工師　: category2=0
 * 鍛冶師　: category2=1
 * 甲冑師　: category2=2
 * 彫金師　: category2=3
 * 革細工師: category2=4
 * 裁縫師　: category2=5
 * 錬金術師: category2=6
 * 調理師　: category2=7
 *
 * 秘伝書1: category3=c1&category4=0
 */

  // category2: job
  // category3: level 1~5 -> 0, 96~100 -> 19


  // ハンマーヘッドダイルレザー
  // https://jp.finalfantasyxiv.com/lodestone/playguide/db/recipe/cefe671a817/

  // 製作可能なアイテムは全部recipeという扱いっぽい
  // 制作できないアイテムはitemという扱いらしい


  // document.querySelector("#eorzea_db > div.clearfix > div.db__menu > div:nth-child(4) > ul > li.db__menu__category__list.second_menu_7 > div > ul > li.third_menu_0")

  const url = 'https://p.ieyasu.co/eastrisev2/login'
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({width: 1080, height: 1024});
  await new Promise(resolve => setTimeout(resolve, 500));

  // input form
  await page.type('#user_login_id', '1566');
  await page.type('#user_password', 'Hazuki3417');
  await new Promise(resolve => setTimeout(resolve, 500));

  // login
  await page.click('#new_user > div.divBtn > input');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 退勤打刻
  await page.click('#btnIN2');
  await new Promise(resolve => setTimeout(resolve, 1000));

  await browser.close();
})();
