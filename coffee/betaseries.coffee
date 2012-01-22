menu = 
	show: -> $('.action').show()
	hide: -> $('.action').hide()
	hideStatus: -> $('#status').hide()
	hideMenu: -> $('#menu').hide()

BS = 
	
	#
	currentPage: null
	
	#
	loadedPage: null
	
	#
	load: ->
		args = Array.prototype.slice.call arguments
		@loadedPage = BS[arguments[0]].apply args.shift(), args
		return this
	
	#	
	refresh: ->
		o = @loadedPage
		
		time = Math.floor(new Date().getTime() / 1000)
		updatePage = DB.get('update.' + o.id, 0)
		update = time - updatePage > 3600 or (@currentPage and @currentPage.id is o.id)
		
		if update
			BS.update -> BS.display()
		else
			BS.display()
			$('#status').attr 'src', '../img/plot_orange.gif'
	
	#		
	update: (callback) ->
		o = @loadedPage
		
		params = o.params || ''
		ajax.post o.url, params, 
			(data) ->
				r = o.root
				tab = data.root[r]
				
				# Opérations supp. sur les données reçues
				tab = o.postData tab if o.postData?
				
				# Mise à jour du cache de la page
				if tab?
					time = Math.floor new Date().getTime() / 1000
					DB.set 'page.' + o.id, JSON.stringify tab
					DB.set 'update.' + o.id, time
				
				# Callback
				callback() if callback?
			->
				# Callback
				callback() if callback?
		
	#			
	display: ->
		o = @loadedPage
		@currentPage = o
		
		# Historique
		historic = JSON.parse DB.get 'historic'
		length = historic.length
		blackpages = ['connection', 'registration']
		if historic[length-1] isnt 'page.' + o.id and !(o.id in blackpages)
			historic.push 'page.' + o.id
			$('#back').show() if length is 1
			DB.set 'historic', JSON.stringify historic
		
		# Recherche d'un cache de page existant
		cache = DB.get 'page.' + o.id, null
		if cache?
			data = JSON.parse cache
			$('#page').html o.content data
		else
			$('#page').html o.content()
		
		# Titre et classe
		$('#title').text __(o.name)
		$('#page').removeClass().addClass o.name
		
		# Réglage de la hauteur du popup
		Fx.updateHeight true
	
	#	
	clean: (id) ->
		DB.remove "page.#{id}"
		DB.remove "update.#{id}"
	
	#
	showsDisplay: (url) ->
		id: "showsDisplay.#{url}"
		name: 'showsDisplay'
		url: "/shows/display/#{url}"
		root: 'show'
		content: (data) ->
			output = '<img src="' + data.banner + '" width="290" height="70" alt="banner" /><br />'
			output += data.title + '<br />'
			output += data.description + '<br />'
			output += data.status + '<br />'
			output += data.note.mean + '/5 (' + data.note.members + ')<br />'
			if data.is_in_account is '1'
				output += '<a href="#' + data.url + '" id="showsRemove">'
				output += '<img src="../img/film_delete.png" class="icon2" />' + __('show_remove') + '</a><br />'
			else
				output += '<a href="#' + data.url + '" id="showsAdd">'
				output += '<img src="../img/film_add.png" class="icon2" />' + __('show_add') + '</a><br />'
			output
		
	#
	showsEpisodes: (url, season, episode) ->
		id: "showsEpisodes.#{url}.#{season}.#{episode}"
		name: 'showsEpisodes'
		url: "/shows/episodes/#{url}"
		params: "&season=#{season}&episode=#{episode}"
		root: 'seasons'
		content: (data) ->
			episode = data['0']['episodes']['0']
			
			if data.avatar isnt ''
				avatar = new Image
				avatar.src = data.avatar
				avatar.onload = ->
					$('#avatar').attr 'src', data.avatar
			
			title = if DB.get 'options.display_global' then "##{episode.global} #{title}" else episode.title
			if episode.downloaded is '1'
				imgDownloaded = "folder"
				texte3 = __('mark_as_not_dl')
			else if episode.downloaded is '0'
				imgDownloaded = "folder_off"
				texte3 = __('mark_as_dl')
				
			output = "<div id=\"#{url}\" season=\"#{data['0']['number']}\" episode=\"#{episode.episode}\">"
			output += '<div style="float:left; width:176px; padding-right:5px;">'
			output += 	"<div class=\"showtitle\">#{episode.show}</div>"
			output += 	"<div><span class=\"num\">[#{episode.number}]</span> #{episode.title}</div>"
			output += 	'<div><span class="date">' + date('D d F', episode.date) + '</span></div>'
			output += 	'<div style="height:10px;"></div>'
			output += 	"<div>#{episode.description}</div>"
			output += '</div>'
			
			output += '<div style="float:left; width:100px; text-align:center;">'
			if episode.screen?
				output += 	'<img src="' + episode.screen + '" width="100" style="border:1px solid #999999; padding:1px; margin-top:18px;" /><br />'
			else
				output += 	'<img src="../img/motif.png" width="100" height="100" style="border:1px solid #999999; padding:1px; margin-top:18px;" /><br />'
			output += 	__('avg_note') + "<br />#{episode.note.mean} (#{episode.note.members})<br />"
			output += 	'<img src="../img/' + imgDownloaded + '.png" class="downloaded" title="' + texte3 + '" /> '
			if episode.comments isnt '0'
				output += 	'<img src="../img/comment.png" class="commentList" title="' + __('nbr_comments', [episode.comments]) + '" />'
			output += '</div>'
			output += '</div>'
			
			output += '<div style="clear:both;"></div>'
			output += '<br /><div class="showtitle">' + __('subtitles') + '</div>'
			nbr_subs = 0
			for n of episode.subs
				sub = episode.subs[n]
				output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />'
				nbr_subs++
			output += __('no_subs') if nbr_subs is 0
			return output
	
	#
	planningMember: (login) ->
		login ?= DB.get 'member.login'
		
		id: "planningMember.#{login}"
		name: 'planningMember'
		url: "/planning/member/#{login}"
		params: "&view=unseen"
		root: 'planning'
		content: (data) ->	
			output = ''
			week = 100
			MAX_WEEKS = 2
			nbrEpisodes = 0
			for e of data
				today = Math.floor new Date().getTime() / 1000
				todayWeek = parseFloat date('W', today)
				actualWeek = parseFloat date('W', data[e].date)
				diffWeek = actualWeek - todayWeek
				plot = if data[e].date < today then "orange" else "red"
				if actualWeek isnt week
					week = actualWeek
					hidden = ""
					if diffWeek < -1 
						w = __('weeks_ago', [Math.abs diffWeek])
					else if diffWeek is -1
						w = __('last_week')
					else if diffWeek is 0
						w = __('this_week')
					else if diffWeek is 1
						w = __('next_week')
					else if diffWeek > 1
						w = __('next_weeks', [diffWeek])
					if diffWeek < -2 or diffWeek > 2
						hidden = ' style="display:none"'
					if nbrEpisodes > 0
						output += '</div>'
					output += '<div class="week"' + hidden + '>'
					output += '<div class="showtitle">' + w + '</div>'
			
				output += '<div class="episode ' + date('D', data[e].date).toLowerCase() + '">'
				
				output += '<div url="' + data[e].url + '" season="' + data[e].season + '" episode="' + data[e].episode + '" class="left">'
				output += '<img src="../img/plot_' + plot + '.gif" /> '
				output += '<span class="show">' + data[e].show + '</span> '
				output += '<span class="num">[' + data[e].number + ']</span>'
				output += '</div>'
				
				output += '<div class="right">'
				output += '<span class="date">' + date('D d F', data[e].date) + '</span>'
				output += '</div>'
				
				output += '</div>'
				
				nbrEpisodes++
			return output
	
	#
	membersInfos: (login) ->
		login ?= DB.get 'member.login'
		myLogin = login is DB.get 'member.login'
		
		id: 'membersInfos.' + login
		name: 'membersInfos'
		url: '/members/infos/' + login
		root: 'member'
		content: (data) ->
			if data.avatar isnt ''
				avatar = new Image
				avatar.src = data.avatar
				avatar.onload = ->
					$('#avatar').attr 'src', data.avatar
			
			output = ''
			output += '<div class="showtitle">' + data.login + '</div>'
			output += '<img src="../img/avatar.png" width="50" id="avatar" style="position:absolute; right:0;" />'
			output += '<div class="episode lun"><img src="../img/infos.png" class="icon"> ' + __('nbr_friends', [data.stats.friends]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/medal.png" class="icon"> ' + __('nbr_badges', [data.stats.badges]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/episodes.png" class="icon"> ' + __('nbr_shows', [data.stats.shows]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/report.png" class="icon"> ' + __('nbr_seasons', [data.stats.seasons]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/script.png" class="icon"> ' + __('nbr_episodes', [data.stats.episodes]) + ' </div>'
			output += '<div class="episode lun"><img src="../img/location.png" class="icon">' + data.stats.progress + ' <small>(' + __('progress') + ')</small></div>'
			
			if myLogin
				output += '<div style="height:11px;"></div>'
				output += '<div class="showtitle">' + __('archived_shows') + '</div>'
				for i of data.shows
					if data.shows[i].archive is "1"
						output += '<div class="episode" id="' + data.shows[i].url + '">'
						output += data.shows[i].title
						output += ' <img src="../img/unarchive.png" class="unarchive" title="' + __("unarchive") + '" />'
						output += '</div>'
			
			if data.is_in_account?
				output += '<div class="showtitle">Actions</div>'
				if data.is_in_account is 0
					output += '<div class="episode"><img src="../img/friend_add.png" id="friendshipimg" style="margin-bottom: -4px;" /> <a href="#" id="addfriend" login="' + data.login + '">' + __('add_to_friends', [data.login]) + '</a></div>'
				else if data.is_in_account is 1
					output += '<div class="episode"><img src="../img/friend_remove.png" id="friendshipimg" style="margin-bottom: -4px;"  /> <a href="#" id="removefriend" login="' + data.login + '">' + __('remove_to_friends', [data.login]) + '</a></div>'
			
			return output
	
	#
	membersEpisodes: (lang) ->
		lang ?= 'all'
		
		id: 'membersEpisodes.' + lang
		name: 'membersEpisodes',
		url: '/members/episodes/' + lang
		root: 'episodes'
		content: (data) ->
			output = ""
			show = ""
			nbrEpisodes = 0
			posEpisode = 1
			nbrEpisodesPerSerie = DB.get 'options.nbr_episodes_per_serie'
			stats = {}
			newTitleShow = true
			for n of data
				if data[n].url of stats
					stats[data[n].url]++
				else
					stats[data[n].url] = 1
			
			for n of data
				# Titre de la série
				if newTitleShow
					# Série minimisée
					hidden_shows = JSON.parse DB.get 'hidden_shows'
					hiddenShow = data[n].url in hidden_shows
					visibleIcon = if hiddenShow then '../img/arrow_right.gif' else '../img/arrow_down.gif'
					titleIcon = if hiddenShow then __('maximise') else __('minimise')
					
					# Episodes supplémentaires affichés
					extra_episodes = JSON.parse DB.get 'extra_episodes'
					extraEpisodes = data[n].url in extra_episodes
					if hiddenShow
						extraIcon = '../img/downarrow.gif'
						extraText = __('show_episodes')
					else
						extraIcon = if extraEpisodes then '../img/uparrow.gif' else '../img/downarrow.gif'
						extraText = if extraEpisodes then __('hide_episodes') else __('show_episodes')
					
					# Ouverture de la série
					output += '<div class="show" id="' + data[n].url + '">'
					output += '<div class="showtitle"><div class="left2"><img src="' + visibleIcon + '" class="toggleShow" title="' + titleIcon + '" /><a href="" onclick="BS.load(\'showsDisplay\', \'' + data[n].url + '\').refresh(); return false;" class="showtitle">' + data[n].show + '</a>'
					output += ' <img src="../img/archive.png" class="archive" title="' + __("archive") + '" /></div>'
					
					output += '<div class="right2">';
					remain = if hiddenShow then stats[data[n].url] else stats[data[n].url] - nbrEpisodesPerSerie
					if newTitleShow
						hidden = if remain <= 0 then ' style="display: none;"' else '' 
						output += '<span class="toggleEpisodes"' + hidden + '>'
						output += '<span class="labelRemain">' + extraText + '</span>'
						output += ' (<span class="remain">' + remain + '</span>)'
						output += ' <img src="' + extraIcon + '" style="margin-bottom:-2px;" />'
						output += '</span>'
					
					output += '</div>';
					output += '<div class="clear"></div>';
					output += '</div>';
					
					show = data[n].show
					posEpisode = 1
				
				# Ajout d'une ligne épisode
				season = data[n].season
				episode = data[n].episode
					
				# Nouvel épisode
				time = Math.floor new Date().getTime() / 1000
				jours = Math.floor time / (24 * 3600)
				date_0 = (24*3600)* jours - 2*3600
				newShow = data[n].date >= date_0
				classes = ""
				hidden = ""
				classes = if newShow then "new_show" else ""
				
				if posEpisode > nbrEpisodesPerSerie
					classes += ' hidden'
					hidden = ' style="display: none;"' if !extraEpisodes or hiddenShow
				else if hiddenShow
					hidden = ' style="display: none;"'
				output += '<div class="episode ' + classes + '"' + hidden + ' season="' + season + '" episode="' + episode + '">'
					
				# Titre de l'épisode
				title = if DB.get 'options.display_global' is 'true' then '#' + data[n].global + ' ' + title else data[n].title
				textTitle = if (title.length > 20) then ' title="' + title + '"' else ''
				if posEpisode is 1 
					texte2 = __('mark_as_seen')
				else if posEpisode > 1
					texte2 = __('mark_as_seen_pl')
				output += '<div class="left">'
				output += '<img src="../img/plot_red.gif" class="watched" title="' + texte2 + '" /> <span class="num">'
				output += '[' + data[n].number + ']</span> <span class="title"' + textTitle + '>' + Fx.subFirst(title, 20) + '</span>'
				if newShow 
					output += ' <span class="new">' + __('new') + '</span>'
				output += '</div>'
						
				# Actions
				subs = data[n].subs
				nbSubs = 0
				url = ""
				quality = -1
				lang = ""
				for sub of subs
					dlSrtLanguage = DB.get 'options.dl_srt_language'
					if (dlSrtLanguage is "VF" or dlSrtLanguage is 'ALL') and subs[sub]['language'] is "VF" and subs[sub]['quality'] > quality
						quality = subs[sub]['quality']
						url = subs[sub]['url']
						lang = subs[sub]['language']
						nbSubs++
					if (dlSrtLanguage is "VO" or dlSrtLanguage is 'ALL') and subs[sub]['language'] is "VO" and subs[sub]['quality'] > quality
						quality = subs[sub]['quality']
						url = subs[sub]['url']
						lang = subs[sub]['language']
						nbSubs++
				
				quality = Math.floor (quality + 1) / 2
				if data[n].downloaded isnt -1
					downloaded = data[n].downloaded is '1'
					if downloaded
						imgDownloaded = "folder"
						texte3 = __('mark_as_not_dl')
					else
						imgDownloaded = "folder_off"
						texte3 = __('mark_as_dl')
				
				output += '<div class="right">'
				empty = '<img src="../img/empty.png" alt="hidden" /> '
				if data[n].comments > 0
					output += '<img src="../img/comment.png" class="commentList" title="' + __('nbr_comments', [data[n].comments]) + '" /> '
				else 
					output += empty
				if data[n].downloaded isnt -1
					output += '<img src="../img/' + imgDownloaded + '.png" class="downloaded" title="' + texte3 + '" /> '
				else 
					output += empty
				if nbSubs > 0
					output += '<img src="../img/srt.png" class="subs" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" /> '
				output += '</div>'
					
				# Clear
				output += '<div class="clear"></div>'
					
				output += '</div>'
					
				# Test pour déterminer si c'est le dernier épisode de la série
				newTitleShow = posEpisode is stats[data[n].url]
				
				# Fermeture de la série
				output += '</div>' if newTitleShow
				
				nbrEpisodes++
				posEpisode++
						
			bgPage.badge.update()
			if nbrEpisodes is 0
				output += __('no_episodes_to_see') 
				output += '<br /><br /><a href="#" onclick="BS.load(\'searchForm\').display(); return false;">'
				output += '<img src="../img/film_add.png" class="icon2" />' + __('add_a_show') + '</a>'
			
			return output
	
	#
	membersNotifications: () ->
		id: 'membersNotifications'
		name: 'membersNotifications'
		url: '/members/notifications'
		root: 'notifications'
		postData: (tab1) ->
			res = tab1
			try
				temp = DB.get 'page.membersNotifications', null
				tab2 = if temp isnt null then JSON.parse temp else []
				res = Fx.concat tab1, tab2
			catch e
		    	console.log e
		    return res
		content: (data) ->
			output = ''
			nbrNotifications = 0
			
			time = ''
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += data[n].html
				output += '</div>'
				nbrNotifications++	
			
			bgPage.badge.update()
			output += __('no_notifications') if nbrNotifications is 0
			return output
	
	#
	commentsEpisode: (url, season, episode) ->
		id: 'commentsEpisode.' + url + '.' + season + '.' + episode
		name: 'commentsEpisode'
		url: '/comments/episode/' + url
		params: '&season=' + season + '&episode=' + episode
		root: 'comments'
		content: (data) ->
			output = ''
			i = 1
			time = ''
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += '<b>' + date('H:i', data[n].date) + '</b> '
				output += '<span class="login">' + data[n].login + '</span> '
				output += '<small>#' + i + '</small><br />'
				output += data[n].text
				output += '</div>'
				i++
			
			output += __('no_comments') if i is 1
			return output
	
	#
	timelineFriends: ->
		id: 'timelineFriends'
		name: 'timelineFriends'
		url: '/timeline/friends'
		params: '&number=10'
		root: 'timeline'
		content: (data) ->
			output = ''
			time = ''
			for n of data
				new_date = date('D d F', data[n].date)
				if new_date isnt time
					time = new_date
					output += '<div class="showtitle">' + time + '</div>'
				
				output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
				output += '<b>' + date('H:i', data[n].date) + '</b> '
				output += '<span class="login">' + data[n].login + '</span> ' + data[n].html
				output += '</div>'
			return output
	
	#
	connection: ->
		id: 'connection'
		name: 'connection'
		content: ->
			menu.hide()
			output = '<form id="connect">'
			output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
			output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
			output += '</table>'
			output += '<div class="valid"><input type="submit" value="' + __('sign_in') + '"> ou '
			output += '	<a href="#" onclick="BS.load(\'registration\').display(); return false;">' + __('sign_up') + '</a></div>'
			output += '</form>'
			return output
	
	#
	registration: ->
		id: 'registration'
		name: 'registration'
		content: ->
			menu.hide()
			output = '<form id="register">'
			output += '<table><tr><td>' + __('login') + '</td><td><input type="text" name="login" id="login" /></td></tr>'
			output += '<tr><td>' + __('password') + '</td><td><input type="password" name="password" id="password" /></td></tr>'
			output += '<tr><td>' + __('repassword') + '</td><td><input type="password" name="repassword" id="repassword" /></td></tr>'
			output += '<tr><td>' + __('email') + '</td><td><input type="text" name="mail" id="mail" /></td></tr>'
			output += '</table>'
			output += '<div class="valid"><input type="submit" value="' + __('sign_up') + '"> ou '
			output += '	<a href="#" onclick="BS.load(\'connection\').display(); return false;">' + __('sign_in') + '</a></div>'
			output += '</form>'
			return output
	
	#
	searchForm: ->
		id: 'searchForm'
		name: 'searchForm'
		content: ->
			output = '<form id="search0">'
			output += '<input type="text" name="terms" id="terms" /> '
			output += '<input type="submit" value="chercher" />'
			output += '</form>'
			output += '<div id="shows-results"></div>'
			output += '<div id="members-results"></div>'
			setTimeout (() -> $('#terms').focus()), 100
			return output
	
	#
	blog: ->
		id: 'blog'
		name: 'blog'
		content: ->
			output = ''
			$.ajax
				type: 'GET'
				url: 'https://www.betaseries.com/blog/feed/'
				dataType: 'xml'
				async: false
				success: (data) ->
					items = $(data).find 'item'
					for i in [0..(Math.min 5, items.length)]
						item = $(items[i])
						
						titleOrig = item.find('title').text()
						title = titleOrig.substring 0, 40
						title += '..' if titleOrig.length > 40
						
						output += '<div class="showtitle">' + title
						#output += ' <span class="date">'+date('D d F', data[n].date)+'</span>';
						output += '</div>'
						
						desc = item.find('description').text()
						linkOrig = item.find('link').text()
						link = '<a href="#" onclick="Fx.openTab(\'' + linkOrig + '\');">(' + __('read_article') + ')</a>'
						output += '<div>' + desc.replace(/<a(.*)a>/, link) + '</div>'
						
						output += '<div style="height:11px;"></div>'
			
			return output
	