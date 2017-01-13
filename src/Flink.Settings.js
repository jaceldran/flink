
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