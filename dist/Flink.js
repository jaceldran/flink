

/*
 * -----------------------------------------------------------------------------
 * Flink [beta]
 * Build: 18/12/16 11:32:35
 * -----------------------------------------------------------------------------
 *                    _)                    |               
 *  __|   _ \   __ \   |  __ `__ \    _` |  __|   _ \   __| 
 * \__ \  (   |  |   |  |  |   |   |  (   |  |     __/  (    
 * ____/ \___/  _|  _| _| _|  _|  _| \__,_| \__| \___| \___| 
 *
 * wanna know more? -> http://cdn.zentric.es/demo/flink 
 * contact          -> jaceldran@gmail.com 
 * -----------------------------------------------------------------------------
 */

/*
 * Flink
 */
var Flink = (function(){

	"use strict";

	var loaded={}, endload, frameID, modules=[], LOG=[], muted;
	
	/*
	 * app settings
	 */
	var settings = {};

	/** app info **/
	settings.app = {name: "FLINK", version: "beta"};

	/** open frame inmediately, no need to press CTRL+SPACE **/
	settings.autorun = false;

	/** paths **/
	var install = {
		path: "/flink/beta/dist"
		, url: "http://cdn.zentric.es/flink/beta/dist"
	}
	if (location.hostname==='localhost') {
		var install = {
			path: "/cdn/flink/beta/dist"
			, url: "http://localhost/cdn/flink/beta/dist"
		}	
	}
	settings.path = {
		locale: install.url + "/locale"
		, templates: install.url + "/templates"
		, modules: install.url + "/modules"
		, css: install.url + "/css"
	};

	/** action that takes place on first call by default **/
	settings.start = "Preferences"; //"View::load::" + settings.path.templates + "/start.html";

	/** namespace for CSS and future functionality? **/
	settings.namespace = "flink";

	/** locale, how many langs and which is current **/
	settings.locale = {
		lang: "es-ES" // "en-GB" // current
		, langs: ["es-ES", "en-GB"]
		, sources: {
			"es-ES": settings.path.locale + "/locale.core.es-ES.js"
			, "en-GB": settings.path.locale + "/locale.core.en-GB.js"
		}
	};

	/** menu options **/
	settings.menu = {
		style: "bottom right"
		, elements: { 
			header:  {text: "Menu", type: "div", style: "header", }
			, Preferences: {text: "Preferences", type: "a", call: "Preferences"}
		}
	};

	/** frame layout elements **/
	settings.frame = {
		// header config
		header:{
			elements: ["name", "frame-buttons"]
			// subelements
			, "frame-buttons": [/*"minimize",  "maximize",*/ "close"]
		}
		// footer config
		, footer: {
			elements: ["prompt", "menu"]
			, actions: ["preferences"]
		}
	};


	/*
	 * design elements managed in preferences
	 */
	settings.design = {
		elements: ["name","buttons", "actions", "prompt", "menu" ]
		, buttons: ["minimize","maximize","close"]
		, actions: ["Preferences"]
	};

	/*
	 * load resources modules, css, locale, js
	 */
	function load(resources, callback)
	{//console.log("load", resources);
		var args, obj, i
		, loader = {
			module: loadJS, locale: loadJS
			, js: loadJS, css: loadCSS
		};

		// register endload callback		
		if (typeof callback==="function") {
			endload = callback;
		}

		// process
		for (i=0; i<resources.length; i++) {
			obj = resources[i];

			// if resource is yet loaded, ignore
			if (loaded[obj.path]) {
				//console.log ("ya cargado", obj.path, loaded [obj.path] );
				continue;
			}

			loaded[obj.path] = false;
			args = {path: obj.path, callback: ready, data: {path: obj.path}};
			if (obj.type==="module") {
				args.data.module = obj.key;
			} else if (obj.type==="locale") {
				args.data.locale = obj.key;
			}
			loader[obj.type](args);
		}
	}

	/*
	 * loads a css file and, if provided, calls callback when loaded.
	 * @param {object} settings: {path, data, callback}
	 */
	function loadCSS(settings)
	{		
		var element = document.createElement("link");
		element.setAttribute("rel","stylesheet");
		element.setAttribute("href", settings.path);
		if (settings.data) {
			for(var key in settings.data) {
				element.setAttribute("data-" + key, settings.data[key]);
			}
		}
		if (settings.callback) {
			element.addEventListener("load", function(event){
				settings.callback(event);
			});
			element.addEventListener("error", function(event){
				settings.callback(event);
			});
		}
		return document.head.appendChild(element);
	}

	/*
	 * loads a js file and calls callback when loaded.
	 * @param {object} settings: {path, data, callback}
	 */
	function loadJS(settings)
	{		
		var script = document.createElement("script");
		script.setAttribute("type","text/javascript");
		script.setAttribute("src", settings.path);
		if (settings.data) {
			for(var key in settings.data) {
				script.setAttribute("data-" + key, settings.data[key]);
			}
		}
		if (settings.callback) {
			script.addEventListener("load", function(event){
				settings.callback(event);
			});
			script.addEventListener("error", function(event){
				settings.callback(event);
			});
		}
		return document.head.appendChild(script);
	}	

	/*
	 * ready
	 * @param {object} event
	 */
	function ready(event)
	{		
		var target = event.target;
		var path = target.getAttribute("data-path");
		var moduleKEY = target.getAttribute("data-module");
		var localeKEY = target.getAttribute("data-locale");

		// show errors
		if (event.type==="error") {
			console.error("Error al cargar ", event);
			return;
		}		

		// if thing loaded is a module, register
		if (moduleKEY) {
			Flink[moduleKEY] = Module;
			modules.push(moduleKEY);
		}

		// if thing loaded is a locale file, update
		if (localeKEY) {
			Flink.Locale.load(localeKEYS);		
		}

		// progress
		loaded[path] = true;
		for(path in loaded) {	
			if (!loaded[path]) {
				return;
			}
		}

		// invoke on("start)
		tell("start");

		// current start registered in settings
		if (settings.start) {			
			var parse = parseAction(settings.start);
			try {
				Flink[parse.module][parse.method](parse.args);
			} catch (err) {
				eh (err, parse);
			}
		}		

		// endload callback ?
		if (typeof endload==="function") {
			endload();
		}
	}

	/*
	 * build
	 */
	function build(args)
	{
		// create frame
		if (!frameID) {
			frameID = Flink.Frame.build(settings.frame);
		}

		// apply preferences
		Flink.Preferences.apply(args);

		// load core locale and css		
		load([
			{type: "locale", key: "core"
				, path: settings.locale.sources[settings.locale.lang]}
			, {type: "css", key: "core"
				, path: settings.path.css + "/style.core.css"}
		]);

		// set keyboard shortcuts
		listenKeyboard();

		// refresh element listeners
		listenClicks();
	} 

	/*
	 * exception/error handler
	 * TODO: thinking...
	 */
	function eh(err, action) {
		console.log("flink.eh" /*, err, "action >", action*/ );
	}

	/*
	 * ajax requests
	 * @param {object} params {method, url, async, success, error, user, pass}
	 */
	function request(params)
	{
		var xmlhttp, key, args = {
			method: "GET"
			, url: "", async: true
			, user: null, pass: null
			, success: function() {}
			, error: function() {}
		};
		for (key in args) {
			if (params[key]) {
				args[key] = params[key];
			}
		}
		xmlhttp = new XMLHttpRequest();
		var states=["pending","connection","received","processing","finished"];
		xmlhttp.onreadystatechange = function() {			
			if(this.readyState===4) {
				if (this.status===200) {
					if (args.success) {
						args.success(this.response, this);
					}
				} else {
					if (args.error) {
						args.error(this);
					}
				}
			}
		};  
		xmlhttp.open(args.method, args.url, args.async, args.user, args.pass);
		xmlhttp.send();
	}

	/*
	 * parse action
	 * actions can be format "<module>::<method>::<arg1>::<arg2>...<argn>"
	 * @param {string} action
	 */
	function parseAction(action)
	{		
		var module = action, method = "call", args = []; // defaults
		var parse = action.split("::");
		if (parse.length > 1 ) { 			
			 module = parse[0];
			 method = parse[1];
			 args = parse.slice(2);
		}
		return {module: module, method: method, args: args};
	}

	/*
	 * call action
	 * @param {string} action can be format "<module>::<method>::<arg1>::<arg2>..."
	 * @param {object} [optional] can be the element clicked that calls the action  
	 */
	function call(action, element)
	{		
		var invoker, key, invoke;
		if (element && element.hasAttribute("data-invoker")) {
			invoker = element.getAttribute("data-invoker"); 
		}
		action = parseAction(action);

		// special actions that aren't module methods.
		if ( action.module==="Close" ) {
			Flink.Frame.hide();

		// default: call a module.method
		} else {
			try {
				Flink[action.module][action.method](action.args);
				if (invoker && typeof Flink[invoker].on === "function") {
					Flink[invoker].on("click", element);
				}
			} catch (err) {
				eh (err, action);
			}
		}
	}

	/*
	 * mute / unmute
	 * @param {boolean} status
	 */
	function mute(status)
	{		
		muted = status;
		console.log("flink.mute", muted);
	}

	/*
	 * modules can tell events to Flink so that Flink tells other modules 
	 * restricted to "non-core" modules (OFF)
	 * @param {string|object} event 
	 */
	function tell(event)
	{
		if (muted) {
			return;
		}
		for (var key in Flink) {
			if ( typeof Flink[key].on === "function") {
				Flink[key].on(event);
			}
		}
	}

	/*
	 * activate keyboard detection to send events to process method 
	 */
	function listenKeyboard()
	{			
		document.addEventListener("keydown", function(event) {
			keyboardEvent(event);
		});

		document.addEventListener("keyup", function(event) {
			keyboardEvent(event);
		});
	}

	/*
	 * process keystrokes for show|hide frame
	 */
	function keyboardEvent(event)
	{
		// is frame visible?
		var visible = Flink.Frame.visible();

		// show frame when pressed [CRTL]+[SPACE]
		if (event.ctrlKey && event.keyCode===32) {
			if (!visible) {
				Flink.Frame.show();
			}		
		}

		// hide frame whe pressed [ESCAPE]
		if (event.keyCode===27) {
			if (visible) {
				Flink.Frame.hide();
			}						
		}
	}

	/*
	 * function assigned to "call" listeners.
	 * element must provide "data-call" attribute.
	 * module invoked must provide "call" method.
	 */
	function listenerCLICK() 
	{
		var element = this, action = element.getAttribute("data-call");
		call(action, element);
	};
	
	/*
	 * refresh  listeners for click on "call" actions
	 */	
	function listenClicks()
	{
		var elements = document.getElementsByClassName("call");
		for(var i=0, l=elements.length; i<l; i++) {
			elements[i].removeEventListener("click", listenerCLICK);
			elements[i].addEventListener("click", listenerCLICK);
		}
	}

	/*
	 * log
	 */
	function log()
	{
		if (arguments) {
			for (var i=0; i<arguments.length; i++) {
				LOG.push(arguments[i]);	
			}
		}
		return LOG;
	}

	/*
	 * start
	 * @param {object} args
	 */
	function start(args)
	{
		var defaults = {
			open: false
			, start: settings.start
		};

		if (!args) {
			args=defaults;
		} else {
			for (var key in defaults) {
				if (!args[key]) {
					args[key] = defaults[key];
				}
			}
		}
		// build
		build(args);

		// open
		if (args.open) {
			open();
		}
	}

	/*
	 * open frame 
	 */
	function open()
	{
		Flink.Frame.show();
	}

	/*
	 * export
	 */
	return {
		load: function(resources, callback) {load(resources, callback);}
		, call: function(action, element) {call(action, element);}
		, mute: function() { mute(true);}
		, unmute: function() { mute(false);}
		, tell: function(event) { tell(event);}
		, listenClicks: function() {listenClicks();}
		, request: function(args) {request(args);}
		, loadJS: function(args) {loadJS(args);}
		, loadCSS: function(args) {loadCSS(args);}
		, log: function() {return log();}
		, start: function(args) {start(args);}
		, open: function(args) {open();}
		, settings: settings
	};

})();

