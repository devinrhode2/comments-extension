(function injectJSStrict(){
'use strict';
log(appName + ' inject.js');

if (typeof shown === 'undefined') {
  //this if branch only executes once. Yes, shown is still defined over multiple script injections
  window.shown = true;
  window.html = document.documentElement;
  window.body = document.body;
  
  window.adjustHtmlMargin = function addHtmlMargin(adjustment){
    var currentRight = parseFloat(getComputedStyle(html).marginRight);
    html.style.marginRight = (currentRight + adjustment + 20) + 'px';
  };
  
  //450 width because things start overflowing poorly at smaller widths...
  //facebook designed this at a 450px width
  window.width = 40	0;
  
  //used to flip from display: none and display: block
  window.styleFlip = $.createElement('style', {
    innerHTML: '#' + appName + ' { display: block; } '
  });
  html.appendChild(styleFlip);
  
  var cleanedUrl = cleanUrl(location.href);
  
  adjustHtmlMargin(width);
  var comments = $.createElement('div', {
    className: 'fb-comments',
    id: appName
   }, {
    style: '\
      overflow: auto;\
      padding: 10px;\
      white-space: nowrap;\
      position:fixed;\
      right: 0px;\
      top: 0px;\
      z-index:2147483647;\
      -webkit-user-select: none;\
      height: 100%;\
      width: '+width+'px;\
      background: whiteSmoke;\
      border-left: 1px solid #6F6F6F;\
      -webkit-box-shadow: -2px 0px 5px 0px rgba(128, 128, 128, 0.6);\
      margin-top: -1px;',
    'data-href': cleanedUrl,
    //'data-mobile': 'true', ... doesn't seem to fluidly move to less than 450px... facebook...
    'data-num-posts': '13',
    'data-width':     width
  });
  body.appendChild(comments);
  
  var fbRoot = $.id('fb-root');
  if (!fbRoot) {
    body.appendChild($.createElement('div', {id: 'fb-root'}));
  }
  //BOOM
  html.appendChild(
    $.createElement('script', {
      src: 'https://connect.facebook.net/en_US/all.js#xfbml=1&appId=246571968740345',
      id: 'facebook-jssdk'
    })
  );
  html.appendChild($.createElement('script',{
    innerHTML:'if (typeof FB !== "undefined"){FB.XFBML.parse();}console.log("XFBML.parse\'d");'
  }));
} else {//comments already initialized
  if (shown) {
    //hide
    adjustHtmlMargin(-1 * width);//negative, undo width adjustment
    shown = false;
    styleFlip.innerHTML = '#' + appName + ' { display: none; } ';
  } else {
    //show back
    adjustHtmlMargin(width);
    shown = true;
    styleFlip.innerHTML = '#' + appName + ' { display: block; } ';    
  }
}

}());