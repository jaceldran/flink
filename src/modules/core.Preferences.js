/**
 * Preferences
 */
var Module = (function(){	

	var moduleKEY="Preferences", Say, Render, content, form
	, defaults = {lang:"es-ES", start:""};

	/**
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

	/**
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

	/**
	 * load options to a select|radio|checkbox element
	 * @param object object
	 * @param array values
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


	/**
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

	/**
	 * allow add values in settings.design.actions
	 * @param string key
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

	/**
	 * apply to context
	 * @param object args
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

	/**
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

	/**
	 * save current context settings to localStorage
	 * @param object preferences
	 */
	function save(preferences)
	{
		localStorage.setItem("FlinkPreferences"
			, JSON.stringify(preferences,null,4));

		// tells Flink so that rest of modules can act accordingly 
		Flink.tell(moduleKEY+".save");
	}

	/**
	 * on
	 * @param string event
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

	/**
	 * reset|delete
	 */
	function reset()
	{		
		localStorage.removeItem("FlinkPreferences");
	}


	/**
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