/** [../src/modules/core.Bookmark.js] **/

/*
 * Bookmark
 */
var Module = (function(){

	/*
	 * global module vars 
	 */
	var moduleKEY = "Bookmark";

	/*
	 * call
	 * allow use "method" and "args" if need "callable" actions
	 * i.e. action = <module>::<method>::<args>
	 * @param {string} method
	 * @param {array} args
	 */
	function call(method, args)
	{

	}

	/*
	 * events
	 * @param {string} event Name or type of event
	 * @param {object} element Usually a clicked element  
	 */
	function on(event, element)
	{
		if (event==="start") { // Flink.start 

			/*// do this to add as a menu option
			Flink.Menu.addElement({
				key: moduleKEY
				, text: moduleKEY
				, call: moduleKEY
			});*/

			/*// do this to add as preferences start option
			Flink.Preferences.addAction(moduleKEY);*/
		}
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}
		, on: function(event, element) {on(event, element);}
	}

})();

	
Flink[Module.key] = Module;


/** [../src/modules/core.Browser.js] **/

/*
 * Browser 
 */
var Module = (function(){

	var moduleKEY = "Browser", iframe, status;

	/*
	 * call
	 */
	function call(method, args)
	{	
		switch(method) {
			case "load":
				load(args.join(""));
				break;
		}
	}



	/*
	 * listener function
	 */
	function onload()
	{
		status.style.display = "none";
	}

	/*
	 * load
	 * if from server,  remote resources require CORS header ??? 
	 */
	function load(url)
	{
		Flink.Frame.breadCrumb({url: {text: url}});		
		var main = Flink.Frame.node("main");
		main.innerHTML = "";
		iframe = document.createElement("iframe");
		status = document.createElement("div");
		status.className = "splash";
		status.style.whiteSpace = "nowrap";
		status.innerHTML = "((( " + url + " )))";
		main.appendChild(status);
		main.appendChild(iframe);		
		iframe.removeEventListener("load", onload);
		iframe.addEventListener("load", onload);
		iframe.src = url;
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}		
		, load: function(url) {load(url);}
	}

})();

	
Flink[Module.key] = Module;


