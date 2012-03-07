var Content;

Content = {
  show: function(s, nbrEpisodesTotal) {
    var nbrEpisodesPerSerie, output, remain, titleIcon, visibleIcon;
    nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie;
    visibleIcon = s.hidden ? '../img/arrow_right.gif' : '../img/arrow_down.gif';
    titleIcon = s.hidden ? __('maximise') : __('minimise');
    remain = nbrEpisodesTotal - nbrEpisodesPerSerie;
    output = '';
    output += '<div class="showtitle">';
    output += '<div class="left">';
    output += '<img src="' + visibleIcon + '" class="toggleShow" title="' + titleIcon + '" />';
    output += '<a href="" onclick="BS.load(\'showsDisplay\', \'' + s.url + '\'); return false;" class="showtitle">' + s.title + '</a>';
    if (remain > 0) output += ' <span class="remain">+' + remain + '</span>';
    output += '</div>';
    output += '<div class="right"></div>';
    output += '<div class="clear"></div>';
    output += '</div>';
    return output;
  },
  episode: function(e, s) {
    var date_0, dlSrtLanguage, empty, hidden, imgDownloaded, jours, lang, nbSubs, nbrEpisodesPerSerie, newShow, output, quality, sub, subs, textTitle, texte2, texte3, time, title, url;
    output = '';
    nbrEpisodesPerSerie = DB.get('options').nbr_episodes_per_serie;
    time = Math.floor(new Date().getTime() / 1000);
    jours = Math.floor(time / (24 * 3600));
    date_0 = (24 * 3600) * jours - 2 * 3600;
    newShow = e.date >= date_0 ? ' new' : '';
    hidden = s.hidden ? ' hidden' : '';
    output += '<div class="episode e' + e.global + ' ' + newShow + hidden + '" number="' + e.number + '" season="' + e.season + '" episode="' + e.episode + '" global="' + e.global + '">';
    title = DB.get('options').display_global ? '#' + e.global + ' ' + title : e.title;
    textTitle = title.length > 20 ? ' title="' + title + '"' : '';
    texte2 = __('mark_as_seen');
    output += '<div class="left">';
    output += '<img src="../img/plot_off.png" class="watched action icon-4" title="' + texte2 + '" /> <span class="num">';
    output += '[' + e.number + ']</span> <span class="title"' + textTitle + '>' + Fx.subFirst(title, 20) + '</span>';
    if (newShow) output += ' <span class="new">' + __('new') + '</span>';
    output += '</div>';
    subs = e.subs;
    nbSubs = 0;
    url = "";
    quality = -1;
    lang = "";
    for (sub in subs) {
      dlSrtLanguage = DB.get('options').dl_srt_language;
      if ((dlSrtLanguage === "VF" || dlSrtLanguage === 'ALL') && subs[sub]['language'] === "VF" && subs[sub]['quality'] > quality) {
        quality = subs[sub]['quality'];
        url = subs[sub]['url'];
        lang = subs[sub]['language'];
        nbSubs++;
      }
      if ((dlSrtLanguage === "VO" || dlSrtLanguage === 'ALL') && subs[sub]['language'] === "VO" && subs[sub]['quality'] > quality) {
        quality = subs[sub]['quality'];
        url = subs[sub]['url'];
        lang = subs[sub]['language'];
        nbSubs++;
      }
    }
    quality = Math.floor((quality + 1) / 2);
    if (e.downloaded) {
      imgDownloaded = "folder";
      texte3 = __('mark_as_not_dl');
    } else {
      imgDownloaded = "folder_off";
      texte3 = __('mark_as_dl');
    }
    output += '<div class="right">';
    empty = '<img src="../img/empty.png" alt="hidden" /> ';
    if (e.comments > 0) {
      output += '<img src="../img/comment.png" class="comments action" title="' + __('nbr_comments', [e.comments]) + '" /> ';
    } else {
      output += empty;
    }
    output += '	<img src="../img/' + imgDownloaded + '.png" class="downloaded action" title="' + texte3 + '" /> ';
    if (nbSubs > 0) {
      output += '<img src="../img/srt.png" class="subs action" link="' + url + '" quality="' + quality + '" title="' + __('srt_quality', [lang, quality]) + '" /> ';
    }
    output += '</div>';
    output += '<div class="clear"></div>';
    output += '</div>';
    return output;
  }
};
