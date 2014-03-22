
/*
 * GET home page.
 * Aqui deben crear un exports para cada página que llamen desde el router, pueden agregar los datos dinámicos a través de objetos JS
  y pasarlos a la vista con res.render('<vista>', <objeto>)
 */
require('../models/roles');
require('../models/Empleado');
//var dbRol = mongoose.model('Rol');
//var Empleado = mongoose.model('Empleado');

var passport = require('passport');
var Usuario = require('../models/usuario');

module.exports = function(app) {
	
	app.get('/', function(req, res) {
		res.render('index', { usuario : req.user });
	});	
	
	app.post('/login', passport.authenticate('local'), function(req, res) {
		res.redirect('/escritorio');
	});
	
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	app.get('/registro', function(req, res) { // Crear página con formulario para Registrar Usuario nuevo.
      res.render('registro', { });
  	});
	
	app.post('/registro', function(req, res) {
      Usuario.register(new Usuario({ username : req.body.username }), req.body.password, function(err, usuario) {
          if (err) {
            return res.render("registro", {info: "Disculpe, el usuario ya existe. Intente de nuevo."});
          }

          passport.authenticate('local')(req, res, function () {
            res.redirect('/escritorio');
          });
      });
	});

	app.get('/escritorio', function(req, res){
		res.render('escritorio', { usuario : req.user });
	});
	app.get('/escritorioEmpl', function(req, res){
		res.render('escritorioEmpl', {title: 'Empleado escritorio | SIGUCA', usuario : req.user});
	});
	app.get('/escritorioAdmin', function(req, res){
		res.render('escritorioAdmin', {title: 'Administrador escritorio | SIGUCA', usuario : req.user});
	});
	app.get('/graficos', function(req, res){
		res.render('graficos', {title: 'Graficos | SIGUCA', usuario : req.user});
	});
	app.get('/graficoAdmin', function(req, res){
		res.render('graficoAdmin', {title: 'Graficos Administrador | SIGUCA', usuario : req.user});
	});
	app.get('/ayuda', function(req, res){
		res.render('ayuda', {title: 'Ayuda | SIGUCA', usuario : req.user});
	});
	app.get('/configuracion', function(req, res){
		res.render('configuracion',{title: 'Configuración | SIGUCA', usuario : req.user});
	});
	app.get('/confAdmin', function(req, res){
		res.render('confAdmin',{title: 'Configuración Administrador| SIGUCA', usuario : req.user});
	});
	app.get('/justificaciones', function(req, res){
		res.render('justificaciones', {title: 'Justificaciones/Permisos | SIGUCA', usuario : req.user});
	});
	app.get('/justificacionesAdmin', function(req, res){
		res.render('justificacionesAdmin', {title: 'Administrador justificaciones| Permisos', usuario : req.user});
	});
	app.get('/justEmpl', function(req, res){
		res.render('justEmpl', {title: 'Solicitudes/Justificaciones | SIGUCA', usuario : req.user});
	});
	app.get('/justificacion_nueva', function(req, res){
		res.render('justificacion_nueva', {title: 'Nueva Justificacion | SIGUCA', usuario : req.user});
	});
	app.get('/solicitud_extra', function(req, res){
		res.render('solicitud_extra', {title: 'Solicitud Tiempo Extra | SIGUCA', usuario : req.user});
	});
	app.get('/autoriza_extra', function(req, res){
		res.render('autoriza_extra', {title: 'Autorizacion Tiempo Extra | SIGUCA', usuario : req.user});
	});
	app.get('/autoriza_justificacion', function(req, res){
		res.render('autoriza_justificacion', {title: 'Autorizacion Justificacion | SIGUCA', usuario : req.user});
	});
	app.get('/roles', function(req, res){
		res.render('roles', {title: 'SIGUCA - Administración de Roles', rol: req.rol, nombre: req.nombre});
	});
	/*app.post('/roles', function(req, res){
		console.log('Recibimos rol:'+req.body.rol+' y nombre:'+req.body.nombre);
		var newRol = new dbRol (req.body)
		newRol.save(function(err){
			if (err) {
				return res.render('roles', {
					errors: utils.errors(err.errors),
					rol: rol,
					nombre: nombre,
					title: 'SIGUCA - Administración de Roles - Intente nuevamente'
				});
			};
		});
		res.redirect('/');
	}); */
	
	app.get('/dispositivos', function(req, res){
		res.render('dispositivos', {title: 'Dispositivos | SIGUCA', usuario : req.user});
	});	

};

/*

// Crea nuevo Empleado
exports.crea = function(req, res) {
	var empleado = new Empleado(req.body);
	empleado.save(function (err) {
		if (err) {
			return res.render('empleado', {
				errors: utils.errors(err.errors),
				empleado: empleado,
				title: 'Intente el registro de nuevo'
			})
		}
		return res.redirect('/')
	});				
}


								
exports.registra = function (req, res) {
  res.render('empleado', {
    title: 'SIGUCA - Administración de Empleados',
    empleado: new Empleado()
  })
}


// Busca Empleado por Cédula
exports.buscaPorCedula = (function(req, res) {
	Empleado.findOne({cedula: req.params.cedula});
});

// Lista a todos los Empleados
exports.lista = function(req, res) {
	Empleado.find(function(err, empleados) {
		res.send(empleados);
	});
}
exports.indexAng = function (req, res){
  return Empleado.find(function (err, contacts) {
    if (!err) {
      res.jsonp(contacts);    } else {
      console.log(err);
    }
  });
 

  
}

 */