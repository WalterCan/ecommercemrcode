const { User } = require('./src/models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdmin() {
  try {
    const email = 'admin@vibrabonito.com.ar';
    const password = 'VibraAdmin2026!'; // <--- ESTA SERÁ TU CONTRASEÑA
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Buscar si ya existe
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      // Si existe, lo actualizamos a super_admin y cambiamos password
      await user.update({
        password: hashedPassword,
        role: 'super_admin',
        is_active: true
      });
      console.log('✅ Usuario administrador actualizado con éxito.');
    } else {
      // Si no existe, lo creamos
      await User.create({
        name: 'Administrador Vibrabonito',
        email: email,
        password: hashedPassword,
        role: 'super_admin',
        is_active: true
      });
      console.log('✅ Nuevo usuario administrador creado con éxito.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin:', error);
    process.exit(1);
  }
}

fixAdmin();
