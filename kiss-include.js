/* By Devin Rhode (devinrhode2@gmail.com
 * patchs the KissMetrics javascript api to work perfectly and transparently for using everywhere in chrome extensions
 * I also added a aesthetic method, kmpush, which  
 */

var _kmq = _kmq || [];
var _kmk = _kmk || 'b168da9e6287ffbcfe92a883fc3c8c0f904e7972';
var KM_COOKIE_DOMAIN = 'extension.thescoutapp.com';

//a nicer wrapper, instead of _kmq.push(['asdf', 'adf']) it's just kiss('asdf', 'adf')
window.kmpush = function kmpush(){
  var argsArray = [].slice.call(arguments);
  _kmq.push(argsArray);
};

(function kissIncludeJs(){
'use strict';

var portName = 'kissInclude'; //presumably you aren't using this port name. You can just change this if you are though, things won't break.
if (chrome.browserAction) {
  //background page or popup, inject the scripts normally!
  var _kms = function _kms(u){
    setTimeout(function(){
      var d = document, f = d.head,
      s = d.createElement('script');
      s.type = 'text/javascript'; s.async = true; s.src = u;
      f.parentNode.insertBefore(s, f);
    }, 1);
  };
  _kms('https://i.kissmetrics.com/i.js');
  _kms('https://doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');
  
  _kmq.push(function kmqCallbac(){
    console.log('loaded!');
  });
  
  chrome.extension.onConnect.addListener(function(port) {
    if (port.name === portName) {
      port.onMessage.addListener(function(msg) {
        if (msg.bufferedPush) {
          _kmq.push(msg.bufferedPush);
        } else {
          alert('unhandled message to kiss-include.js background receiver: ' + JSON.stringify(msg));
        }
      });
    }
  });

} else {
  //content script, setup api buffer
  var kissmetricsPort = chrome.extension.connect({name: portName});  
  _kmq.push = function _kmqPush(pushedArray){
    if (arguments.length !== 1) {
      console.error('too many arguments, only one is expected. arguments:\n', arguments);
      alert(message);
      throw message;
    }
    kissmetricsPort.postMessage({bufferedPush: pushedArray});
  };
}

//some usage: identify

kmpush('identify', 'devin');
_kmq.push(['identify', 'name@email.com']);
kmpush('record', 'Visited site');
}());