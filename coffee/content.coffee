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
	show: (s, nbrEpisodes) ->		
		nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie
		
		visibleIcon = if s.hidden then '../img/arrow_right.gif' else '../img/arrow_down.gif'
		titleIcon = if s.hidden then __('maximise') else __('minimise')
		if s.hidden
			extraIcon = '../img/downarrow.gif'
			extraText = __('show_episodes')
		else
			extraIcon = if s.expanded then '../img/uparrow.gif' else '../img/downarrow.gif'
			extraText = if s.expanded then __('hide_episodes') else __('show_episodes')
				
		
		output = ''
		
		output += '<div class="showtitle">'
		
		output += '<div class="left2"><img src="' + visibleIcon + '" class="toggleShow" title="' + titleIcon + '" /><a href="" onclick="BS.load(\'showsDisplay\', \'' + s.url + '\'); return false;" class="showtitle">' + s.title + '</a>'
		output += ' <img src="../img/archive.png" class="archive" title="' + __("archive") + '" /></div>'
		
		output += '<div class="right2">';
		remain = if s.hidden then nbrEpisodes else nbrEpisodes - nbrEpisodesPerSerie
		hidden = if remain <= 0 then ' style="display: none;"' else '' 
		output += '<span class="toggleEpisodes"' + hidden + '>'
		output += '<span class="labelRemain">' + extraText + '</span>'
		output += ' (<span class="remain">' + remain + '</span>)'
		output += ' <img src="' + extraIcon + '" style="margin-bottom:-2px;" />'
		output += '</span>'
		output += '</div>';
		
		output += '<div class="clear"></div>';
		
		output += '</div>';
		
		return output
	
	##
	 # Génère un bloc *épisode*
	 #
	 # @param	object		Informations d'un *épisode*
	 # @param	object		Informations d'une *série*
	 # @param	integer		Position de l'épisode
	 # @param	integer		Nombre d'épisode affichés
	 # @return 	string		Bloc *épisode*
	 #	
	episode: (e, s, j) ->
		output = ''
		
		# Nouvel épisode
		nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie
		time = Math.floor new Date().getTime() / 1000
		jours = Math.floor time / (24 * 3600)
		date_0 = (24*3600)* jours - 2*3600
		newShow = e.date >= date_0
		classes = ""
		hidden = ""
		classes = if newShow then "new" else ""
		
		if j + 1 > nbrEpisodesPerSerie
			classes += ' hidden'
			hidden = ' style="display: none;"' if !s.expanded or s.hidden
		else if s.hidden
			hidden = ' style="display: none;"'
		output += '<div id="e' + e.global + '" class="episode ' + classes + '"' + hidden + '>'
			
		# Titre de l'épisode
		title = if DB.get('options').display_global then '#' + e.global + ' ' + title else e.title
		textTitle = if (title.length > 20) then ' title="' + title + '"' else ''
		if j + 1 is 1 
			texte2 = __('mark_as_seen')
		else if j + 1 > 1
			texte2 = __('mark_as_seen_pl')
		output += '<div class="left">'
		output += '<img src="../img/plot_red.gif" class="watched" title="' + texte2 + '" /> <span class="num">'
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
			output += '<img src="../img/comment.png" class="comments" title="' + __('nbr_comments', [e.comments]) + '" /> '
		else 
			output += empty
		
		output += '	<img src="../img/' + imgDownloaded + '.png" class="downloaded" title="' + texte3 + '" show="' + e.url + '" global="' + e.global + '" /> '
		
		if nbSubs > 0
			output += '<img src="../img/srt.png" class="subs" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" /> '
		output += '</div>'
			
		# Clear
		output += '<div class="clear"></div>'
			
		output += '</div>'
		
		return output