/** [../src/modules/core.Frame.js] **/

/*
 * Frame
 */
var Module = (function() {

	var frameID, frame, firstOpen, namespace;

	/*
	 * create element
	 * @param {string} type of component.
	 * @param {object} Flink.frame settings.
	 * @return {object} dom element.
	 */
	function createElement(settings)
	{
		var key, element, child, subchild, subkeys;

		// detect special elements	
		var specials = {
			menu: {
				node: "button"
				, style: "call frame-menu icon-burger"
				, attrs: {"data-call": "Menu"}
			}
			, close: {
				node: "button"
				, style: "call frame-close"
				, attrs: {"data-call": "Close"}			
			}
			, maximize: {
				node: "button"
				, style: "call frame-maximize"
				, attrs: {"data-call": "Maximize"}			
			}
			, minimize: {
				node: "button"
				, style: "call frame-minimize"
				, attrs: {"data-call": "Minimize"}			
			}
		};

		if (specials[settings.type]) {
			for(key in specials[settings.type]) {
				settings[key] = specials[settings.type][key];
			}
		}

		// defaults (requires always: "type")
		settings.id = settings.id || frameID + "-" + settings.type;
		settings.node = settings.node || "div";
		settings.style = settings.style || settings.type;

		// create node element
		element = document.createElement(settings.node);
		if (settings.id) {element.id = settings.id;}
		element.className = namespace + " " + settings.style;

		// attrs if available
		if (settings.attrs) {
			for (key in settings.attrs) {
				element.setAttribute(key, settings.attrs[key]);
			}
		}

		// hide ?
		if (settings.hidden) {
			element.style.display = "none";
		}

		// children (recursive)
		if (settings.elements) {			
			// add children of element
			keys = settings.elements;
			for (var i=0, l=keys.length; i<l; i++) {
				if (specials[keys[i]]) {
					child = createElement(specials[keys[i]]);
					child.removeAttribute("id");
				} else {
					child = createElement({type: keys[i]});
				}
				element.appendChild(child);

				// if child is a container then there a key apart in settings 
				// whith the subchilds keys to add.
				if (settings[keys[i]]) {
					subkeys = settings[keys[i]];
					for (var j=0, m=subkeys.length; j<m; j++) {
						subchild = createElement({type: subkeys[j]});
						child.appendChild(subchild);
					}					
				}				
			}
		}
		
		// return
		return element;
	}

	/* 
	 * build frame window
	 */
	function build(settings)
	{	
		// globals
		frameID = "frame-" + new Date().getMilliseconds()
		, namespace = Flink.settings.namespace
		, firstOpen = true
		, visible = false;

		// defaults
		var create = {}; // container for createElement settings
		var defaults = {
			header: {elements: ["app-name", "button-close"] }
			, main: {content: " "}
			, footer: {elements: ["prompt"] }
		}
		for(var key in defaults) {
			if (!settings[key]) {
				settings[key] = defaults[key];
			}
		}

		// frame
		frame = createElement({
			id: frameID
			, type: "frame"
			, hidden: true
		});

		// overlay
		var overlay = createElement({
			type: "overlay"
			, style: "overlay call close"
			, attrs: {"data-call": "Close"}
		});
		frame.appendChild(overlay);

		// overlay
		var modale = createElement({
			type: "modale"
		});
		frame.appendChild(modale);

		// header
		if (settings.header) {
			create = settings.header;
			create.type = "header";
			var header = createElement(create);
			modale.appendChild(header);
		}

		// main
		if (settings.main) {
			create = settings.main;
			create.type = "main";
			var main = createElement(create);
			modale.appendChild(main);
		}

		// footer
		if (settings.footer) {
			create = settings.footer;
			create.type = "footer";
			var footer = createElement(create);
			modale.appendChild(footer);
		}

		// append components to document		
		document.body.appendChild(frame);

		// set name
		setContent("name", Flink.settings.app.name 
			+ " <span class=\"status\">" 
			+ Flink.settings.app.version + "</span>" );

		// return ID
		return frameID;
	}

	/*
	 * check if frame is visible 
	 */
	function isVisible()
	{
		return frame.style.display !== "none";
	}

	/*
	 * open|shows frame
	 */
	function show(show)
	{
		frame.style.display = "block";
	}

	/*
	 * close|hides frame
	 */
	function hide()
	{
		frame.style.display = "none";		
		
		// hide dependencies, if available		
		for(var key in Flink) {
			if (key==="Frame") {
				continue;
			}
			if (typeof Flink[key].hide==="function") {
				Flink[key].hide();
			}
		}
	}

	/*
	 * set content of a component identified by its ID.
	 */
	function setContent (key, content, mode)
	{
		mode = mode || "replace";
		var targetID = frameID + "-" + key;
		var elm = document.getElementById(targetID);

		// error if not found
		if (!elm) {
			console.error("frame.load", key, "no encuentra targetID", "*"+targetID+"*", mode, content);			
			return;
		}

		switch(mode) {
			case "add":
				content = elm.innerHTML + content;
				break;
		}
		elm.innerHTML = content;
	}

	/*
	 * compose breadcrumb links and show as prompt.
	 * usually invoke from Modules.
	 */
	function breadCrumb(args)
	{
		var element, sep, target = node("prompt");

		// reset container
		target.className = "prompt breadcrumb " + Flink.settings.namespace;
		target.innerHTML = ""; // works fine

		// home node
		element = document.createElement("a");
		element.innerText = Flink.settings.app.name;
		element.className = "call " + Flink.settings.namespace;
		element.setAttribute("data-call", Flink.settings.start);
		target.appendChild(element);
				
		// links path
		for(var key in args) {

			// separator
			sep = document.createElement("span");
			sep.innerHTML = " &raquo; ";
			target.appendChild(sep);

			// link element
			if (args[key].call) {
				element = document.createElement("a");
				element.className = "call " + + Flink.settings.namespace;;
				element.setAttribute("data-call", args[key].call);
			} else {
				element = document.createElement("span");
			}
			element.innerText = key;
			if (args[key].text) {
				element.innerHTML = args[key].text;
			}
			target.appendChild(element);
		}

		// refresh listeners
		Flink.listenClicks();
	}	

	/*
	 * returns a node element of frame 
	 */
	function node(key)
	{
		var ID = frameID + "-" + key;
		return document.getElementById(ID);
	}

	/*
	 * export
	 */
	return {
		key: "Frame"
		, ID: function() {return frameID;}
		, node: function(key) {return node(key);}
		, build: function(settings){return build(settings);}
		, visible: function(){return isVisible();}
		, show: function(){show();}
		, hide: function(){hide();}
		, setName: function(content) {return setContent("name", content);}
		, setMain: function(content) {return setContent("main", content);}
		, addMain: function(content) {return setContent("main", content, "add");}
		, setPrompt: function(content) {return setContent("prompt", content);}
		, breadCrumb: function(args) {return breadCrumb(args);}
	}

})();
	
