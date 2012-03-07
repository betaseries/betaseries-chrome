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
		nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie
		
		visibleIcon = if s.hidden then '../img/arrow_right.gif' else '../img/arrow_down.gif'
		titleIcon = if s.hidden then __('maximise') else __('minimise')
		remain = nbrEpisodesTotal - nbrEpisodesPerSerie
		
		output = ''
		
		output += '<div class="showtitle">'
		
		output += '<div class="left">'
		output += '<img src="' + visibleIcon + '" class="toggleShow" title="' + titleIcon + '" />'
		output += '<a href="" onclick="BS.load(\'showsDisplay\', \'' + s.url + '\'); return false;" class="showtitle">' + s.title + '</a>'
		output += ' <span class="remain">+' + remain + '</span>' if remain > 0
		output += '</div>'
		
		output += '<div class="right"></div>';
		
		output += '<div class="clear"></div>';
		
		output += '</div>';
		
		return output
	
	##
	 # Génère un bloc *épisode*
	 #
	 # @param	object		Informations d'un *épisode*
	 # @param	object		Informations d'une *série*
	 # @param	integer		Position de l'épisode
	 # @return 	string		Bloc *épisode*
	 #	
	episode: (e, s) ->
		output = ''
		
		# Nouvel épisode
		nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie
		time = Math.floor new Date().getTime() / 1000
		jours = Math.floor time / (24 * 3600)
		date_0 = (24*3600)* jours - 2*3600
		newShow = if e.date >= date_0 then ' new' else ''
		hidden = if s.hidden then ' hidden' else ''
		
		output += '<div class="episode e' + e.global + ' ' + newShow + hidden + '" number="' + e.number + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '">'
			
		# Titre de l'épisode
		title = if DB.get('options').display_global then '#' + e.global + ' ' + title else e.title
		textTitle = if (title.length > 20) then ' title="' + title + '"' else ''
		texte2 = __('mark_as_seen')
		output += '<div class="left">'
		output += '<img src="../img/plot_off.png" class="watched action icon-4" title="' + texte2 + '" /> <span class="num">'
		output += '[' + e.number + ']</span> <span class="title"' + textTitle + '>' + Fx.subFirst(title, 20) + '</span>'
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
			output += '<img src="../img/comment.png" class="comments action" title="' + __('nbr_comments', [e.comments]) + '" /> '
		else 
			output += empty
		
		output += '	<img src="../img/' + imgDownloaded + '.png" class="downloaded action" title="' + texte3 + '" /> '
		
		if nbSubs > 0
			output += '<img src="../img/srt.png" class="subs action" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" /> '
		output += '</div>'
			
		# Clear
		output += '<div class="clear"></div>'
			
		output += '</div>'
		
		return output
