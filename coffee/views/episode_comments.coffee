class View_EpisodeComments

	init: (url, season, episode, global) =>
		@id = 'EpisodeComments.' + url + '.' + season + '.' + episode + '.' + global
		@url = '/comments/episode/' + url
		@params = '&season=' + season + '&episode=' + episode
		@show = url
		@season = season
		@episode = episode
		@global = global
		@name = 'EpisodeComments'
		@root = 'comments'
	
	update: (data) ->
		comments = DB.get 'show.' + @show + '.' + @global + '.comments', {}
		
		# récupération de commentaires en cache
		nbrComments = comments.length
		
		# mise à jour du cache
		for i, comment of data
			if i < nbrComments
				continue
			else
				comments[i] = comment
		
		# mise à jour du cache
		DB.set 'show.' + @show + '.' + @global + '.comments', comments
	
	content: ->
		i = 1
		time = ''
		show = ''
		output = '<div class="showtitle">' + show + '</div>';
		
		data = DB.get 'show.' + @show + '.' + @global + '.comments', null
		return Fx.needUpdate() if !data
		
		for n of data
			new_date = date('D d F', data[n].date)
			if new_date isnt time
				time = new_date
				output += '<div class="showtitle">' + time + '</div>'
			
			output += '<div class="event ' + date('D', data[n].date).toLowerCase() + '">'
			output += '<b>' + date('H:i', data[n].date) + '</b> '
			output += '<span class="login">' + data[n].login + '</span> '
			output += '<small>#' + data[n].inner_id + '</small> '
			output += '<small>en réponse à #' + data[n].in_reply_to + '</small> ' if data[n].in_reply_to isnt '0'
			output += '<a href="" class="addInReplyTo" commentId="' + data[n].inner_id + '">répondre</a><br />'
			output += data[n].text
			output += '</div>'
			i++

		output += '<div class="postComment">'
		output += 	'<form method="post" id="postComment">'
		output += 		'<input type="hidden" id="show" value="' + @show + '" />'
		output += 		'<input type="hidden" id="season" value="' + @season + '" />'
		output += 		'<input type="hidden" id="episode" value="' + @episode + '" />'
		output += 		'<input type="hidden" id="inReplyTo" value="0" />'
		output += 		'<textarea name="comment" placeholder="Votre commentaire.."></textarea>'
		output += 		'<input type="submit" name="submit" value="Poster">'
		output += 		'<div id="inReplyToText" style="display:none;">En réponse à #<span id="inReplyToId"></span> '
		output += 			'(<a href="" id="removeInReplyTo">enlever</a>)</div>'
		output += 	'</form>'
		output += 	'<div class="clear"></div>
				   </div>'
		
		output += __('no_comments') if i is 1
		return output

	listen: ->

		# post a show comment
		$('.EpisodeComments').on 'submit', '#postComment', ->
			show = $('#postComment input[id=show]').val()
			season = $('#postComment input[id=season]').val()
			episode = $('#postComment input[id=episode]').val()
			text = $('#postComment textarea').val()
			in_reply_to = $('#postComment input[id=inReplyTo]').val()

			if text isnt ''
				$('#postComment input[type=submit]').val 'Patientez..'
				$('#postComment input[type=submit]').prop 'disabled', true

				params = '&show=' + show + '&season=' + season + '&episode=' + episode + '&text=' + text
				params += '&in_reply_to=' + in_reply_to if in_reply_to isnt '0'
				ajax.post "/comments/post/episode", params, 
					(data) ->
						$('#postComment textarea').val ''
						$('#postComment input[id=inReplyTo]').val 0
						$('#postComment input[type=submit]').val 'Poster'
						$('#postComment input[type=submit]').prop 'disabled', false
						$('#postComment #inReplyToText').hide()
						time = date('D d F')
						day = date('D').toLowerCase()
						hour = date('H:i')
						login = DB.get('session').login
						num = data.comment.id
						showtitle = if time is $('.showtitle').last().text() then '' else '<div class="showtitle">' + time + '</div>' 
						
						output = '<div class="newComment" style="display:none;">'
						output += 	showtitle
						output += 	'<div class="event ' + day + '">'
						output += 		'<b>' + hour + '</b> '
						output += 		'<span class="login">' + login + '</span> '
						output += 		'<small>#' + num + '</small> '
						output += 		'<small>en réponse à #' + in_reply_to + '</small> ' if in_reply_to isnt '0'
						output += 		'<a href="" class="addInReplyTo" commentId="' + num + '">répondre</a><br />'
						output += 		text
						output += 	'</div>'
						output += '</div>'

						$('.postComment').before output
						$('.newComment').slideDown('slow')
					->
						#inputs.removeAttr 'disabled'

			return false

		# anwser to a comment
		$('.EpisodeComments').on 'click', '.addInReplyTo', ->
			commentId = $(this).attr('commentId');
			$('#postComment input[id=inReplyTo]').val commentId
			$('#postComment #inReplyToText').show()
			$('#postComment #inReplyToId').text commentId
			return false

		# do not anwser anymore to a comment
		$('.EpisodeComments').on 'click', '#removeInReplyTo', ->
			$('#postComment input[id=inReplyTo]').val 0
			$('#postComment #inReplyToText').hide()
			return false
