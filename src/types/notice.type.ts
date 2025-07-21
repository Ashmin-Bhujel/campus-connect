import { noticeTable } from "../db/schema";

export type NoticeSelect = typeof noticeTable.$inferSelect;
export type NoticeInsert = typeof noticeTable.$inferInsert;
