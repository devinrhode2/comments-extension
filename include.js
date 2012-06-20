/* By Devin Rhode (devinrhode2@gmail.com)
 * General library-esque functions!
 *
 * $.class is a wrapper on document.getElementsByClassName
 * $.id is a wrapper on getElementById
 * log('things like', trickyVaribles);
 * fail('When some bad shit occured.');
 *
 * has: Does a string have a certain substring inside it? returns boolean
 */

(function includeJSStrict(){
'use strict';
window.appName = 'fb-comments-sidebar';

window.$ = window.$ || {};
$.class = function getElementsByClassNameWrapper(elements){
  return document.getElementsByClassName(elements);
};
$.id = function getElementById(elements){
  return document.getElementById(elements);
};
$.tag = function getElementsByTagName(elements){
  return document.getElementsByTagName(elements);
};
HTMLElement.prototype.class = HTMLElement.prototype.getElementsByClassName;
HTMLElement.prototype.id = HTMLElement.prototype.getElementById;
HTMLElement.prototype.tag = HTMLElement.prototype.getElementsByTagName;

String.prototype.has = function StringPrototypeHas(string) {
  return this.indexOf(string) > -1;
};

var ajax = {};
ajax.x = function() {
  return new XMLHttpRequest;
};
ajax.send = function(u, f, m, a) {
  var x = ajax.x();
  x.open(m, u, true);
  x.onreadystatechange = function() {
    if(x.readyState == 4) {
      f(x.responseText, x);
    }
  };
  if(m === "POST") {
    x.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  }
  x.send(a)
};
window.POST = function POST(url, func, args) {
  ajax.send(url, func, "POST", args);
};

window.GET = function GET(url, callback){
  ajax.send(url,callback,'GET');
};

window.masterHistory = function masterHistory(){
  //have a master switch on caller.name === 'f' (log) || 'warn' || 'fail' || 'error'
};

window.kmpush = function kmpush(){
  if (typeof _kmq === 'undefined') {
    window._kmq = [];
  }
  var argsArray = [].slice.call(arguments);
  if (argsArray.length === 1) {
    _kmq.push('record', argsArray[0]);
  } else {
    _kmq.push(argsArray);
  }
};

var storedDebug = localStorage.getItem('debug');
if (storedDebug === null) {
  //default
  localStorage.setItem('debug', 'false');
  window.debug = false;
  //OVERRIDE
  localStorage.setItem('debug', 'true');
  window.debug = true;
} else {
  if (storedDebug === 'true') {
    window.debug = true;  
  } else if (storedDebug === 'false') {
    window.debug = false;
  }
}

//from HTML5 boilerplate. Paul Irish is awesome. I have no idea why the function name is f...
window.log = function f() {
  masterHistory(arguments);
  if (debug) {
    if (console) { // with if (this.console) I was getting "Uncaught TypeError: Cannot read property 'console' of undefined"
      var args = arguments;
      var newarr;
  
      try {
          args.callee = f.caller;
      } catch(e) {
  
      }
  
      newarr = [].slice.call(args);
  
      if (typeof console.log === 'object') {
          log.apply.call(console.log, console, newarr);
      } else {
          console.log.apply(console, newarr);
      }
    }
  }
};
//fail, program cannot continue. Alert a message, and kill it
window.fail = function fail(message){
  masterHistory(arguments);
  alert(appName + ': ' + message);
  throw appName + ': ' + message;
};

//Some common pitfall that is handled. Application will continue fine.
window.warn = function warn(message){
  masterHistory(arguments);
  debug && console.warn(message);
  return message;
};
//some error where the program will continue, but this scenario really shouldn't be occuring
window.error = function error(message){
  masterHistory(arguments);
  debug && console.error(message);
  return message;
};

//coolest method ever!
$.createElement = function createElement(element, props, attributes) {
  var element = document.createElement(element);
  for (var prop in props) {
    element[prop] = props[prop];
  }
  for (var attr in attributes) {
    element.setAttribute(attr, attributes[attr]);
  }
  return element;
};


//just for this extension
window.cleanUrl = function cleanUrl(cleanedUrl){
  ['index.php', 'index.html', '?', '#'].forEach(function(start){
    var startindex = cleanedUrl.indexOf(start);
    if (startindex > 10) {
      if (start === '#' && cleanedUrl.has('twitter.com/')) {
        return;
      }
      cleanedUrl = cleanedUrl.substring(0, startindex);
      var prevCleanedUrl = cleanedUrl;
      
      //add back videoID for youtube.com... sure many other websites will have critical params for pages.
      if (start === '?') {
        var criticalParams = {
          '://www.youtube.com/': ['v'] //add more critical params for domains here.......
        };
        for (var domain in criticalParams) {
          if (cleanedUrl.has(domain)) {
            criticalParams[domain].forEach(function criticalParamsForEach(param){
              var paramStart = location.href.indexOf('?' + param + '=');
              var paramValue = false;
              var question = false;
              if (paramStart > 10) {
                question = true;
                paramValue = location.href.substring(paramStart + param.length + 2, paramStart + param.length + 2 + 11);
              } else {
                question = false;
                paramStart = location.href.indexOf('&' + param + '=');
                if (paramStart > 10) {
                  paramValue = location.href.substring(paramStart + param.length + 2, paramStart + param.length + 2 + 11);
                }
              }
              if (paramValue) {
                if (question) {
                  cleanedUrl = cleanedUrl + '?' + param + '=' + paramValue;
                } else {
                  cleanedUrl = cleanedUrl + '&' + param + '=' + paramValue;
                }
              }
            });
          }
        }
      }
    }
  });
  return cleanedUrl;
};


}());