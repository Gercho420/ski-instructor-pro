import { createAdminUser, getUserByEmail } from "../server/db";
import { hashPassword } from "../server/auth";

async function main() {
  const email = process.argv[2] || "admin@skipro.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin";

  console.log(`Creando usuario administrador: ${email}...`);

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log(`El usuario con email ${email} ya existe.`);
      process.exit(0);
    }

    const passwordHash = await hashPassword(password);
    await createAdminUser(email, passwordHash, name);

    console.log("¡Usuario administrador creado con éxito!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Error al crear el usuario administrador:", error);
    process.exit(1);
  }
}

main();
