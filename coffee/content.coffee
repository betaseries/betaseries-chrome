##
 # Génération de contenu
 #
Content = 
	
	##
	 # Génère un bloc *série*
	 #
	 # @param	object		Informations d'une *série*
	 # @return 	string		Bloc *série*
	 #
	show: (s, nbrEpisodesTotal) ->		
		visibleIcon = if s.hidden then '../img/arrow_right.gif' else '../img/arrow_down.gif'
		titleIcon = if s.hidden then __('maximise') else __('minimise')

		output = ''
		
		output += '<div class="showtitle">'
		
		output += '<div class="left">'
		output += '<img src="' + visibleIcon + '" class="toggleShow" title="' + titleIcon + '" />'
		output += '<a href="" url="' + s.url + '" class="showtitle display_show">' + Fx.subFirst(s.title, 25) + '</a>'
		output += ' <span class="remain remain-right">' + nbrEpisodesTotal + ' </span>'
		output += '</div>'
		
		output += '<div class="right"></div>';
		
		output += '<div class="clear"></div>';
		
		output += '</div>';
		
		return output

	##
	 # Génère un bloc *season*
	 #
	 # @param	object		Informations d'une *série*
	 # @return 	string		Bloc *série*
	 #
	season: (n, nbrEpisodesTotal, hidden) ->		
		visibleIcon = if hidden then '../img/arrow_right.gif' else '../img/arrow_down.gif'
		titleIcon = if hidden then __('maximise') else __('minimise')
		remain = if hidden then nbrEpisodesTotal else 0
		remainHidden = if remain <= 0 then ' hidden' else ''

		output = ''
		
		output += '<div class="title2">'
		
		output += '<div class="left">'
		output += '<img src="' + visibleIcon + '" class="toggleSeason" title="' + titleIcon + '" />'
		output += 'Saison ' + n + ' <span class="remain remain-right' + remainHidden + '">' + remain + ' </span>'
		output += '</div>'
		
		output += '<div class="right"></div>';
		
		output += '<div class="clear"></div>';
		
		output += '</div>';
		
		return output
	
	##
	 # Génère un bloc *épisode* (vue membersEpisodes)
	 #
	 # @param	object		Informations d'un *épisode*
	 # @param	object		Informations d'une *série*
	 # @param	integer		Position de l'épisode
	 # @return 	string		Bloc *épisode*
	 #	
	episode: (e, s) ->
		output = ''
		
		## INIT ---------------------------------------
		
		# Préparation variables
		time = Math.floor (new Date().getTime() / 1000)
		newShow = if (time - e.date < 2 * 24 * 3600) then ' new' else ''
		hidden = if s.hidden then ' hidden' else ''

		# Titre de l'épisode
		tag = if DB.get('options').display_global then '#' + e.global else Fx.displayNumber(e.number)
		stitle = tag + ' ' + title + ' (' + date('D d F', e.date) + ')'
		texte2 = __('mark_as_seen')

		subs = e.subs
		nbSubs = 0
		url = ""
		quality = -1
		lang = ""
		for sub of subs
			dlSrtLanguage = DB.get('options').dl_srt_language
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
		if e.downloaded
			imgDownloaded = "folder"
			texte3 = __('mark_as_not_dl')
		else
			imgDownloaded = "folder_off"
			texte3 = __('mark_as_dl')

		titleWidth = 140
		titleWidth += 26 if !DB.get('options').display_mean_note
		titleWidth += 20 if !DB.get('options').display_copy_episode
		
		## OUTPUT ---------------------------------------
		
		# Titre de la série
		output += '<div class="episode e' + e.global + newShow + hidden + '" number="' + e.number + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '">'

		# Action 'mark as watched'
		output += '<div class="td wrapper-watched">'
		output += '<img src="../img/empty.png" class="watched action icon-4" title="' + texte2 + '" /> '
		output += '</div>'

		# Note moyenne de l'épisode
		if DB.get('options').display_mean_note
			output += '<div class="td wrapper-mean-note">'
			output += Fx.displayNote(e.note)
			output += '</div>'
		
		# Action 'copy in clipboard'
		if DB.get('options').display_copy_episode
			output += '<div class="td wrapper-copy-clipboard">'
			output += '<a href="" title="' + title + '" class="invisible copy_episode">'
			output += '<textarea style="display:none;">' + s.title + ' ' + e.number + '</textarea>'
			output += '<img src="../img/link.png" class="copy" />'
			output += '</a>'
			output += '</div>'
		
		# Titre de l'épisode
		output += '<div class="td wrapper-title" style="width: ' + titleWidth + 'px">'
		output += '<span class="num">' + tag + '</span> '
		output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" title="' + stitle + '" class="epLink display_episode">'
		output += e.title + '</a>'
		output += '</div>'
		
		# Indicateur 'NEW'
		output += '<div class="td wrapper-new">'
		if newShow
			output += '<span class="new">' + __('new') + '</span>'
		output += '</div>'
		
		# Action 'show comments'
		output += '<div class="td wrapper-comments">'
		if e.comments > 0
			output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" title="' + __('nbr_comments', [e.comments]) + '" class="invisible display_comments">'
			output += '<img src="../img/comments.png" class="comments action" />'
			output += '</a>'
		else 
			output += '<img src="../img/empty.png" alt="hidden" />'
		output += '</div>'
		
		# Action 'mark as (not) recover'
		output += '<div class="td wrapper-recover">'
		output += '<img src="../img/' + imgDownloaded + '.png" class="downloaded action" title="' + texte3 + '" />'
		output += '</div>'

		# Action 'download best subtitle'
		output += '<div class="td wrapper-subtitles">'
		if nbSubs > 0
			output += '<img src="../img/page_white_text.png" class="subs action" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" />'
		else
			output += '<img src="../img/empty.png" alt="hidden" />'
		output += '</div>'

		# Fermeture
		output += '</div>'
		
		return output

	##
	 # Génère un bloc *épisode* (vue showsEpisodes)
	 #
	 # @param	object		Informations d'un *épisode*
	 # @param	object		Informations d'une *série*
	 # @param	integer		Position de l'épisode
	 # @return 	string		Bloc *épisode*
	 #	
	episode2: (e, hidden, start) ->
		output = ''
		
		# Nouvel épisode
		time = Math.floor new Date().getTime() / 1000
		jours = Math.floor time / (24 * 3600)
		date_0 = (24*3600)* jours - 2*3600
		newShow = if e.date >= date_0 then ' new' else ''
		hidden = if hidden then ' hidden' else ''
		
		output += '<div class="episode e' + e.global + newShow + hidden + '" number="' + e.number + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '">'
			
		# Titre de l'épisode
		title = if DB.get('options').display_global then '#' + e.global + ' ' + e.title else e.title
		stitle = title + ' (' + date('D d F', e.date) + ')'
		texte2 = __('mark_as_seen')
		plot = if parseInt(e.global) < start then 'tick' else 'empty'
		output += '<div class="left">'
		output += '<img src="../img/' + plot + '.png" class="watched action icon-4" title="' + texte2 + '" /> '
		output += '<span class="num">' + Fx.displayNumber(e.number) + '</span> '
		output += '<a href="#" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" title="' + stitle + '" class="epLink display_episode">'
		output += Fx.subFirst(title, 20) + '</a>'
		if newShow 
			output += ' <span class="new">' + __('new') + '</span>'
		output += '</div>'
				
		# Actions
		subs = e.subs
		nbSubs = 0
		url = ""
		quality = -1
		lang = ""
		for sub of subs
			dlSrtLanguage = DB.get('options').dl_srt_language
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
		if e.downloaded
			imgDownloaded = "folder"
			texte3 = __('mark_as_not_dl')
		else
			imgDownloaded = "folder_off"
			texte3 = __('mark_as_dl')
		
		output += '<div class="right">'
		empty = '<img src="../img/empty.png" alt="hidden" /> '
		if e.comments > 0
			output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" title="' + __('nbr_comments', [e.comments]) + '" class="invisible display_comments">'
			output += '<img src="../img/comments.png" class="comments action" /> '
			output += '</a>'
		else 
			output += empty
		
		output += '	<img src="../img/' + imgDownloaded + '.png" class="downloaded action" title="' + texte3 + '" /> '
		
		if nbSubs > 0
			output += '<img src="../img/page_white_text.png" class="subs action" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" /> '
		output += '</div>'
			
		# Clear
		output += '<div class="clear"></div>'
			
		output += '</div>'
		
		return output