Flink[Module.key] = Module;


/** [../src/modules/core.Locale.js] **/

/*
 * Locale 
 */
var Module = (function(){

	var moduleKEY = "Locale", loaded = {}, KEYS = {};


	/*
	 * load
	 */
	function load(keys)
	{
		for (var key in keys) {
			KEYS[key] = keys[key];
		}
	}

	/*
	 *
	 */
	function update()
	{

	}

	/*
	 * load
	 * @param {array|string} paths fullpaths including extension
	 */
	/*function load(paths, callback)
	{
		paths = paths || [];		
		if (typeof paths==="string") {
			paths = [paths];
		}
//console.log("locale.load.START", paths);
		paths.forEach(function(path, index) {
			loaded[path] = false;
			Flink.loadJS({
				path: path
				, data: {path: path}
				, callback: function(event) {
					var target = event.target;
					loaded[target.getAttribute("data-path")] = true;
					for (var key in localeKEYS) {
						KEYS[key] = localeKEYS[key];
					}
//console.log(KEYS);					
					if (typeof callback==="function") callback(event);
				}
			})
		});
	}*/

	/*
	 * say
	 * @param {string} key.
	 * @return {string} translation.
	 */
	function say(key, mode)
	{
		var text;

		if (key==="*") {
			return KEYS;
		}
		if (KEYS[key]) {
			text = KEYS[key];
		} else {
			text = "*" + key;
		}
		return text;
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY		
		, say: function(key) {return say(key);}
		, load: function(keys) {return load(keys);}
	}

})();

	
Flink[Module.key] = Module;


