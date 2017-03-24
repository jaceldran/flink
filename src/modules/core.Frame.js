/**
 * Frame
 */
var Module = (function() {

	var frameID, frame, firstOpen, namespace;

	/**
	 * create element
	 * @param string type of component.
	 * @param object Flink.frame settings.
	 * @return object dom element.
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

	/** 
	 * build frame window
	 * @param object settings
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

	/**
	 * check if frame is visible 
	 */
	function isVisible()
	{
		return frame.style.display !== "none";
	}

	/**
	 * open|shows frame
	 */
	function show()
	{
		frame.style.display = "block";
	}

	/**
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

	/**
	 * set content of a component identified by its ID.
	 * @param string key
	 * @param string content
	 * @param string mode
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

	/**
	 * compose breadcrumb links and show as prompt.
	 * usually invoke from Modules.
	 * @param object args
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

	/**
	 * returns a node element of frame 
	 * @param string key
	 */
	function node(key)
	{
		var ID = frameID + "-" + key;
		return document.getElementById(ID);
	}

	/**
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
