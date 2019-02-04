
var mongoose 		= require('mongoose'),
nodemailer 		= require('nodemailer'),
moment 			= require('moment'),
Solicitudes 	= require('../models/Solicitudes'),
Articulo51 	= require('../models/Articulo51'),
Usuario 		= require('../models/Usuario'),
Correo		= require('../models/Correo'),
util 			= require('../util/util'),
config          = require('../config.json'),
emailSIGUCA 	= 'siguca@greencore.co.cr';

exports.get = function(query, cb){
	Solicitudes.find(query, function(error, solicitudes){
		cb(error, solicitudes);
	});
}
//--------------------------------------------------------------------
//		Métodos Solicitudes Extras   
//---------------------------------------------------------------------
exports.addExtra = function(extra, cb){

	var epochTime = moment().unix(),
	epochInicio = moment(extra.epochInicio,"DD/MM/YYYY HH:mm").unix(),
	epochTermino = moment(extra.epochTermino,"DD/MM/YYYY HH:mm").unix(),
	cantHoras = (epochTermino - epochInicio);
	if(cantHoras/3600>24 || cantHoras/3600<0)
		return cb("Cantidad de horas inválidas");
	var newSolicitud = Solicitudes({
		fechaCreada: epochTime,
		tipoSolicitudes: "Extras",
		diaInicio: extra.epochInicio,
		diaFinal: extra.epochTermino,
		epochInicio: epochInicio,
		epochTermino: epochTermino,
		cantidadHoras: cantHoras,
		cliente: extra.cliente,
		motivo: extra.motivo,
		usuario: extra.id,
		comentarioSupervisor: ""
	});

	Solicitudes.find({usuario: newSolicitud.usuario, fechaCreada: newSolicitud.fechaCreada}, function (err, soli){
		if(soli.length == 0){
			newSolicitud.save(function (err, user) {
				if (err) console.log(err);
				else return cb("Guardado correctamente.");
				});//save
		}
		});//verificar
}

exports.updateExtra = function(extra, cb, idUser){
	var epochTime = moment().unix(),
	epochInicio = moment(extra.epochInicio,"DD/MM/YYYY HH:mm").unix(),
	epochTermino = moment(extra.epochTermino,"DD/MM/YYYY HH:mm").unix(),
	cantHoras = epochTermino - epochInicio;

	var solicitudActualizada = {
		fechaCreada: epochTime,
		diaInicio: extra.epochInicio,
		diaFinal: extra.epochTermino,
		epochInicio: epochInicio,
		epochTermino: epochTermino,
		cantidadHoras: cantHoras,
		cliente: extra.cliente,
		motivo: extra.motivo
	};
	Solicitudes.findById(extra.id).exec(function (err, soli) { 
		Solicitudes.findByIdAndUpdate(extra.id, solicitudActualizada).populate('usuario').exec(function (err, solicitud) { 
			if (!err) {
				Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : solicitud.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) { 
					if (err) return cb(err);

					Correo.find({},function(errorCritico,listaCorreos){
						if(!errorCritico &&listaCorreos.length>0){
							var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
							for (var i = 0; i < supervisor.length; i++) {
								transporter.sendMail({
									from:listaCorreos[0].nombreCorreo,
									to: supervisor[i].email,
									subject: 'Modificación de una solicitud de hora extraordiaria en SIGUCA',
									text: " El usuario " + solicitud.usuario.nombre + " " + solicitud.usuario.apellido1 + " " + solicitud.usuario.apellido2
									+ " ha modificado la siguiente solicitud de hora extraordiaria: "
									+ "\r\n Día de Inicio: " + soli.diaInicio 
									+ "\r\n Día de termino: " + soli.diaFinal 
									+ "\r\n Motivo: " + soli.motivo
									+ "\r\n Detalle: " + soli.detalle
									+ "\r\n\r\n A continuación se muestra la solicitud de hora extraordiaria modificada "
									+ "\r\n Día de Inicio: " + solicitudActualizada.diaInicio 
									+ "\r\n Día de termino: " + solicitudActualizada.diaFinal 
									+ "\r\n Motivo: " + solicitudActualizada.motivo
									+ "\r\n Detalle: " + solicitudActualizada.detalle
								});
								//
							}
						}
					});
					
				});
				//
			}
			return cb(err);
		});
		//
	});
	//
	//}
}

