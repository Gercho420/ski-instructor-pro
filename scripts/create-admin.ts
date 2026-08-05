import { db } from "../server/db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function createAdmin() {
  const email = "admin@skipro.com";
  const plainPassword = "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

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
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Error al crear/actualizar el admin:", err);
  process.exit(1);
});
