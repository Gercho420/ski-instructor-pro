import bcrypt from "bcryptjs";
import { db } from "../server/db";
import { users } from "../drizzle/schema";

async function main() {
  // Toma los argumentos pasados por consola o usa valores por defecto
  const email = process.argv[2] || "admin@skipro.com";
  const password = process.argv[3] || "admin123";

  // Encripta la contraseña con bcrypt (12 rounds de salting)
  const passwordHash = await bcrypt.hash(password, 12);

  // Inserta el usuario admin en la base de datos
  await db.insert(users).values({
    email: email.trim().toLowerCase(),
    passwordHash,
    name: "Admin",
    role: "admin",
  });

  console.log(`\n✅ Usuario Administrador creado exitosamente!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}\n`);
  
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Error al crear el usuario administrador:", err);
  process.exit(1);
});
