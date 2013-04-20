class View_Blog
	
	init: ->
		@id = 'Blog'
		@name = 'Blog'
	
	update: ->
		$.ajax
			type: 'GET'
			url: 'https://www.betaseries.com/blog/feed/'
			dataType: 'xml'
			async: false
			success: (data) ->
				items = $(data).find 'item'
				blog = []
				for i in [0..(Math.min 10, items.length)]
					item = $(items[i])
					article = {}
					article.title = item.find('title').text()
					article.description = item.find('description').text()
					article.link = item.find('link').text()
					blog.push article
				# on met à jour le cache
				DB.set 'blog', blog
				# on mets à jour l'affichage
				BS.display()
	
	content: ->
		output = ''
		
		data = DB.get 'blog', null
		return Fx.needUpdate() if !data
		
		for article, i in data
			title = article.title.substring 0, 40
			title += '..' if article.title.length > 40
			
			output += '<div class="showtitle">' + title
			#output += ' <span class="date">'+date('D d F', data[n].date)+'</span>';
			output += '</div>'
			
			link = '<a href="#" link="' + article.link + '" class="display_postblog">(' + __('read_article') + ')</a>'
			output += '<div>' + article.description.replace(/<a(.*)a>/, link) + '</div>'
			
			output += '<div style="height:11px;"></div>'
					
		return output

	listen: ->

		# Open blog article
		$('.display_postblog').on 'click', ->
			event.preventDefault()
			link = $(@).attr 'link'
			Fx.openTab link, true
