/**
 * Flink
 */
var Flink = (function(){

	"use strict";

	var loaded={}, endload, frameID, modules=[], LOG=[], muted;
	var settings;

	/**
	 * load resources modules, css, locale, js
	 * 
	 * @param object[]
	 * @param function callback
	 */
	function load(resources, callback)
	{
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

	/**
	 * loads a css file and, if provided, calls callback when loaded.
	 * 
	 * @param object settings (path, data, callback)
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

	/**
	 * loads a js file and calls callback when loaded.
	 * 
	 * @param object settings (path, data, callback)
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

	/**
	 * ready
	 * 
	 * @param object event
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

	/**
	 * build
	 * 
	 * @param object args (open, start...) 
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

	/**
	 * exception/error handler
	 * TODO: thinking...
	 * 
	 * @param string err
	 * @param string action
	 */
	function eh(err, action) {
		console.log("flink.eh" /*, err, "action >", action*/ );
	}

	/*
	 * ajax requests
	 * 
	 * @param object params (method, url, async, success, error, user, pass)
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

	/**
	 * parse action
	 * actions can be format "<module>::<method>::<arg-1>::<arg-2>...<arg-n>"
	 * 
	 * @param string action
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

	/**
	 * call action
	 * 
	 * @param string action can be format "<module>::<method>::<arg1>::<arg2>..."
	 * @param object [optional] can be the element clicked that calls the action  
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

	/**
	 * mute|unmute Flink.tell() method ---POSSIBLY DESCARTED IN THE FUTURE---
	 * 
	 * @param boolean status
	 */
	function mute(status)
	{		
		muted = status;
		console.log("flink.mute", muted);
	}

	/**
	 * modules can tell events to Flink so that Flink tells other modules 
	 * 
	 * @param string|object event 
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

	/**
	 * activates keyboard detection to send events to process method 
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

	/**
	 * process keystrokes for show|hide frame
	 * 
	 * * @param object event 
	 */
	function keyboardEvent(event)
	{
		// is frame visible?
		var visible = Flink.Frame.visible();

		// show frame when pressed CTRL+SPACE
		if (event.ctrlKey && event.keyCode===32) {
			if (!visible) {
				Flink.Frame.show();
			}		
		}

		// hide frame whe pressed ESCAPE
		if (event.keyCode===27) {
			if (visible) {
				Flink.Frame.hide();
			}	
		}
	}

	/**
	 * function assigned to "call" listeners.
	 * element must provide "data-call" attribute.
	 * module invoked must provide "call" method.
	 */
	function listenerCLICK() 
	{
		var element = this, action = element.getAttribute("data-call");
		call(action, element);
	};
	
	/**
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

	/**
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

	/**
	 * start
	 * 
	 * @param object args (open, start...)
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

	/**
	 * open frame 
	 */
	function open()
	{
		Flink.Frame.show();
	}

	/**
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