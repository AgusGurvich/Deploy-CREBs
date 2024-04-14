import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pool } from '../db.js';
import helpers from '../lib/helpers.js';
import session from 'express-session';

// LOGIN
    passport.use('local.signin', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done)=> {
        const DNI = username;
        const userQuery = 'SELECT * FROM users WHERE DNI = ?';
        const result = await pool.query(userQuery, [DNI]);
        
        if(result.length > 0) {
            const user = result[0][0];
            const bandera = await helpers.matchPasswordLogin(password, user.password);
            if(bandera) {
               return done(null, user, req.flash('success', 'Bienvenido' + user.nombre));
            }
            else {
                console.log('error de contraseña');
                done(null, false, req.flash('failure', 'Contraseña Incorrecta'));
                
            }
        } else {
            console.log('error de usuario');
            return done(null, false, req.flash('failure', 'Tu DNI no está registrado'));
            
        }
        
    })); 


// SIGN IN
passport.use('local.signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done)=> {


        // Comprobaciones

        if(!req.body.username || !req.body.email || !req.body.password || !req.body.confirm || !req.body.DNI || ! req.body.Nombre ) {
            return done(null, false, req.flash('failure', 'Faltan llenar campos'));
        } else {
            const usernameQuery = 'SELECT * FROM users WHERE username = ?';
            const usernameResult = await pool.query(usernameQuery, req.body.username);
            if(usernameResult[0].length > 0) {
                return done(null, false, req.flash('failure', 'Ese nombre de usuario ya está en uso'));
            } else {
                const DNIQuery = 'SELECT * FROM users WHERE DNI = ?';
                const DNIResult = await pool.query(DNIQuery, req.body.DNI);
                if(DNIResult[0].length > 0) {
                    return done(null, false, req.flash('failure', 'Ese DNI de usuario ya está en uso'));
                } else {

                    const { email, confirm, Nombre, DNI} = req.body;
                    const licencia = 1;
                    const ahora = new Date();
                    const ingreso = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
                
                    const correctPassword = await helpers.encryptPassword(password);
                
                    const insertQuery = "INSERT INTO users (nombre, email, username, password, ingreso, licencia, DNI) VALUES (?, ?, ?, ?, ?, ?, ?);";
                    const result = await pool.query(insertQuery, [Nombre, email, username, correctPassword, ingreso, licencia, DNI], (err, result) => {
                        if (err) { 
                            console.error('Error al insertar datos en la base de datos:', err);
                            res.status(500).send('Error interno del servidor'); 
                            return;
                          }
                          console.log('Usuario Creado correctamente.');
                    });
                
                    const newUser = {
                        username,
                        Nombre,
                        email,
                        correctPassword,
                        ingreso,
                        licencia, 
                        DNI
                    }
                    newUser.id = result[0].insertId;
                    return done(null, newUser) // No ha habido ningun error y pasamos el newUser para serializarlo.
            }}}

}));

// SIGN IN BECARIO
passport.use('local.signupBecario', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done)=> {

      // Comprobaciones

      if(!req.body.username || !req.body.email || !req.body.password || !req.body.confirm || !req.body.DNI || ! req.body.Nombre) {
        return done(null, false, req.flash('failure', 'Faltan llenar campos'));
    } else {
        const usernameQuery = 'SELECT * FROM users WHERE username = ?';
        const usernameResult = await pool.query(usernameQuery, req.body.username);
        if(usernameResult[0].length > 0) {
            return done(null, false, req.flash('failure', 'Ese nombre de usuario ya está en uso'));
        } else {
            const DNIQuery = 'SELECT * FROM users WHERE DNI = ?';
            const DNIResult = await pool.query(usernameQuery, req.body.username);
            if(DNIResult[0].length > 0) {
                return done(null, false, req.flash('failure', 'Ese DNI de usuario ya está en uso'));
            } else {

                const { email, confirm, Nombre, DNI} = req.body;
                const licencia = 2;
                const ahora = new Date();
                const ingreso = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
            
                const correctPassword = await helpers.encryptPassword(password);
            
                const insertQuery = "INSERT INTO users (nombre, email, username, password, ingreso, licencia, DNI) VALUES (?, ?, ?, ?, ?, ?, ?);";
                const result = await pool.query(insertQuery, [Nombre, email, username, correctPassword, ingreso, licencia, DNI], (err, result) => {
                    if (err) { 
                        console.error('Error al insertar datos en la base de datos:', err);
                        res.status(500).send('Error interno del servidor'); 
                        return;
                      }
                      console.log('Usuario Creado correctamente.');
                });
            
                const newUser = {
                    username,
                    Nombre,
                    email,
                    correctPassword,
                    ingreso,
                    licencia, 
                    DNI
                }
                newUser.id = result[0].insertId;
                
                return done(null, newUser) // No ha habido ningun error y pasamos el newUser para serializarlo.

        }}}
}));




passport.serializeUser((user, done) => {
    
    done(null, user.id); 
});

passport.deserializeUser( async (id , done)  =>{
    const checkQuery = 'SELECT * FROM users WHERE id = ?';
    const result = await pool.query(checkQuery, [id]);
    
    const user = result[0][0]; 
    done(null, user);
});




