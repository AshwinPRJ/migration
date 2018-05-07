var chai = require("chai");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var Promise = require('bluebird');
var logger = require("log4js").getLogger();
//var config = require("../../test_config.js");
//var mongo = require("../../test_hooks");

const urlMap = {
	'ingredient_migration' : '/itemMigration'
};

//require the csvtojson converter class 
var Converter = require("csvtojson").Converter;
var fs = require('fs');
var converter = new Converter({});
var output = [];
//converting csv file
converter.fromFile("ingredient_stock.csv",function(err,result){   
    if(err){//checking for file existing or not
        console.log("An Error Has Occurred");
        console.log(err);  
    }     
	var item = [];
	var array = result;//array data from CSV file 
	var batchIds = findUniqueBatchIds(array)//unique batch_ids
	var batches_array = [];
	batchIds.forEach(function(id){//calling each id from batchIds
		var batch = [];
		array.forEach(function(row){//calling each row from array
			if(row.batch_id == id){//Comparing row_id and getting id
				batch.push(row);//pushing row data to batch
			}
		})
		batches_array.push(batch);//pushing batch data to batches_array
	})

	batches_array.forEach(function(batch){//calling each payload in batches_array
		output.push(createPayLoad(batch));//getting the batch data from createPayLoad function and pushing into output
	})
	
	var promises = output.map(function(item){
		return postRequest('ingredient_migration',item)
	})
	//console.log(promises);
	Promise.all(promises)
		.then(function(result){
			console.log(result);
		})
		.catch(function(Err){
			console.log(Err);
		})	
});
/*
var singlePayLoad = function(output){	
	output.forEach(function(value){	
	if(output[0].batch_id == value.batch_id){
			var item_code = JSON.stringify(value);
			console.log("payload ",item_code)
			return postRequest('ingredient_migration',item_code);
		}
	})
}
*/

var createPayLoad = function(batch){//sending unique batch payload details to createPayLoad function
	var items = [];	
	batch.forEach(function(i){//calling each payload of batch
		var item={};
			item.item_id = i.item_code;//assigning item_code
			item.quantity = Number(i.quantity);//assigning quantity
			item.expiry_date = i.expiry_date;//assigning expiry_date 
			items.push(item);//pushing of item data to items
	});
	var batchId = batch[0].batch_id;//assigning batch_id
	return {"batch_id":batchId,"items":items};//return payload for batch_id and items
}

var findUniqueBatchIds = function(data){//getting entire data
	var batchIds = [];
	data.forEach(function(row){//calling each row payload of data
		if(!exist(batchIds,row.batch_id)){//checking for invalid batch_id
			batchIds.push(row.batch_id);//invalid batch_id push into batchIds[]
		}
	})
	return batchIds;
} 

var exist= function(Ids,id){//checking for existing batchId
	var found = false;
	for (var i =0;i< Ids.length; i++){
		if(Ids[i]===id) return true;
	}
	return false;
}

//Post request
function postRequest(urlKey, payload) {
	
	//console.log(payload)
  return chai.request("http://52.187.132.148:8088/api")
 //return chai.request("http://192.168.1.40:8008/api")
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
