import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm/sql/sql";

export const usersTable = mysqlTable("users_table", {
  id: serial().primaryKey().autoincrement(),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  roll_no: int(),
  programme: varchar({ length: 255 }),
  semester: varchar({ length: 255 }),
  shift: varchar({ length: 255 }),
  address: varchar({ length: 255 }).notNull(),
  contact_no: varchar({ length: 255 }).notNull(),
  dob: varchar({ length: 255 }).notNull(),
  role: mysqlEnum(["student", "admin"]),
  created_at: datetime()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const noticeTable = mysqlTable("notice_table", {
  id: serial().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  image: varchar({ length: 255 }),
  published_date: datetime()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
