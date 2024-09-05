const Juego = require('./models/Juego');
const Plataforma = require('./models/Plataforma');
const Genero = require('./models/Genero');
const Tema = require('./models/Tema');
const ModoJuego = require('./models/ModoJuego');
const PerspectivaJugador = require('./models/PerspectivaJugador');
const EmpresaInvolucrada = require('./models/EmpresaInvolucrada');
const MotorJuego = require('./models/MotorJuego');

Juego.belongsToMany(Plataforma, { through: 'JuegoPlataformas', as: 'plataformas' });
Plataforma.belongsToMany(Juego, { through: 'JuegoPlataformas', as: 'juegos' });

Juego.belongsToMany(Genero, { through: 'JuegoGeneros', as: 'generos' });
Genero.belongsToMany(Juego, { through: 'JuegoGeneros', as: 'juegos' });

Juego.belongsToMany(Tema, { through: 'JuegoTemas', as: 'temas' });
Tema.belongsToMany(Juego, { through: 'JuegoTemas', as: 'juegos' });

Juego.belongsToMany(ModoJuego, { through: 'JuegoModosDeJuego', as: 'modosJuego' });
ModoJuego.belongsToMany(Juego, { through: 'JuegoModosDeJuego', as: 'juegos' });

Juego.belongsToMany(PerspectivaJugador, { through: 'JuegoPerspectivasJugadores', as: 'perspectivasJugador' });
PerspectivaJugador.belongsToMany(Juego, { through: 'JuegoPerspectivasJugadores', as: 'juegos' });

Juego.belongsToMany(EmpresaInvolucrada, { through: 'JuegoEmpresasInvolucradas', as: 'empresasInvolucradas' });
EmpresaInvolucrada.belongsToMany(Juego, { through: 'JuegoEmpresasInvolucradas', as: 'juegos' });

Juego.belongsToMany(MotorJuego, { through: 'JuegoMotoresDeJuego', as: 'motoresJuego' });
MotorJuego.belongsToMany(Juego, { through: 'JuegoMotoresDeJuego', as: 'juegos' });
