const https= require('https');
const axios = require('axios');
const fs= require("fs"),
      path = require('path');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}


function Jsondownload(url) {
  this.url=url;

  this.agent = new https.Agent({
    rejectUnauthorized: false
  });


  this.myEmitter = new MyEmitter();
  this.addresses=[]
  var self=this
  this.myEmitter.on('event',  (a) => {

    if(self.addresses[a]==undefined){
      self.addresses[a]=""
    }else{
      //self.addresses[a]+=1
    }

    console.log(self.addresses);
  });

}

Jsondownload.prototype.getblock = async function(blocknum) {
  self = this;

  console.log("get url "+this.url+"/getblockhash?index="+blocknum)
  const responseaxios = axios(this.url+"/getblockhash?index="+blocknum, { httpsAgent: this.agent });
  const [response] = await Promise.all([responseaxios]).catch(error => {
    throw error + " in "+ this.url
  });

  return this.savejson(response.data, blocknum);
};

Jsondownload.prototype.savejson = async function(hashblock, blocknum) {
  var dir = process.cwd() + '/data/'+blocknum;

  if (!fs.existsSync(process.cwd() + '/data/')) {
      fs.mkdirSync(process.cwd() + '/data/', 0744);
  }


  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0744);
  }

  const agentblocks = axios(this.url+"/getblock?hash="+hashblock, { httpsAgent: this.agent });
  const [responseblocks] = await Promise.all([agentblocks]).catch(error => {
    throw error + " in "+ this.url
  });

  fs.writeFile(dir+"/"+hashblock+".json", JSON.stringify(responseblocks.data) , function(err) {
    if(err) {
        return err;
    }
  });

  for (var i = 0; i < responseblocks.data.tx.length ; i++) {

    console.log(this.url+"/getrawtransaction?txid="+responseblocks.data.tx[i]+"&decrypt=1")
    const agenttx = axios(this.url+"/getrawtransaction?txid="+responseblocks.data.tx[i]+"&decrypt=1", { httpsAgent: this.agent });
    const [responsetx] = await Promise.all([agenttx]).catch(error => {
      throw error + " in "+ this.url
    });

    fs.writeFile(dir+"/tx-"+responseblocks.data.tx[i]+".json", JSON.stringify(responsetx.data) , function(err) {
      if(err) {
          return err;
      }
      console.log(hashblock + " save txs!! ");
    });

  }

  return 1;

};

Jsondownload.prototype.readdata = async function(blocknum) {
  var dir = process.cwd() + '/data/';
  var self = this;

  var addresses = Array();
  fs.readdir(dir+blocknum, (err, files) => {
    self=self
    files.forEach(file => {
      self=self
      var porciones = file.split('-');
      if (porciones[0]=="tx") {

        fs.readFile(dir+blocknum+"/"+file, 'utf8', function(err, contents) {
          self=self
          var jsoncont = JSON.parse(contents)
          try{
            for (var i = 0; i < jsoncont.vout.length; i++) {
              if(jsoncont.vout[i].scriptPubKey.addresses!=undefined){

                for(var a=0; a<jsoncont.vout[i].scriptPubKey.addresses.length; a++){
                    self.myEmitter.emit('event', jsoncont.vout[i].scriptPubKey.addresses[a]);
                }
              }
            }

          }catch(err){}
        });

      }
    });
  })





};

module.exports = Jsondownload;
