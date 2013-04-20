class View_MemberNotifications

	init: ->
		@id = 'MemberNotifications'
		@name = 'MemberNotifications'
		@url = '/members/notifications'
		@root = 'notifications'
		@login = DB.get('session')?.login
	
	update: (data) ->
		old_notifs = DB.get 'member.' + @login + '.notifs', []
		new_notifs = Fx.formatNotifications data
		n = Fx.concatNotifications old_notifs, new_notifs
		n = Fx.sortNotifications n
		DB.set 'member.' + @login + '.notifs', n
	
	content: ->
		output = ''
		nbrNotifications = 0
		currDate = ''
		
		data = DB.get 'member.' + @login + '.notifs', null
		return Fx.needUpdate() if !data
		
		time = Math.floor (new Date().getTime() / 1000)
		for n in data
			continue if time < n.date
			newDate = date('D d F', n.date)
			if newDate isnt currDate
				currDate = newDate
				output += '<div class="showtitle">' + currDate + '</div>'
			output += '<div class="event ' + date('D', n.date).toLowerCase() + '">'
			output += '<span class="new">' + __('new') + '</span> ' if !n.seen
			output += n.html
			output += '</div>'
			n.seen = true
			nbrNotifications++	

		# on marque les notifications comme lus
		DB.set 'member.' + @login + '.notifs', data
		$('.notif').html(0).hide()
		Badge.set 'new_notifications', 0
	
		output += __('no_notifications') if nbrNotifications is 0
		return output