//--------------------------------------------------------------------
//Métodos Solicitudes de Permisos   
//--------------------------------------------------------------------
exports.addPermiso = function(permiso, cb, idUser){
	var epochTime = moment().unix(); 

	var newSolicitud = Solicitudes({
		fechaCreada: epochTime,
		tipoSolicitudes: "Permisos",
		diaInicio: permiso.diaInicio,
		diaFinal: permiso.diaFinal,
		cantidadDias: permiso.cantidadDias,
		detalle: permiso.detalle,
		usuario: permiso.usuario.id,
		comentarioSupervisor: "",
		inciso: permiso.inciso
	});
	if (permiso.motivo == 'articulo') {
		var validInsert = 0;
		if (permiso.inciso == "incisoA") {
			if (permiso.cantidadDias <= 5) {
				validInsert = 1;
				articuloFunction(permiso, function (err, msj) {
					if (err) res.json(err);
					//else return cb();
				});
			} else {
				console.log("No puede ingresar incisoA debido que la cantidad maxima a solicitar son 5 dias");
			}
		} else if (permiso.inciso == "incisoB") {
			if (permiso.cantidadDias == 1) {
				validInsert = 1;
				articuloFunction(permiso, function (err, msj) {
					if (err) res.json(err);
				});
			} else {
				console.log("No puede ingresar incisoB cantidad maxima a solicitar es 1");
			}
		} else if (permiso.inciso == "incisoC") {
			if (permiso.cantidadDias == 1) {
				var fecha = new Date();
				var ayer = new Date();
				ayer.setDate(ayer.getDate() - 1);
				console.log("ayer" + ayer);
				var anno = fecha.getFullYear();
				console.log("ANNO ACTUAL" + anno);
				var fechaInicio = anno +'/01/01';
				var fechaLimite = anno +'/31/12';

				Solicitudes.find({usuario: permiso.usuario.id, "inciso": "incisoC"}).exec(function (err, quantity) {
					var size = quantity.length;
					console.log("cantidad de incisos C" + size);
					if(size <= 3){
						articuloFunction(permiso, function (err, msj) {
							if (err) res.json(err);
							//else return cb();
						});
					}else{
						console.log("No puede ingresar incisoC debido a que ya ha solicitado mas de 3 en este anno");
					}
				});
			}else {
				console.log("No puede ingresar incisoB cantidad maxima a solicitar es 1");
			}
		}
	}else {
		if (permiso.motivo == 'otro')
			newSolicitud.motivo = permiso.motivoOtro;
		else
			newSolicitud.motivo = permiso.motivo;
		Solicitudes.find({
			usuario: newSolicitud.usuario,
			fechaCreada: newSolicitud.fechaCreada
		}).populate('usuario').exec(function (err, solicitud) {
			if (solicitud.length == 0) {
				console.log(newSolicitud);
				newSolicitud.save(function (err, soli) {
					Usuario.find({
						'tipo': 'Supervisor',
						'departamentos.departamento': permiso.usuario.departamentos[0].departamento
					}, {'email': 1}).exec(function (err, supervisor) {
						if (err) console.log(err);
						Correo.find({}, function (errorCritico, listaCorreos) {
							if (!errorCritico && listaCorreos.length > 0) {
								var transporter = nodemailer.createTransport('smtps://' + listaCorreos[0].nombreCorreo + ':' + listaCorreos[0].password + '@' + listaCorreos[0].dominioCorreo);
								for (var i = 0; i < supervisor.length; i++) {

									transporter.sendMail({
										from: listaCorreos[0].nombreCorreo,
										to: supervisor[i].email,
										subject: 'Nueva solicitud de permiso anticipado en SIGUCA',
										text: " El usuario " + permiso.usuario.nombre + " " + permiso.usuario.apellido1 + " " + permiso.usuario.apellido2 + " ha enviado el siguiente permiso anticipado: "
											+ "\r\n Día de Inicio: " + soli.diaInicio
											+ "\r\n Día de termino: " + soli.diaFinal
											+ "\r\n Motivo: " + soli.motivo
											+ "\r\n Detalle: " + soli.detalle
									});
								}
							}
						});
						//return cb();
					});//supervisores
				});//save
			}
		});//verificar
	}
	return cb();
}

