import { writeFile } from "fs/promises";

export const writeJsonToFile = async (
  filePath: string,
  jsonObject: object,
): Promise<void> => {
  try {
    // JSONオブジェクトを文字列に変換
    const jsonString = JSON.stringify(jsonObject, null, 2);

    // ファイルに書き込む
    await writeFile(filePath, jsonString, "utf8");

    console.log("File written successfully");
  } catch (error) {
    console.error("Error writing file:", error);
  }
};
