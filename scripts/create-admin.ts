import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { scryptSync, randomBytes } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Falta la variable de entorno MYSQL_URL o DATABASE_URL");
  process.exit(1);
}

const connection = await mysql.createConnection(connectionString);
const db = drizzle(connection);

// Debe coincidir EXACTAMENTE con hashPassword() en server/auth.ts
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

async function createAdmin() {
  const email = "bautimignone@gmail.com";
  const plainPassword = "gercapobauti";
  const hashedPassword = hashPassword(plainPassword);

  console.log(`Verificando usuario administrador: ${email}...`);
  
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    await db.update(users)
      .set({ passwordHash: hashedPassword, role: "admin" })
      .where(eq(users.email, email));
    console.log("¡Contraseña de administrador actualizada con éxito!");
  } else {
    await db.insert(users).values({
      email,
      passwordHash: hashedPassword,
      name: "Admin",
      role: "admin",
    });
    console.log("¡Usuario administrador creado con éxito!");
  }

  console.log(`Email: ${email}`);
  console.log(`Password: ${plainPassword}`);
  await connection.end();
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Error al crear/actualizar el admin:", err);
  process.exit(1);
});
