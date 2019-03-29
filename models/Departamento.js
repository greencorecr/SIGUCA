/** SIGUCA
 *
 * Modelo de Departamento
 *
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

 //Crear el esquema de Departamento
var SchemaDepartamento = new Schema({
    nombre: {
        type: String,
        default: ''
    },
    departamentoSupervisor: {
        type: Schema.ObjectId,
        ref: 'Departamento'
    }
});

module.exports = mongoose.model('Departamento', SchemaDepartamento);
