import prisma from './lib/prisma.mjs';
import bcrypt from 'bcryptjs';

async function diagnoseLogin() {
    const email = 'test@example.com';
    const password = 'password123';

    console.log(`--- Diagnóstico de Login para: ${email} ---`);

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        console.log('❌ Usuario no encontrado en la base de datos.');
        return;
    }

    console.log('✅ Usuario encontrado. ID:', user.id);

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
        console.log('✅ ¡La contraseña coincide correctamente!');
    } else {
        console.log('❌ La contraseña NO coincide.');
        console.log('Hash en BD:', user.password);
    }
}

diagnoseLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