articuloFunction = function(permiso, cb){
	var epochTime = moment().unix();

	console.log("ESTA INSERTANDO DESDE EL OTRO METODO" );

	var newSolicitud = Solicitudes({
		fechaCreada: epochTime,
		tipoSolicitudes: "Permisos",
		diaInicio: permiso.diaInicio,
		diaFinal: permiso.diaFinal,
		cantidadDias: permiso.cantidadDias,
		detalle: permiso.detalle,
		usuario: permiso.usuario.id,
		comentarioSupervisor: "",
		inciso: permiso.inciso
	});
	if(permiso.motivo == 'otro')
		newSolicitud.motivo = permiso.motivoOtro;
	else
		newSolicitud.motivo = permiso.motivo;
	Solicitudes.find({usuario: newSolicitud.usuario, fechaCreada: newSolicitud.fechaCreada}).populate('usuario').exec(function (err, solicitud){
		if(solicitud.length == 0){
			console.log(newSolicitud);
			newSolicitud.save(function (err, soli) {
				Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : permiso.usuario.departamentos[0].departamento}, {'email' : 1}).exec(function (err, supervisor) {
					if (err) console.log(err);
					Correo.find({},function(errorCritico,listaCorreos){
						if(!errorCritico &&listaCorreos.length>0){
							var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
							for (var i = 0; i < supervisor.length; i++) {

								transporter.sendMail({
									from: listaCorreos[0].nombreCorreo,
									to: supervisor[i].email,
									subject: 'Nueva solicitud de permiso anticipado en SIGUCA',
									text: " El usuario " + permiso.usuario.nombre + " " + permiso.usuario.apellido1 + " " + permiso.usuario.apellido2 + " ha enviado el siguiente permiso anticipado: "
										+ "\r\n Día de Inicio: " + soli.diaInicio
										+ "\r\n Día de termino: " + soli.diaFinal
										+ "\r\n Motivo: " + soli.motivo
										+ "\r\n Detalle: " + soli.detalle
								});
							}
						}
					});
					return cb();
				});//supervisores
			});//save
			if (permiso.motivo == 'articulo'){
				var nuevaSolicitudArticulo51;
				console.log(permiso.inciso);
				console.log(permiso.derechoDisfrutar);
				nuevaSolicitudArticulo51 = Articulo51({
					solicitud: newSolicitud._id,
					tipoSolicitud:  permiso.derechoDisfrutar,
					inciso: permiso.inciso,
					usuario: permiso.usuario.id
				});
				console.log(nuevaSolicitudArticulo51);
				nuevaSolicitudArticulo51.save(function (err, soli) {
					if (err) console.log(err);
				});
			}
		}

	});//verificar
}

