class View_Episode

	init: (url, season, episode, global) =>
		@id = 'Episode.' + url + '.' + season + '.' + episode + '.' + global
		@url = '/shows/episodes/' + url
		@params = '&season=' + season + '&episode=' + episode
		@episodes = DB.get 'show.' + url + '.episodes'
		@show = url
		@global = global
		@name = 'Episode'
		@root = 'seasons'
	
	update: (data) ->
		e = data['0']['episodes']['0']
		eps = if @episodes? then @episodes else {}
		ep = if @global of eps then eps[@global] else {}
		ep.comments = e.comments if e.comments?
		ep.date = e.date if e.date?
		ep.description = e.description if e.description?
		#ep.downloaded = e.downloaded if e.downloaded?
		ep.episode = e.episode if e.episode?
		ep.global = e.global if e.global?
		ep.number = e.number if e.number?
		ep.screen = e.screen if e.screen?
		ep.show = e.show if e.show?
		ep.subs = e.subs if e.subs?
		ep.title = e.title if e.title?
		ep.url = @show
		eps[@global] = ep
		DB.set 'show.' + @show + '.episodes', eps
		@episodes = eps
	
	content: ->
		return Fx.needUpdate() if !@episodes?[@global]?
		
		e = @episodes[@global]
		
		title = if DB.get('options').display_global then '#' + e.global + ' ' + e.title else e.title
		
		output = '<div class="title">'
		output += '<div class="fleft200"><a href="" url="' + @show + '" class="showtitle display_show">' + e.show + '</a></div>'
		output += '<div class="fright200 aright">'
		if e.note?
			note = Math.floor e.note.mean
			for i in [1..note]
				output += '<img src="../img/star.gif" /> '
		output += '</div>'
		output += '<div class="clear"></div>'
		output += '</div>'

		output += '<div>'
		output += ' <div class="fleft200">'
		output += '  <span class="num">' + Fx.displayNumber(e.number) + '</span> ' + e.title
		output += ' </div>'
		if e.note?.mean? then output += ' <div class="fright200 aright">' + e.note.mean + '/5 (' + e.note.members + ')' + '</div>'
		output += ' <div class="clear"></div>'
		output += '</div>'

		if e.screen?
			output += '<div style="height: 70px; overflow: hidden; margin-top: 10px;"><img src="' + e.screen + '" style="width: 290px; margin-top: -15px;" /></div>'

		if e.description?
			output += '<div class="title2">' + __('synopsis') + '</div>'
			output += '<div style="text-align: justify; margin-right: 5px;">' + e.description + '</div>'
			#output += ' <br /><i>' + date('D d F', e.date) + '</i>'
		
		if e.subs? and Object.keys(e.subs).length > 0
			output += '<div class="title2">' + __('subtitles') + '</div>'
			nbr_subs = 0
			for n of e.subs
				sub = e.subs[n]
				output += '[' + sub.quality + '] ' + sub.language + ' <a href="" class="subs" title="' + sub.file + '" link="' + sub.url + '">' + Fx.subLast(sub.file, 20) + '</a> (' + sub.source + ')<br />'
				nbr_subs++
		
		output += '<div class="title2">' + __('actions') + '</div>'
		
		# Voir les commentaires
		output += '<a href="" url="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link display_comments">'
		output += '<span class="imgSyncNo"></span>' + __('see_comments', e.comments) + '</a>'
		
		# Marquer comme récupéré ou pas
		if e.downloaded?
			dl = if e.downloaded then 'mark_as_not_dl' else 'mark_as_dl'
			output += '<a href="" show="' + e.url + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '" class="link downloaded">'
			output += '<span class="imgSyncOff"></span>' + __(dl) + '</a>'
		
		return output