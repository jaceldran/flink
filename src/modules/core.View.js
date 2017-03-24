/**
 * View utilities for render.
 */
var Module = (function(){

	var moduleKEY = "View", Say;

	/**
	 * load (template )
	 * @param object {<args.template>, [<args.object>]}
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

	/**
	 * Utility for render a object using a template.
	 * @param object object The objecto to render.
	 * @param string template The template for render object.
	 * @return string Object rendered with template.
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

	/**
	 * Utility for building templates row-header based on columns configuration.
	 * @param object columns Columns configuration.
	 * @return object Template object {
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

	/**
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
