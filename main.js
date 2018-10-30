#!/usr/bin/env node
const Downloader = require('./lib/downloader.js');
var download= new Downloader("https://explorador.petro.gob.ve/api");
var argv = require('minimist')(process.argv.slice(2));

if ((typeof argv.f)=="number") {
  var from=argv.f;
} else {
  var from = 0;
}

if ((typeof argv.t)=="number") {
  var to=argv.t;
} else {
  var to = from+1;
}


for(var i=from ; i<to; i++){
  download.getblock(i).catch(error =>{
    console.log(error)
  })
}
