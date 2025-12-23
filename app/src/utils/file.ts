import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const writeJsonToFile = async (
  filePath: string,
  jsonObject: object,
): Promise<void> => {
  try {
    // 親ディレクトリを必ず作成
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });

    // JSONオブジェクトを文字列に変換
    const jsonString = JSON.stringify(jsonObject, null, 2);

    // ファイルに書き込む
    await writeFile(filePath, jsonString, "utf8");

    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
};
