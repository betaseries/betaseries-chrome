class View_Search
	
	init: ->
		@id = 'Search'
		@name = 'Search'
	
	content: ->
		output = '<div style="height:10px;"></div>';
		output += '<form id="search">'
		output += '<input type="text" name="terms" id="terms" /> '
		output += '<input type="submit" value="chercher" />'
		output += '</form>'
		output += '<div id="suggests_shows"></div>'
		output += '<div id="suggests_members"></div>'
		output += '<div id="results_shows"></div>'
		output += '<div id="results_members"></div>'
		setTimeout (() -> $('#terms').focus()), 100
		return output