(function globalJS(){
'use strict';
window.appName = 'fb-comments-sidebar';
window._kmk = 'e87e4dbcaaa550b06f2bbdd90fc9b49caae0b9b9';//asynchronous operation. 

storageDefault('debug','true');
//log('debug:', localStorage.getItem('debug'));
window.debug = localStorage.getItem('debug').toBoolean();

//just for this extension
window.cleanUrl = function cleanUrl(cleanedUrl){
  ['index.php', 'index.html', '?', '#'].forEach(function(start){
    var startindex = cleanedUrl.indexOf(start);
    if (startindex > 10) {
      if (start === '#' && cleanedUrl.contains('twitter.com/')) {
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
          if (cleanedUrl.contains(domain)) {
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