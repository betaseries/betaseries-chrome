var ajax, bgPage;

bgPage = chrome.extension.getBackgroundPage();

ajax = {
  url_api: "https://api.betaseries.com",
  site_url: "https://www.betaseries.com",
  key: "6db16a6ffab9",
  post: function(category, params, successCallback, errorCallback) {
    var member, token;
    if (params == null) params = '';
    member = DB.get('member', {});
    token = member.token === null ? '' : "&token=" + member.token;
    $('#sync').show();
    return $.ajax({
      type: "POST",
      url: this.url_api + category + ".json",
      data: "key=" + this.key + params + token,
      dataType: "json",
      success: function(data) {
        $('#status').attr('src', '../img/plot_green.gif');
        $('#sync').hide();
        if (successCallback != null) return successCallback(data);
      },
      error: function() {
        $('#sync').hide();
        $('#status').attr('src', '../img/plot_red.gif');
        if (errorCallback != null) return errorCallback();
      }
    });
  }
};
