import { openDB } from "idb";
const database = () =>
  openDB("reparo-private-files", 1, {
    upgrade(db) {
      db.createObjectStore("receipts");
      db.createObjectStore("manuals", { keyPath: "id" });
    },
  });
export async function saveReceipt(id: string, blob: Blob) {
  if (
    blob.size > 4 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(blob.type)
  )
    throw new Error("Choose a receipt image under 4 MB.");
  const db = await database();
  await db.put("receipts", blob, id);
  db.close();
}
export async function getReceipt(id: string): Promise<Blob | undefined> {
  const db = await database();
  const blob = await db.get("receipts", id);
  db.close();
  return blob;
}
export async function deleteReceipt(id: string) {
  const db = await database();
  await db.delete("receipts", id);
  db.close();
}
export type Manual = {
  id: string;
  title: string;
  brand: string;
  model: string;
  revision: string;
  source: string;
  pages: string[];
};
export async function manuals(): Promise<Manual[]> {
  const db = await database();
  const all = await db.getAll("manuals");
  db.close();
  return all;
}
export async function saveManual(manual: Manual) {
  const db = await database();
  if ((await db.count("manuals")) >= 10) {
    db.close();
    throw new Error(
      "Limit of ten local manuals reached. Remove an old manual first.",
    );
  }
  await db.put("manuals", manual);
  db.close();
}
export async function removeManual(id: string) {
  const db = await database();
  await db.delete("manuals", id);
  db.close();
}
