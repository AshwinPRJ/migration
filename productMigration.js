var chai = require("chai");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var Promise = require('bluebird');
var logger = require("log4js").getLogger();
const urlMap = {
	'product_migration' : '/productMigration'
};

//require the csvtojson converter class 
var Converter = require("csvtojson").Converter;
var fs = require('fs');
var converter = new Converter({});
var output = [];
//converting csv file
converter.fromFile("product_stock.csv",function(err,result){   
    if(err){
        console.log("An Error Has Occurred");
        console.log(err);  
    }     	
	var array = result;	
	var products = [];
	
	array.forEach(function(i){	
		var PM = {};	
		PM.product_code = i.product_code;
		PM.dateof_mixing = i.dateof_mixing;
		PM.production_lotNo = i.production_lotNo;
		PM.co_ords = i.co_ords;
		PM.product_qty = Number(i.product_qty);
		PM.expiry_date = i.expiry_date;
		products.push(PM);
	})
	var promises = products.map(function(product){		
		return postRequest('product_migration',product);
	})
	
	Promise.all(promises)
		.then(function(result){
			console.log(result);
		})
		.catch(function(Err){
			console.log(Err);
		})	
	 
});


//Post request
function postRequest(urlKey, payload) {
  //return chai.request("http://192.168.1.40:8008/api")
  return chai.request("http://52.230.12.142:8088/api")
    .post(urlMap[urlKey])
    .send(payload)
    .then(function(res) {
      return res.body;
    }).catch(function(e) {
      if (e.response && e.response.body)
        return e.response.body;
      else
        throw e;
    });
}
