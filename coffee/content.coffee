#
# Objet Content (Génération de contenu)
#
Content = 
	
	# Génère un bloc *série*
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

	# Génère un bloc *season*
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
	
	# Génère un bloc *épisode* (vue membersEpisodes & showsEpisodes)
	episode: (e, showTitle, hidden, start) ->
		output = ''
		
		## INIT ---------------------------------------
		
		# Préparation variables
		time = Math.floor (new Date().getTime() / 1000)
		newShow = if (time - e.date < 2 * 24 * 3600) then ' new' else ''
		hidden = if hidden then ' hidden' else ''
		plot = if (start && parseInt(e.global) < start) then 'tick' else 'empty'
		
		# Titre de l'épisode
		tag = if DB.get('options').display_global then '#' + e.global else Fx.displayNumber(e.number)
		stitle = tag + ' ' + e.title + ' (' + date('D d F', e.date) + ')'
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
		if e.downloaded? && e.downloaded
			imgDownloaded = "folder"
			texte3 = __('mark_as_not_dl')
		else if e.downloaded?
			imgDownloaded = "folder_off"
			texte3 = __('mark_as_dl')

		titleWidth = 140
		titleWidth += 26 if !DB.get('options').display_mean_note
		titleWidth += 20 if !DB.get('options').display_copy_episode
		titleWidth += 20 if !e.downloaded?
		
		## OUTPUT ---------------------------------------
		
		# Titre de la série
		output += '<div class="episode e' + e.global + newShow + hidden + '" number="' + e.number + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '">'

		# Action 'mark as watched'
		output += '<div class="td wrapper-watched">'
		output += '<img src="../img/' + plot + '.png" class="watched action icon-4" title="' + texte2 + '" /> '
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
			output += '<textarea style="display:none;">' + showTitle + ' ' + e.number + '</textarea>'
			output += '<img src="../img/link.png" class="copy action" />'
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
		if e.downloaded?
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

		# Action 'rate this episode'
		output += '<div class="td wrapper-rate">'
		for i in [1..5]
			output += '<img src="../img/star_off.gif" width="10" id="star' + i + '" class="star action" title="' + i + ' /5" />'
		output += '<img src="../img/close3.png" width="10" class="close_stars action" title="' + __('do_not_rate') + '" />'
		output += '</div>'

		# Fermeture
		output += '</div>'
		
		return output
		