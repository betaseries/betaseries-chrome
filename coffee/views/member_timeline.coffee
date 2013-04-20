class View_MemberTimeline

	init: =>
		@id = 'MemberTimeline'
		@name = 'MemberTimeline'
		@url = '/timeline/friends'
		@params = '&number=10'
		@root = 'timeline'
		@login = DB.get('session')?.login
	
	update: (data) ->
		DB.set 'member.' + @login + '.timeline', data
	
	content: ->
		output = ''
		time = ''
		
		data = DB.get 'member.' + @login + '.timeline', null
		return Fx.needUpdate() if !data
		
		for n of data
			new_date = date('D d F', data[n].date)
			if new_date isnt time
				time = new_date
				output += '<div class="title">' + time + '</div>'
			
			output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
			output += '<b>' + date('H:i', data[n].date) + '</b> '
			output += '<span class="login">' + data[n].login + '</span> ' + data[n].html
			output += '</div>'
		return output