exports.updatePermiso = function(permiso, cb, idUser){
	console.log("adfa");
	var epochTime = moment().unix();

	var solicitudActualizada = {
		fechaCreada: epochTime,
		diaInicio: permiso.diaInicio,
		diaFinal: permiso.diaFinal,
		cantidadDias: permiso.cantidadDias,
		detalle: permiso.detalle
	};
	if(permiso.motivo == 'otro')
		solicitudActualizada.motivo = permiso.motivoOtro;
	else
		solicitudActualizada.motivo = permiso.motivo;

	Solicitudes.findById(permiso.id).exec(function (err, soli) { 
		Solicitudes.findByIdAndUpdate(permiso.id, solicitudActualizada).populate('usuario').exec(function (err, solicitud) { 
			if(!err) {
				Usuario.find({'tipo' : 'Supervisor', 'departamentos.departamento' : solicitud.usuario.departamentos[0].departamento}, {'email' : 1}
					).exec(function (err, supervisor) { 
						if (!err) {
							Correo.find({},function(errorCritico,listaCorreos){
								if(!errorCritico &&listaCorreos.length>0){
									var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
									for (var i = 0; i < supervisor.length; i++) {
										transporter.sendMail({
											from: listaCorreos[0].nombreCorreo,
											to: supervisor[i].email,
											subject: 'Modificación de una solicitud de permiso anticipado en SIGUCA',
											text: " El usuario " + solicitud.usuario.nombre + " " + solicitud.usuario.apellido1 + " " + solicitud.usuario.apellido2 
											+ " ha modificado el siguiente permiso anticipado: " 
											+ "\r\n Día de Inicio: " + soli.diaInicio 
											+ "\r\n Día de termino: " + soli.diaFinal 
											+ "\r\n Motivo: " + soli.motivo
											+ "\r\n Detalle: " + soli.detalle
											+ "\r\n\r\n A continuación se muestra el permiso anticipado modificado " 
											+ "\r\n Día de Inicio: " + solicitudActualizada.diaInicio 
											+ "\r\n Día de termino: " + solicitudActualizada.diaFinal 
											+ "\r\n Motivo: " + solicitudActualizada.motivo
											+ "\r\n Detalle: " + solicitudActualizada.detalle
										});
									}
								}
							});
							
						}
					});
}
return cb();
});
});
}

//--------------------------------------------------------------------
//Métodos Solicitudes    
//---------------------------------------------------------------------*/
exports.loadSoli = function(id, cb){
	Solicitudes.findById(id, function (err, soli) { 
		if(soli.estado == 'Pendiente'){
			Solicitudes.findById(id, function (err, solicitud) { 
				if (err) return cb(err);
				cb(solicitud);
			}); 
		} else cb({motivo:'seleccionar',detalle:''});
	}); 
}

exports.deleteSoli = function(id, cb, idUser){
	Solicitudes.findByIdAndRemove(id).populate('usuario').exec(function (err, soli) { 
		if (err) return cb(err,'');
		var fecha = "";
		if(soli.fechaCreada)
			fecha = moment(soli.fechaCreada);

		Correo.find({},function(errorCritico,listaCorreos){
			if(!errorCritico &&listaCorreos.length>0){
				var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
				if(soli.tipoSolicitudes == 'Extras'){
					transporter.sendMail({
						from: listaCorreos[0].nombreCorreo,
						to: soli.usuario.email,
						subject: 'Se ha eliminado una solicitud de hora extraordiaria en SIGUCA',
						text: " Estimado(a) " + soli.usuario.nombre + " " + soli.usuario.apellido1 + " " + soli.usuario.apellido2
						+ " \r\n Su supervisor ha eliminado una de las solicitudes de hora extraordiaria presentadas, en la cuál se indicabá lo siguiente: " 
						+ " \r\n Fecha de creación: " + fecha
						+ " \r\n Día Inicio: " + soli.diaInicio
						+ " \r\n Hora Inicio: " + soli.horaInicio
						+ " \r\n Hora Final: " + soli.horaFinal
						+ " \r\n Cantidad de horas: " + soli.cantidadHoras
						+ " \r\n Cliente: " + soli.cliente
						+ " \r\n Motivo: " + soli.motivo
						+ " \r\n Estado: " + soli.estado
						+ " \r\n Comentario supervisor: " + soli.comentarioSupervisor
					});
				} else {
					transporter.sendMail({
						from: listaCorreos[0].nombreCorreo,
						to: soli.usuario.email,
						subject: 'Se ha eliminado una solicitud de permiso anticipado en SIGUCA',
						text: " Estimado(a) " + soli.usuario.nombre + " " + soli.usuario.apellido1 + " " + soli.usuario.apellido2
						+ " \r\n Su supervisor ha eliminado una de las solicitudes de permiso anticipado presentadas, en la cuál se indicabá lo siguiente: " 
						+ " \r\n Fecha de creación: " + fecha
						+ " \r\n Día Inicio: " + soli.diaInicio
						+ " \r\n Día Final: " + soli.diaFinal
						+ " \r\n Cantidad de días: " + soli.cantidadDias
						+ " \r\n Motivo: " + soli.motivo
						+ " \r\n Detalle: " + soli.detalle
						+ " \r\n Estado: " + soli.estado
						+ " \r\n Comentario supervisor: " + soli.comentarioSupervisor
					});
				}
			}
		});

	
		return cb(err,'Se elimino');
	});
}

