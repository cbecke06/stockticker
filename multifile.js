const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://clairesatlas:webprogramming@cluster0.pb2trzw.mongodb.net/?retryWrites=true&w=majority";

var http = require('http');
var fs = require('fs');
var qs = require('querystring');

const client =new MongoClient(url,{ useUnifiedTopology: true });
http.createServer(async function (req, res) 
  {
	  if (req.url == "/")
	  {
		  file = 'formpage.html';
		  fs.readFile(file, function(err, txt) {
    	  res.writeHead(200, {'Content-Type': 'text/html'});
		  res.write("This is the home page<br>");
          res.write(txt);
          res.end();
		  });
	  }
	  else if (req.url == "/process")
	  {
		 res.writeHead(200, {'Content-Type':'text/html'});
		 pdata = "";
		 req.on('data', data => {
           pdata += data.toString();
         });

		// when complete POST data is received
		req.on('end', () => {
			pdata = qs.parse(pdata);
		});
    
    	try {
    		await client.connect();
    		var dbo = client.db("stockticker");
    		var collection = dbo.collection('equities');
    		const options = {
    		   projection: { _id: 0, Company: 1, Ticker: 1 },
    		};
            
    		const curs = collection.find({},options);
    		// print a message if no documents were found
    		if ((curs.count()) === 0) {
    		  console.log("No documents found!");
    		}
    		//await curs.forEach(console.dir);
    		 await curs.forEach(function(item){
                  if(pdata['type'] == 'cname'){
                      if(item.Company == pdata['the_name']){
                          let str = JSON.stringify(item);
                          let string1 = str.replace(/["]+/g, '');
                          let string2= string1.replace(/[{}]/g, "");
                          let string3 = string2.replace(/,/g, '  ');
                          res.write(string3 + "<br />");
                          console.log(item);
                      }
                  } else {
                      if(item.Ticker == pdata['the_name']){
                          let str = JSON.stringify(item);
                          let string1 = str.replace(/["]+/g, '');
                          let string2= string1.replace(/[{}]/g, "");
                          let string3 = string2.replace(/,/g, '  ');
                          res.write(string3 + "<br />");
                          console.log(item);
                      }
                  }
    		  });
    	  }  // end try 
    	  catch(err) {
    		  console.log("Database error: " + err);
    	  }
    	  finally {
    		await client.close();
    	  }
          res.end();
	  }
	  else 
	  {
		  res.writeHead(200, {'Content-Type':'text/html'});
		  res.write ("Unknown page request");
          res.end();
	  }
  

}).listen(8080);