/** [../src/modules/core.Menu.js] **/

/*
 * Menu
 */
var Module = (function(){

	/*
	 * global module vars
	 */
	var moduleKEY = "Menu", config, container, elements;

	/*
	 * call
	 * @param {string} method
	 * @param {array} args
	 */
	function call(method, args)
	{		
		if(!container) {
			build();
		}
		on("click");
	}

	/*
	 * refresh
	 */
	function refresh()
	{
		if (container) {
			container.parentNode.removeChild(container);
		}
		build();
		toggle("hidden");
	}

	/*
	 * build
	 */	
	function build()
	{		
		config = Flink.settings.menu;	
		container = document.createElement("nav");
		elements = document.createElement("div");
		var Say = Flink.Locale.say;

		// container style
		style = ["menu"];
		if (config.style) {
			style.push(config.style);
		}		
		container.className = style.join(" ");

		// elements style
		elements.className = "elements";

		// create elements
		for(var key in config.elements) {
			style = [Flink.settings.namespace];
			obj = config.elements[key];
			if (!obj.type) {obj.type = "a";}
			elm = document.createElement(obj.type);				
			elm.innerHTML = Say(obj.text);
			if (obj.style) {style.push(obj.style);}	
			if (obj.call) {
				style.push("call");
				elm.setAttribute("data-call", obj.call );
				elm.setAttribute("data-invoker", "Menu");
				//elm.addEventListener("click", function(event){
				//	on("click", this);
				//});
			}
			elm.className = style.join(" ");
			elements.appendChild(elm);
		}
		container.appendChild(elements);
		Flink.Frame.node("modale").appendChild(container);

		// refresh listeners for call actions
		Flink.listenClicks();

		// hide when click on main
		Flink.Frame.node("main").addEventListener("click", function(evt){
			toggle("hidden");
		})
	}

	/*
	 * toggle visibility
	 * @param {string} visibility Ensure visibilite to this value.
	 */
	function toggle(visibility)
	{
		var current = container.style.visibility;
		if (!visibility) {
			visibility = (current==="visible") ? "hidden" : "visible";
		}
		container.style.visibility = visibility;
	}

	/*
	 * addElement
	 */
	function addElement(element)
	{	
		Flink.settings.menu.elements[element.key] = element;
		refresh();
	}

	/*
	 * events
	 * @param {string} event
	 */
	function on(event, element)
	{
		if (event==="click") {			
			if (element && element.hasAttribute("data-invoker")) {
				toggle("hidden"); // if click on any option, hide panel
			} else {				
				toggle(); // if click on menu icon, toggle visibility
			}			
		}
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}
		, on: function(event, element) {on(event, element);}
		, addElement: function(element) {addElement(element);}
	}

})();

	
Flink[Module.key] = Module;