//--------------------------------------------------------------------
//Gestionar Eventos
//---------------------------------------------------------------------*/
exports.gestionarSoli = function(solicitud, cb, idUser){
	Usuario.findById(idUser, function (errUser, supervisor) { 
		Solicitudes.findByIdAndUpdate(solicitud.id, 
		{
			estado: solicitud.estado, 
			comentarioSupervisor:solicitud.comentarioSupervisor
		}).populate('usuario').exec(function (err, soli) { 

			/*
			 * Actualiza las vacaciones, solo cuando son aceptadas
			 */
			if(solicitud.estado=='Aceptada' && solicitud.motivo == 'Vacaciones'){
				Usuario.update({_id:soli.usuario}, {$inc:{vacaciones:(0-soli.cantidadDias)}},function(err){});
				
			}

			/*
			 * Envía el correo electrónico 
			 */

			if (err) return cb(err, '');
			Correo.find({},function(errorCritico,listaCorreos){
				if(!errorCritico &&listaCorreos.length>0){
					var transporter = nodemailer.createTransport('smtps://'+listaCorreos[0].nombreCorreo+':'+listaCorreos[0].password+'@'+listaCorreos[0].dominioCorreo);
					var a = new Date(soli.fechaCreada * 1000);
					var date = ""+a.getDate()+"/"+util.getMes(a.getMonth())+"/"+a.getFullYear();
					var solitext = "\r\n\r\nFecha de creación:"+date+"\n"
					+ "Motivo:"+soli.motivo+"\n"
					+ "Detalle:"+soli.detalle+"\r\n\r\n";
					var superV = "";
					if(!errUser && supervisor) {
						superV += supervisor.nombre;
						superV += " " + supervisor.apellido1;
						superV += " " + supervisor.apellido2;
					}
					transporter.sendMail({
						from: listaCorreos[0].nombreCorreo,
						to: soli.usuario.email,
						subject: 'Respuesta a solicitud en SIGUCA',
						text: " Estimado(a) " + soli.usuario.nombre 
						+ ",\r\n\r\nPor este medio se le notifica que "
						+"la siguiente solicitud ha sido respondida:"
						+ solitext
						+ "Le informamos que la justificación fue " + solicitud.estado 
						+ " por el supervisor " + superV
						+ ", con el siguiente comentario"
						+ "\r\n\r\n " + solicitud.comentarioSupervisor
						+ "\r\n\r\n Saludos cordiales."
					}, function(error, info){
						if(error){
							return console.log('Error al enviar el correo de la gestión de una solicitud: '+soli.usuario.nombre + " Error: "+error);
						}
						//return console.log('Respuesta de envío de email: ' + JSON.stringify(info));
					});
				}
			});
		
			return cb(err, 'Se elimino');

		});
});
}