var Historic,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Historic = {
  refresh: function() {
    var args, historic, length;
    historic = DB.get('historic');
    length = historic.length;
    args = historic[length - 1].split('.');
    return BS.load.apply(BS, args);
  },
  save: function() {
    var blackpages, historic, length, view;
    historic = DB.get('historic');
    length = historic.length;
    blackpages = ['connection', 'registration', 'menu'];
    view = BS.currentView.id;
    if (historic[length - 1] !== view && !(__indexOf.call(blackpages, view) >= 0)) {
      historic.push(view);
      return DB.set('historic', historic);
    }
  },
  back: function() {
    return console.log('back');
  }
};
