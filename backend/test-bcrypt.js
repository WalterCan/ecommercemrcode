const bcrypt = require('bcrypt');

async function testPassword() {
    const plainPassword = 'admin123';

    // Generar hash (como lo hace seedAdmin)
    const hash = await bcrypt.hash(plainPassword, 10);
    console.log('Hash generado:', hash);

    // Verificar (como lo hace validPassword)
    const isValid = await bcrypt.compare(plainPassword, hash);
    console.log('¿Contraseña válida?:', isValid);

    // Probar con contraseña incorrecta
    const isInvalid = await bcrypt.compare('wrong', hash);
    console.log('¿Contraseña incorrecta válida?:', isInvalid);
}

testPassword();
