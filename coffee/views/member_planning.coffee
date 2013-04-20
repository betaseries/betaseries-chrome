class View_MemberPlanning

	init: (login) =>
		login ?= DB.get('session')?.login
		@id = 'MemberPlanning.' + login
		@url = '/planning/member/' + login
		@login = login
		@name = 'MemberPlanning'
		@params = "&view=unseen"
		@root = 'planning'
	
	update: (data) ->
		DB.set 'member.' + @login + '.planning', data
	
	content: ->	
		output = ''
		week = 100
		nbrEpisodes = 0
		
		data = DB.get 'member.' + @login + '.planning', null
		return Fx.needUpdate() if !data
		
		for e of data
			today = Math.floor new Date().getTime() / 1000
			todayWeek = parseFloat date('W', today)
			actualWeek = parseFloat date('W', data[e].date)
			diffWeek = actualWeek - todayWeek
			plot = if data[e].date < today then "tick" else "empty"
			if diffWeek < -2 or diffWeek > 2
				continue
			if actualWeek isnt week
				week = actualWeek
				if diffWeek < -1 
					w = __('weeks_ago', [Math.abs diffWeek])
					hidden = true
				else if diffWeek is -1
					w = __('last_week')
					hidden = true
				else if diffWeek is 0
					w = __('this_week')
					hidden = false
				else if diffWeek is 1
					w = __('next_week')
				else if diffWeek > 1
					w = __('next_weeks', [diffWeek])
					hidden = false
				if nbrEpisodes > 0
					output += '</div>'
				visibleIcon = if hidden then '../img/arrow_right.gif' else '../img/arrow_down.gif'
				titleIcon = if hidden then __('maximise') else __('minimise')
				hidden = if hidden then ' hidden' else ''
				output += '<div class="week' + hidden + '">'
				output += '<div class="title"> ' 
				output += '<img src="' + visibleIcon + '" class="toggleWeek" title="' + titleIcon + '" />'
				output += w + '</div>'
		
			output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + hidden + '">'
			
			output += '<div class="td wrapper-seen">'
			output += '<img src="../img/' + plot + '.png" width="11" />'
			output += '</div>'

			output += '<div class="td wrapper-title" style="width: 186px;">'
			output += '<span class="num">' + Fx.displayNumber(data[e].number) + '</span> '
			output += '<a href="" url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" global="' + data[e].global + '" title="' + data[e].show + '" class="epLink display_episode">'
			output += data[e].show + '</a>'
			output += '</div>'
			
			output += '<div class="td wrapper-date-2">'
			output += '<span class="date">' + date('D d F', data[e].date) + '</span>'
			output += '</div>'
			
			output += '</div>'
			
			nbrEpisodes++
		return output

	listen: ->

		# Show/hide week
		$('.toggleWeek').on 'click', ->
			week = $(@).closest('.week')
			hidden = $(week).hasClass('hidden')
			$(week).toggleClass('hidden')
			$(week).find('.episode').slideToggle()
			
			if hidden
				$(@).attr 'src', '../img/arrow_down.gif'
			else
				$(@).attr 'src', '../img/arrow_right.gif'
			
			Fx.updateHeight()
