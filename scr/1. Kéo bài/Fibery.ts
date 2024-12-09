import * as log from "@std/log";
import { resolve } from "@std/path/resolve";
import { lấyEnv, NƠI_LƯU } from "../Code hỗ trợ/env và hằng.ts";
import { BàiTrênFibery, dsNodeẢnh, header, tạoQueryBody, tảiẢnh } from "../Code hỗ trợ/Fibery/Code hỗ trợ cho Fibery.ts";

export async function truyVấnFibery(): Promise<BàiTrênFibery[] | never[]> {
  const FIBERY_HOST = lấyEnv("FIBERY_HOST");
  const FIBERY_ARTICLE_DATABASE = lấyEnv("FIBERY_ARTICLE_DATABASE");
  const FIBERY_ARTICLE_SPACE = lấyEnv("FIBERY_ARTICLE_SPACE");
  const fiberyEndPoint = `${FIBERY_HOST}/api/graphql/space/${FIBERY_ARTICLE_SPACE}`;

  log.info("Lấy dữ liệu trên Fibery");
  const queryBody = await tạoQueryBody("scr/Code hỗ trợ/Fibery/query.graphql");
  const kếtQuả = await (await fetch(fiberyEndPoint, {
    method: "POST",
    body: queryBody,
    headers: header(),
  })).json();
  if (!kếtQuả.data) {
    log.error(`Phản hồi từ Fibery: "${kếtQuả.message}"`);
    return [];
  }
  return kếtQuả.data[`find${FIBERY_ARTICLE_DATABASE}`];
}

async function tảiTấtCảẢnh(md: string) {
  const dsĐườngDẫnTớiẢnh: Array<string | undefined> = [];
  for (const nodeẢnh of dsNodeẢnh(md)) {
    dsĐườngDẫnTớiẢnh.push(await tảiẢnh(nodeẢnh));
  }
  return dsĐườngDẫnTớiẢnh;
}

async function tảiBài(name: string, md: string) {
  const đườngDẫnTớiBài = resolve(NƠI_LƯU, `${name}.md`.replace(/[/\\?%*:|"<>]/g, "-"));
  await Deno.writeTextFile(đườngDẫnTớiBài, md);
  return đườngDẫnTớiBài;
}

export async function tảiBàiVàẢnh(article: BàiTrênFibery) {
  const { name, content: { md }, creationDate } = article;
  console.log(creationDate, name);

  const đườngDẫnTớiBài = await tảiBài(name, md);
  const dsĐườngDẫnTớiẢnh: Array<string | undefined> = await tảiTấtCảẢnh(md);
  return {
    đườngDẫnTớiBài: đườngDẫnTớiBài,
    dsĐườngDẫnTớiẢnh: dsĐườngDẫnTớiẢnh,
  };
}
