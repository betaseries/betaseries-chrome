var ajax, bgPage;

bgPage = chrome.extension.getBackgroundPage();

ajax = {
  url_api: "https://api.betaseries.com",
  site_url: "https://www.betaseries.com",
  key: "6db16a6ffab9",
  post: function(category, params, successCallback, errorCallback) {
    var member, token, useragent;
    if (params == null) params = '';
    member = DB.get('member', {});
    token = member.token === null ? '' : "&token=" + member.token;
    useragent = "chromeseries-" + Fx.getVersion();
    $('#sync').attr('src', '../img/sync.gif');
    return $.ajax({
      type: "POST",
      url: this.url_api + category + ".json",
      data: "user-agent=" + useragent + "&key=" + this.key + params + token,
      dataType: "json",
      success: function(data) {
        $('#sync').attr('src', '../img/sync.png');
        if (successCallback != null) return successCallback(data);
      },
      error: function() {
        $('#sync').attr('src', '../img/sync.png');
        if (errorCallback != null) return errorCallback();
      }
    });
  }
};
