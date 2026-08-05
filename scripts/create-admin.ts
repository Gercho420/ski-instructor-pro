import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Falta la variable de entorno DATABASE_URL");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function createAdmin() {
  const email = "admin@skipro.com";
  const plainPassword = "admin123";
  const hashedPassword = hashPassword(plainPassword);

  console.log(`Verificando usuario administrador: ${email}...`);
  
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    await db.update(users)
      .set({ password: hashedPassword, role: "admin" })
      .where(eq(users.email, email));
    console.log("¡Contraseña de administrador actualizada con éxito!");
  } else {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    });
    console.log("¡Usuario administrador creado con éxito!");
  }

  console.log(`Email: ${email}`);
  console.log(`Password: ${plainPassword}`);
  await client.end();
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Error al crear/actualizar el admin:", err);
  process.exit(1);
});
