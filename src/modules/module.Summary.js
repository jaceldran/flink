/**
 * Summary 
 */
var Module = (function(){

	/**
	 * global module vars 
	 */
	var moduleKEY = "Summary";

	/**
	 * call
	 * use "method" and "args" if need "callable" actions
	 * i.e. action = <module>::<method>::<args>
	 * @param string method
	 * @param array args
	 */
	function call(method, args)
	{
		Flink.Frame.setMain("<h2>summary</h2>");
		Say = Flink.Locale.say;
		Render = Flink.View.render;
		TColumns = Flink.View.templateColumns;
		namespace = moduleKEY + " " + Flink.settings.namespace;		
		Flink.Frame.setMain( content() );
		Flink.Frame.breadCrumb({
			forms: { text: Say(moduleKEY)}
		});		
	}

	/**
	 * compose content
	 * TODO: normalize standar method "summary" for all modules
	 * TODO: use templates 
	 */
	function content() 
	{
		// init render
		var forms = document.forms;
		var links = document.querySelectorAll("a:not(."+Flink.settings.namespace+")");
		var data = {
			Forms: {
				text: Say("Forms")
				, value: "<span class=\"count\">" + forms.length + "</span>"
			}
			, Links: {
				text: Say("Links")
				, value: "<span class=\"count\">" + links.length + "</span>"
			}
		};
		var template = {
			row: "<tr>"
				+ "<td>"
					+ "<a class=\"%style%\""
					+ ' onclick="Flink[\'%key%\'].call()">%text%</a>'
					+ " <span style=\"float:right\">%value%</span>"
					+ "</td>"
				+ "</tr>"
		}
		
		var r = [];		
		r.push( "<h2 class=\"" + namespace + "\">" + Say(moduleKEY) + "</h2>" );
		r.push( "<table class=\"" + namespace + "\">" );		
		for (var key in data) {
			var obj = data[key];
			obj.key = key
			obj.style = Flink.settings.namespace
			r.push(Render(obj, template.row))
		}

		// end render
		r.push( "</table>" );		

		// return
		return r.join("\n");		
	}

	/**
	 * events
	 * @param string event
	 * @param string element 
	 */
	function on(event, element)
	{
		if (event==="start") { // Flink.start

			// do this to add as a menu option
			Flink.Menu.addElement({
				key: moduleKEY
				, text: moduleKEY
				, call: moduleKEY
			});

			// do this to add as preferences start option
			Flink.Preferences.addAction(moduleKEY);

			/*// ensure load current lang locale			
			Flink.load([{type: "locale"
				, path: Flink.settings.path.locale 
					+ "/locale." + moduleKEY 
					+ "." + Flink.settings.locale.lang + ".js"
			}]);*/
		}
	}

	/**
	 * export
	 */
	return {
		key: moduleKEY
		, call: function(method, args) {call(method, args);}
		, on: function(event, element) {on(event, element);}
	}

})();

