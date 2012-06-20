'use strict';
kmpush('background load');
log(appName + ' background.js');
if (localStorage.getItem('installed') !== 'installed') {
  localStorage.setItem('installed', 'installed');
  chrome.tabs.create({
    'url': chrome.extension.getURL('welcome.html')
  });
}

//if some tab loads and the url has '?fb_comment_id=fbc_' in it, load the comments sidebar
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
  if (details.url.has('?fb_comment_id=fbc_')) {
    browserActionOnClicked({
      url: details.url,
      id: details.tabId
    });
  }
});

window.needUpdate = false;
GET('../manifest.json', function manifestGET(manifest){
  manifest = JSON.parse(manifest);
  var version = manifest.version;
  GET('http://thescoutapp.com/extension/fb-comments-sidebar-version.json', function versionCheckCallback(version){
    if (parseFloat(version) > version) {
      window.needUpdate = true;
    } else {
      window.needUpdate = false;
      log('up to date!');      
    }
  });
});

var browserActionOnClicked = function browserActionOnClicked(tab) {
  if (!tab.url) {
    return 'falsy url';
  }
  if (false/*tab.url.indexOf('://') !== 0*/) {
    return 'non-webpage tab sent to browserActionOnClicked';
  } else {
    if (tab.url.has('://chrome.google.com/webstore')) {
      if (confirm('Google blocks extensions from working on the WebStore. '+
                  'Press OK to send a complaint to Google.')                ) {
        chrome.tabs.create({
          'url': 'http://support.google.com/chrome_webstore/bin/request.py?contact_type=cws_user_contact'
        });
      }
    } else {
      if (needUpdate) {
        chrome.tabs.executeScript(tab.id, {
          'code': 'alert("Press Ok to update facebook comments sidebar");'
          }, function needUpdateCallback(){
          chrome.tabs.create({
            'url': 'https://chrome.google.com/webstore/detail/...'
          });
        });
      }
      kmpush('loaded comments');
      var tabLabel = 'execution time for: ' + tab.url;
      console.time(tabLabel);
      chrome.tabs.executeScript(tab.id, {'file': 'include.js'}, function(){
        chrome.tabs.executeScript(tab.id, {'file': 'inject.js'}, function(){
          chrome.tabs.executeScript(tab.id, {'file': 'kiss-include.js'}, function(){
            console.timeEnd(tabLabel);
          });
        });
      });
    }
  }
};
chrome.browserAction.onClicked.addListener(browserActionOnClicked);

window.cache = {};

var updateCommentCount = function updateCommentCount(number, tabId) {
  if (number === 0) {
    chrome.browserAction.setBadgeBackgroundColor({
      tabId: tabId,
      'color': '#D2D9E7'//<--dull gray. good black: #666
    });
  } else {
    chrome.browserAction.setBadgeBackgroundColor({
      tabId: tabId,
      'color': '#C45D4F'//<--that's a 50% saturation of the fb red: #F03D25
    });
  }
  chrome.browserAction.setBadgeText({'text': number.toString(), tabId: tabId});
};

var newTab = function newTab(tabId, url) {
  //if in cache, return immediately!
  if (!url) {
    updateCommentCount(0, tabId);
    return 'falsy url';
  }
  
  //clean url...
  url = cleanUrl(url);
  
  if (typeof cache[url] !== 'undefined') {
    updateCommentCount(cache[url].comments);
  } else {
    if (url.indexOf('http') !== 0) {
      updateCommentCount(0, tabId);
      return 'newTab non-webpage: ' + url;
    }
    GET('https://graph.facebook.com/?ids=' + url, function CommentsGetCallback(resp){
      var resp = JSON.parse(resp);
      log('fb json for: '+url+':\n', resp);
      if (!resp[url]) {
        var respKeys = Object.keys(resp);
        if (respKeys) {
          url = respKeys[0];
          if (respKeys.length !== 1) {
            if (respKeys.length !== 0) {
            
            } else {
              //alert('facebook gave us multi key JSON:' + JSON.stringify(respKeys));
              console.error(
                '*** FACEBOOK RETURNED MULTI-KEY JSON, CONDITION IS NOT EXPECTED OR HANDLED ***\n',
                respKeys,
                '\n' + respKeys.length
              );
            }
          }
        }
      }
      cache[url] = resp[url];
      if (cache[url] && !cache[url].comments) {
        cache[url].comments = 0;
      }
      if (!cache[url].comments) {
        cache[url].comments = 0;
      }
      updateCommentCount(cache[url].comments, tabId);
    });
  }
};

//update comment count on tabs
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo && typeof changeInfo.url !== 'undefined' && changeInfo.url.length > 0) {
    newTab(tab.id, changeInfo.url);
  }
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab){
    newTab(tab.id, tab.url);
  });
});

//update comment count on current active tabs. only relevant when developing or when an update occurs.
chrome.tabs.query({active: true}, function queryCallback(tabs){
  var length = tabs.length;
  for (var i = 0; i < length; i++) {
    newTab(tabs[i].id, tabs[i].url);
  }
});