/** [../src/modules/core.Panel.js] **/

/*
 * Panel
 */
var Module = (function(){

	/*
	 * global module vars 
	 */
	var moduleKEY = "Panel";

	/*
	 * call
	 * allow use "method" and "args" if need "callable" actions
	 * i.e. action = <module>::<method>::<args>
	 * @param {string} method
	 * @param {array} args
	 */
	function call(method, args)
	{

	}

	/*
	 * events
	 * @param {string} event Name or type of event
	 * @param {object} element Usually a clicked element  
	 */
	function on(event, element)
	{
		if (event==="start") { // Flink.start 

			/*// do this to add as a menu option
			Flink.Menu.addElement({
				key: moduleKEY
				, text: moduleKEY
				, call: moduleKEY
			});*/

			/*// do this to add as preferences start option
			Flink.Preferences.addAction(moduleKEY);*/
		}
	}

	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}
		, on: function(event, element) {on(event, element);}
	}

})();

	
Flink[Module.key] = Module;


/** [../src/modules/core.Preferences.js] **/

/*
 * Preferences
 */
var Module = (function(){	

	var moduleKEY="Preferences", Say, Render, content, form
	, defaults = {lang:"es-ES", start:""};

	/*
	 * call
	 */
	function call()
	{
		Say = Flink.Locale.say;
		Render = Flink.View.render;
		Flink.Frame.breadCrumb({
			preferences: {text: Say(moduleKEY)}
		});
		loadForm();
	}

	/* 
	 * load options and default values to the form.
	 */
	function loadForm()
	{
		var locale = Flink.Locale.say("*");

		Flink.request({
			url: Flink.settings.path.templates + "/preferences.html"
			, success: function(response) {
				content = response;
				content = Render(locale, content);				
				Flink.Frame.setMain(content);

				// register form
				form = document.getElementById("flink-form-preferences");

				// load options for select-element
				var elm, options, values = {
					"select-element": Flink.settings.design.elements
					, "select-lang": Flink.settings.locale.langs
					, "select-action": Flink.settings.design.actions
				};

				// load select options	
				for(var i=0; i<form.elements.length; i++) {
					elm = form.elements[i];
					if (elm.type==="select-one") {
						options = values[elm.getAttribute("data-options")];
						loadSelect(elm, options);
					}
				}

				// load current values to form
				loadValues();

				// click button reset
				document.getElementById("flink-form-preferences-reset")
					.addEventListener("click", function(){
						reset();
						location.href=location.href;
					});

				// click button apply/save
				document.getElementById("flink-form-preferences-apply")
					.addEventListener("click", function(){
						save({
							start: this.form.start.value
							, lang: this.form.lang.value
						});						
					});
			}
		});
	}

	/*
	 * load options to a select|radio|checkbox element
	 */
	function loadSelect(object, values) {
		var o;	
		o = document.createElement("option");
		o.innerHTML = Say("...");
		o.value = "";		
		object.appendChild(o);
		for (var i=0; i<values.length; i++) {
			o = document.createElement("option");
			o.innerHTML = Say(values[i]);
			o.value = values[i];
			object.appendChild(o);
		}		
		object.selectedIndex = 0;
	}


	/*
	 * load form with current preferences
	 */
	function loadValues()
	{
		var source, saved, values;
		saved = read();
		source = Flink.settings;
		var values = {
			start: source.start
			, lang: source.locale.lang
		};
		for (var key in values) {
			if (form.elements[key]) {
				form.elements[key].value = values[key];
			}
		}
	}

	/*
	 * allow add values in settings.design.actions
	 */
	function addAction(key)
	{
		var actions = Flink.settings.design.actions; 
		if (actions.indexOf(key)===-1) {	
			Flink.settings.design.actions.push(key);
		} else {
			Flink.log(moduleKEY + ".addAction: key exist " + key);			
		}
	}

	/*
	 * apply to context
	 * @param {object} args
	 */
	function apply(args)
	{	
		// read saved preferences
		var preferences = read() || {};

		// if args, overwrite saved preferences 
		if (args) {
			if (args.start) {preferences.start = args.start;}
			if (args.lang) {preferences.lang = args.lang;}
		}

		// overwrite settings with saved preferences
		if (preferences) {
			Flink.settings.start = preferences.start;
			Flink.settings.locale.lang = preferences.lang;
		}
	}

	/*
	 * read preferences form localStorage
	 */
	function read()
	{
		var preferences = defaults;		
		var saved =  localStorage.getItem("FlinkPreferences");
		if (saved) {
			saved = JSON.parse(saved);
			for(var key in saved) {
				preferences[key] = saved[key];
			}			
		}
		return preferences;
	}

	/*
	 * save current context settings to localStorage
	 */
	function save(preferences)
	{
		localStorage.setItem("FlinkPreferences"
			, JSON.stringify(preferences,null,4));

		// tells Flink so that rest of modules can act accordingly 
		Flink.tell(moduleKEY+".save");
	}

	/*
	 * on
	 */
	function on(event)
	{
		if (event==="Preferences.save") {
			var preferences = read();
			alert(
				"Detectado evento [" + event.toUpperCase() + "]" 
				+ "\n\nAhora se deben aplicar cambios (en desarrollo)\n"
				+ JSON.stringify(preferences,null,4)
			);
		}
		console.log("preferences.on >", event);
	}

	/*
	 * reset|delete
	 */
	function reset()
	{		
		localStorage.removeItem("FlinkPreferences");
	}


	/*
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(){call();}
		, reset: function(){reset();}
		, read: function() {return read();}
		, apply: function(args) {apply(args);}
		, addAction: function(key){addAction(key);}
		, on: function(event){on(event);}
	}

})();
	
Flink[Module.key] = Module;


/** [../src/modules/core.View.js] **/

/*
 * View utilities for render.
 */
var Module = (function(){

	var moduleKEY = "View", Say;

	/*
	 * load (template )
	 * @param {object} {<args.template>, [<args.object>]}
	 */
	function load(args)
	{
		if (args.length===1 || typeof args==="string") args = {template: args};
		Flink.request({
			url: args.template
			, success: function(response) {
				if (args.object) {
					response = renderObject(args.object, response);
				}
				if (args.success) {
					args.success(response);
				}				
			}
		})
	}

	/*
	 * Utility for render a object using a template.
	 * @param {object} object The objecto to render.
	 * @param {string} template The template for render object.
	 * @return {string} Object rendered with template.
 	 */
	var renderObject = function (object, template) {
		var key, mark, content = template;
		for(key in object) {
			mark = new RegExp("%" + key + "%", "gi")
			value = object[key];
			content = content.replace(mark, value, content);
		}
		return content;
	};

	/*
	 * Utility for building templates row-header based on columns configuration.
	 * @param {object} columns Columns configuration.
	 * @return {object} Template object {
	 * 		headers:<template.header>
	 * 		, row:<template-row>
	 * }
	 */
	function templateColumns (columns)
	{
		// init
		Say = Flink.Locale.say
		, trow = []
		, thead = [];

		trow.push("<tr>");
		thead.push("<tr>");		

		// columns
		for(var key in columns) {
			var column = columns[key], style, pattern;
			if (column.show) {
				style = "";
				pattern = "%" + key + "%";
				if (column.style) {
					style=" class=\"" + column.style + "\"";
				}
				if (column.pattern) {
					pattern = column.pattern
				}
				trow.push("<td" + style + ">" + pattern + "</td>");
				thead.push("<th>" + Say(key) + "</th>");				
			}
		}

		// end
		trow.push("</tr>");
		thead.push("</tr>");

		// return
		return {
			row: trow.join("\n"),
			header: thead.join("\n"),
		}
	}	

	/*
	 * export
	 */
	return {
		key: moduleKEY
		//, call: function(method, args) {return call(method, args);}
		, render: function (object,template) {
			return renderObject(object,template);
		}
		, templateColumns: function (columns) {
			return templateColumns(columns);
		}
		, load: function(args) {load(args);} 
	}

})();
	
Flink[Module.key] = Module;


