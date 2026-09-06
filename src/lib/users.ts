import { createHmac } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/json-store";

export type StoredUser = {
  email: string;
  name: string;
  passwordHash: string;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SECRET || "scls-databall-dev-secret-change-me";
}

export function hashPassword(password: string) {
  return createHmac("sha256", secret()).update(password).digest("hex");
}

export function allUsers() {
  return readJsonFile<StoredUser[]>("data/users.json", []);
}

export function findUser(email: string) {
  return allUsers().find((u) => u.email === email.trim().toLowerCase());
}

export function saveUser(user: StoredUser) {
  const users = allUsers().filter((u) => u.email !== user.email);
  users.unshift(user);
  writeJsonFile("data/users.json", users);
}
