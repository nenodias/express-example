//Instalar o npm install nodemon -g, para ele atualizar o servidor quando houver alterações
var express = require('express');//var app =  require('express')(); pode ser dessa forma
var app = express();
var request = require('request');

var orm = require('orm');

app.use(orm.express("sqlite://banco.db", {
    define: function (db, models, next) {
    	var Person = db.define('person', {
		  id:      {type: 'serial', key: true}, // the auto-incrementing primary key
		  name:    {type: 'text'},
		  surname: {type: 'text'},
		  age:     {type: 'number'}
		}, {
		  methods : {
		    fullName: function() {
		      return this.name + ' ' + this.surname;
		    }
		  }
		});
        models.person = Person;
        next();
    }
}));


var swig  = require('swig');


//Swig Template Configuration
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//use aceita todos os métodos http
app.use('/cidade/:cep',function(req, res){
	var cep = req.params.cep;
	request('http://viacep.com.br/ws/'+cep+'/json/',function(erro, resposta, json){
		if( !erro && resposta.statusCode == 200){
			req.models.person.find({id:1},function(err, result){
				console.log( result[0].name );
			});
			var dados = JSON.parse(json);
			if( dados.erro !== true ){
				res.render('index', { "mensagem":dados.localidade });
			}else{
				// Tratando erro com CEP 18680000
				res.send('<h1>Cep não encontrado</h1>');
			}
		}else{
			res.send('<h1>Cep não encontrado</h1>');
		}
	});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});