class View_Menu
	
	init: =>
		@id = 'Menu'
		@name = 'Menu'
	
	content: ->
		output = ''

		menu_order = DB.get('options').menu_order
			
		for m in menu_order
			
			continue if !m.visible
			
			style = ''
			style = 'style="' + m.img_style + '" ' if m.img_style?
			
			output += '<a href="" id="menu-' + m.name + '" class="menulink">'
			output += '<img src="' + m.img_path + '" ' + style + '/>'
			output += __('menu_' + m.name) + '</a>'

		return output

	listen: ->
		
		$('.Menu').on 'click', '.menulink', ->	
			
			event.preventDefault()
			
			id = $(this).attr('id').substring 5
			
			if (id is 'Options')
				Fx.openTab chrome.extension.getURL('../html/options.html'), true
			
			else if (id is 'Logout')
				Fx.logout()
			
			else
				app.view.load id