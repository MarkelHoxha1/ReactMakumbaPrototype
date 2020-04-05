/** this is a very simple hack to make the following statements work from file:// or a non-node local server: 
 * 
 * import ... from 'react'
 * import ... from 'react-dom'
 * import ... from 'someFile.js'
 * import ... from 'someFile.css'
 * import ... from 'someFile' (.js default extension)
 * 
 * JS files are compiled as JSX, except for React.
 * 
TODO: should do caching of exports if a JS file is imported twice.
TODO: uses syncrhonous loading (including synchronous XHR, which is good enough for local development) 
      AMD should be used instead (and configure babel to generate code for that: transform-es2015-modules-amd)
TODO: JSX source mapping does not show in firefox. It works in Chrome though
 */
var exports={};
const require= function(path){
  exports={};
    if(path==='react')
	return React;
    if(path==='react-dom')
	return ReactDOM;

    if(!path.endsWith('.js') && !path.endsWith('css'))
       path=path+'.js';
       
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    
    var elem;

    if(path.endsWith('css')){
    	elem= document.createElement('link');
	    elem.rel='stylesheet';
	    elem.href=path;
    }
    else{
	     elem= document.createElement('script');
	     elem.type = 'text/javascript';
	   
	     var request = new XMLHttpRequest();
	     request.overrideMimeType('text/plain');
	     request.open('GET', path, false);  // `false` makes the request synchronous
	     request.send(null);
	   
	      var text=request.responseText;
	   
	      var tx= Babel.transform(text,
				   {
				       filename:path,
				       sourceMaps:"inline",
				       presets:["react", "es2015"],
				       "plugins": ["transform-es2015-modules-commonjs", "transform-class-properties", "transform-object-rest-spread", "transform-flow-strip-types"]
				   }).code;
	       var t=document.createTextNode(tx);
	       elem.appendChild(t);
       }
	   head.appendChild(elem);
    
     // at this point, the script has ran and its exports are in the exports object
    return exports;
};

// bootstrap the application from the file indicated by the data-load attribute
let toLoad=document.currentScript.attributes['data-load'].nodeValue;

window.addEventListener('DOMContentLoaded', ()=> require(toLoad), false);



