$(document).ready ->

	bgPage = chrome.extension.getBackgroundPage()
	
	$('*[title]').live
		mouseenter: ->
			title = $(this).attr 'title'
			$('#help').show()
			$('#help-text').html title
		mouseleave: ->
			$('#help').hide()
			$('#help-text').html ''
	
	## Marquer un ou des épisodes comme vu(s)
	$('.watched').live
		click: -> 
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			login = DB.get('session').login
			
			enable_ratings = DB.get('options').enable_ratings
			
			# On cache les div
			nodes = []
			while e.hasClass 'episode'
				# Notation d'un épisode
				if enable_ratings
					# on enlève la possibilité de re-marquer comme vu (alors que c'est en cours)
					$(e).css 'background-color', '#f5f5f5'
					$(e).find('.watched').removeClass 'watched'
					
					# affichage des étoiles
					nodeRight = $(e).find '.right'
					content = ""
					for i in [1..5]
						content += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star" title="' + i + ' /5" />'
					
					content += '<img src="../img/archive.png" width="10" class="close_stars" title="' + __('do_not_rate') + '" />'
					nodeRight.html content
							
				else
					nodes.push e
					
				e = e.prev()
					
			if !enable_ratings
				nodes.reverse()
				es = clean nodes
				
				# on marque comme vu SANS noter
				params = "&season=" + season + "&episode=" + episode
				ajax.post "/members/watched/" + show, params, 
					->
						DB.set 'member.' + login + '.episodes', es
						Fx.toRefresh 'timelineFriends'
						bgPage.Badge.updateCache()
					-> 
						registerAction "/members/watched/" + show, params
		
		mouseenter: ->
			node = $(this).closest('.episode')
			while node.hasClass 'episode'
				node.find('.watched').css 'opacity', 1
				node = node.prev()
			
		mouseleave: ->
			node = $(this).closest('.episode')
			while node.hasClass 'episode'
				node.find('.watched').css 'opacity', 0.5
				node = node.prev()
	
	clean = (nodes) ->
		login = DB.get('session').login
		show = nodes[0].closest('.show').attr 'id'
		memberEpisodes = DB.get 'member.' + login + '.episodes'
		s = DB.get('member.' + login + '.shows')[show]
		es = DB.get 'show.' + show + '.episodes'
		
		# nombre d'épisodes affichés
		nbrEpisodes = $('#' + show).find('.episode').length
		
		# on sélectionne le dernier épisode et on calcule le nextGlobal
		nextGlobal = $('#' + show).find('.episode').last().attr 'global'
		nextGlobal = parseInt(nextGlobal) + 1
		
		nbr = 0
		for node, i in nodes				
			# on met à jour le cache
			memberEpisodes[show].start = "" + (parseInt(node.attr 'global') + 1)
			memberEpisodes[show].nbr_total--
			if memberEpisodes[show].nbr_total is 0
				delete memberEpisodes[show]
			
			# on fait disparaître l'actuel
			node.slideToggle 'slow', -> $(@).remove()
			
			# on fait apparaitre le suivant
			if es[nextGlobal]?
				episode = Content.episode es[nextGlobal], s
				$('#' + show).append episode
			else
				nbrEpisodes--
			
			nextGlobal++
			nbr++
		
		# s'il n'y a plus d'épisodes à voir dans la série, on la cache
		nbr = parseInt($('#' + show + ' .remain').text()) - nbr
		if nbrEpisodes is 0 and nbr <= 0
			$('#' + show).slideToggle 'slow', -> $(@).remove()
		else
			$('#' + show + ' .remain').text('+' + nbr) if nbr > 0
		
		Fx.updateHeight()
				
		return memberEpisodes
	
	# Star HOVER
	$('.star').live
		mouseenter: ->
			nodeStar = $(this)
			while nodeStar.hasClass 'star'
				nodeStar.attr 'src', '../img/star.gif'
				nodeStar = nodeStar.prev()
		mouseleave: ->
			nodeStar = $(this)
			while nodeStar.hasClass 'star'
				nodeStar.attr 'src', '../img/star_off.gif'
				nodeStar = nodeStar.prev()
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest '.episode'
			es = clean [e]
			season = e.attr 'season'
			episode = e.attr 'episode'
			login = DB.get('session').login
			
			# On marque comme vu EN notant
			rate = $(this).attr('id').substring 4
			params = "&season=" + season + "&episode=" + episode + "&note=" + rate
			ajax.post "/members/watched/" + show, params, 
				-> 
					DB.set 'member.' + login + '.episodes', es
					Fx.toRefresh 'timelineFriends'
					bgPage.Badge.updateCache()
				->
					registerAction "/members/watched/" + show, params
		
	# Close Stars HOVER
	$('.close_stars').live
		click: ->
			s = $(this).closest '.show'
			show = s.attr 'id'
			e = $(this).closest '.episode'
			es = clean [e]
			season = e.attr 'season'
			episode = e.attr 'episode'
			login = DB.get('session').login
			
			# On marque comme vu SANS noter
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/watched/" + show, params, 
				->
					DB.set 'member.' + login + '.episodes', es
					Fx.toRefresh 'timelineFriends'
					bgPage.Badge.updateCache()
				->
					registerAction "/members/watched/" + show, params
	
	## Marquer un épisode comme téléchargé ou pas
	$('.downloaded').live
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			
			# mise à jour du cache
			es = DB.get 'show.' + show + '.episodes'
			downloaded = es[global].downloaded
			es[global].downloaded = !downloaded
			DB.set 'show.' + show + '.episodes', es
			
			# modification de l'icône
			if downloaded
				$(this).attr 'src', '../img/folder_off.png'
			else 
				$(this).attr 'src', '../img/folder.png'
			
			# envoi de la requête
			params = "&season=" + season + "&episode=" + episode
			ajax.post "/members/downloaded/" + show, params, null,
				-> registerAction "/members/downloaded/" + show, params
			
	## Accéder à la liste des commentaires d'un épisode
	$('.comments').live
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			BS.load('commentsEpisode', show, season, episode, global)
	
	## Accéder à la fiche d'un épisode
	$('.num').live
		click: ->
			s = $(this).closest('.show')
			show = s.attr 'id'
			e = $(this).closest('.episode')
			season = e.attr 'season'
			episode = e.attr 'episode'
			global = e.attr 'global'
			BS.load('showsEpisodes', show, season, episode, global)

		mouseenter: -> 
			$(this).css 'cursor', 'pointer'
			$(this).css 'color', '#900'
			
		mouseleave: -> 
			$(this).css 'cursor', 'auto'
			$(this).css 'color', '#1a4377'
	
	## Télécharger les sous-titres d'un épisode
	$('.subs').live
		click: -> Fx.openTab $(this).attr 'link'
	
	## Archiver une série
	$('.archive').live
		click: ->
			show = $(this).parent().parent().parent().attr 'id'
			
			# On efface la série tout de suite
			$('#' + show).slideUp()
			
			ajax.post "/shows/archive/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
				-> registerAction "/shows/archive/" + show, ""
			
			Fx.updateHeight()
			return false
	
	## Sortir une série des archives
	$('.unarchive').live
		click: ->
			show = $(this).parent().attr 'id'
			
			# On ajoute la série tout de suite
			$('#' + show).hide()
			
			ajax.post "/shows/unarchive/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
				-> registerAction "/shows/unarchive/" + show, ""
			
			Fx.updateHeight()
			return false
	
	## Ajoute à mes séries
	$('#showsAdd').live
		click: ->
			show = $(this).attr('href').substring 1
			
			# On ajoute la série tout de suite
			$('#showsAdd').html __('show_added')
			
			ajax.post "/shows/add/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
				-> registerAction "/shows/add/" + show, ""
			
			return false
	
	## Retirer de mes séries
	$('#showsRemove').live
		click: ->
			show = $(this).attr('href').substring 1
			
			# On retire la série tout de suite
			$('#showsRemove').html __('show_removed')
			
			ajax.post "/shows/remove/" + show, "", 
				->
					Fx.toRefresh 'membersEpisodes.all'
					Fx.toRefresh 'membersInfos.' + DB.get('session').login
					bgPage.Badge.update()
				-> registerAction "/shows/remove/" + show, ""
			
			return false
	
	## Se connecter
	$('#connect').live
		submit: ->
			login = $('#login').val()
			password = hex_md5 $('#password').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password
			ajax.post "/members/auth", params, 
				(data) ->
					if data.root.member?
						message('')
						$('#connect').remove()
						token = data.root.member.token
						DB.set 'session', 
							login: login
							token: data.root.member.token
						menu.show()
						$('#back').hide()
						BS.load('membersEpisodes')
					else
						$('#password').attr 'value', ''
						message '<img src="../img/inaccurate.png" /> ' + __('wrong_login_or_password')
						inputs.removeAttr 'disabled'
				->
					$('#password').attr 'value', ''
					inputs.removeAttr 'disabled'
					
			return false
	
	## S'inscrire
	$('#register').live
		submit: ->
			login = $('#login').val()
			password = $('#password').val()
			repassword = $('#repassword').val()
			mail = $('#mail').val()
			inputs = $(this).find('input').attr {disabled: 'disabled'}
			params = "&login=" + login + "&password=" + password + "&mail=" + mail
			pass = true
			if password isnt repassword
				pass = false
				message '<img src="../img/inaccurate.png" /> ' + __("password_not_matching")
			if login.length > 24
				pass = false
				message '<img src="../img/inaccurate.png" /> ' + __("long_login")
			if pass
				ajax.post "/members/signup", params, 
					(data) ->
						if data.root.errors.error
							err = data.root.errors.error
							#console.log "error code : " + err.code
							message '<img src="../img/inaccurate.png" /> ' + __('err' + err.code)
							$('#password').attr 'value', ''
							$('#repassword').attr 'value', ''
							inputs.removeAttr 'disabled'
						else
							BS.load('connection').display()
							$('#login').val login
							$('#password').val password
							$('#connect').trigger 'submit'
					->
						$('#password').attr 'value', ''
						$('#repassword').attr 'value', ''
						inputs.removeAttr 'disabled'
			else
				$('#password').attr 'value', ''
				$('#repassword').attr 'value', ''
				inputs.removeAttr 'disabled'
			
			return false
	
	## Faire une recherche de membre
	$('#searchForMember').live
		submit: ->
			terms = $('#terms').val()
			#var inputs = $(this).find('input').attr {disabled: 'disabled'}
			
			params = "&login=" + terms
			ajax.post "/members/search", params, 
				(data) ->
					content = '<div class="showtitle">' + __('members') + '</div>'
					members = data.root.members
					if Object.keys(members).length > 0
						for n of members
							member = members[n]
							content += '<div class="episode"><a href="#" onclick="BS.load(\'membersInfos\', \'' + member.login + '\'); return false;">' + Fx.subFirst(member.login, 25) + '</a></div>'
					else
						content += '<div class="episode">' + __('no_members_found') + '</div>'
					$('#results').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			return false
	
	## Faire une recherche de membre
	$('#searchForShow').live
		submit: ->
			terms = $('#terms').val()
			#var inputs = $(this).find('input').attr {disabled: 'disabled'}
			
			params = "&title=" + terms
			ajax.post "/shows/search", params, 
				(data) ->
					content = '<div class="showtitle">' + __('shows') + '</div>'
					shows = data.root.shows
					if Object.keys(shows).length > 0
						for n of shows
							show = shows[n]
							content += '<div class="episode"><a href="#" onclick="BS.load(\'showsDisplay\', \'' + show.url + '\'); return false;" title="' + show.title + '">' + Fx.subFirst(show.title, 25) + '</a></div>'
					else
						content += '<div class="episode">' + __('no_shows_found') + '</div>'
					$('#results').html content
					Fx.updateHeight()
				->
					#inputs.removeAttr 'disabled'
			
			return false
	
	## Enregistrer une action offline
	registerAction = (category, params) ->
		console.log "action: " + category + params
	
	## Ajouter un ami
	$('#addfriend').live
		click: ->
			login = $(this).attr 'login'
			ajax.post "/members/add/" + login, '', (data) ->
				$('#addfriend').text __('remove_to_friends', [login])
				$('#addfriend').attr 'href', '#removefriend'
				$('#addfriend').attr 'id', 'removefriend'
				$('#friendshipimg').attr 'src', '../img/friend_remove.png'
				Fx.toRefresh 'membersInfos.' + DB.get('session').login
				Fx.toRefresh 'membersInfos.' + login
				Fx.toRefresh 'timelineFriends'
			return false
	
	## Enlever un ami
	$('#removefriend').live
		click: ->
			login = $(this).attr 'login'
			ajax.post "/members/delete/" + login, '', (data) ->
				$('#removefriend').text __('add_to_friends', [login])
				$('#removefriend').attr 'href', '#addfriend'
				$('#removefriend').attr 'id', 'addfriend'
				$('#friendshipimg').attr 'src', '../img/friend_add.png'
				Fx.toRefresh 'membersInfos.' + DB.get('session').login
				Fx.toRefresh 'membersInfos.' + login
				Fx.toRefresh 'timelineFriends'
			return false
	
	## Maximiser/minimiser une série*/
	$('.toggleShow').live
		click: ->
			show = $(this).closest('.show')
			showName = $(show).attr 'id'
			nbr_episodes_per_serie = DB.get('options').nbr_episodes_per_serie
			login = DB.get('session').login
			shows = DB.get 'member.' + login + '.shows'
			hidden = shows[showName].hidden
			shows[showName].hidden = !hidden
			DB.set 'member.' + login + '.shows', shows
				
			$(show).find('.episode').slideToggle()
			
			remain = parseInt show.find('.remain').text()
			
			if shows[showName].hidden
				$(this).attr 'src', '../img/arrow_right.gif'
				remain += nbr_episodes_per_serie
			else
				$(this).attr 'src', '../img/arrow_down.gif'
				remain -= nbr_episodes_per_serie
			
			remain = '+' + remain if remain > 0
			if remain > 0
				show.find('.remain').removeClass 'hidden' 
			else
				show.find('.remain').addClass 'hidden' 
			show.find('.remain').text remain
			
			Fx.updateHeight()
			
	## HEADER links
	$('#logoLink')
		.click(-> Fx.openTab ajax.site_url, true)
		.attr 'title', __("logo")
	
	$('#versionLink')
		.click(-> Fx.openTab 'https://chrome.google.com/webstore/detail/dadaekemlgdonlfgmfmjnpbgdplffpda', true)
		.attr 'title', __("version")
	
	## MENU actions
	$('#back').click ->
			historic = DB.get 'historic'
			if (length = historic.length) >= 2
				historic.pop()
				BS.back()
				DB.set 'historic', historic
				$(this).hide() if length is 2
			return false
		.attr 'title', __("back")
	
	$('#close')
		.click(-> window.close())
		.attr 'title', __('close')
	
	$('#sync')
		.click(-> BS.refresh())
		.attr 'title', __('sync')
	
	$('#menu')
		.click ->
			if BS.currentView.id is 'menu'
				Historic.refresh()
			else
				BS.load('menu');
		.attr 'title', __('menu')
		
	$('#trash')
		.click ->
			Cache.remove()
			$(this).hide()
		.attr 'title', __('trash')
		
	## Afficher le message de confirmation
	message = (content) -> $('#message').html content
	
	## INIT
	DB.init()
		
	# Réglage de la hauteur du popup
	Fx.updateHeight true
	
	# récupération du numéro de version
	$('#versionLink').text Fx.getVersion()
	
	if bgPage.connected()
		badgeType = DB.get('badge').type
		BS.load badgeType
	else
		BS.load 'connection'
