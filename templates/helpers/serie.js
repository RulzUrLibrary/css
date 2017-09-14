var utils = require('./utils.js');

var static = '/static/img/thumbs/'


module.exports = {
  thumb: function(serie) {
    thumb = serie.isbn ? serie.isbn : serie.volumes[0].isbn;
    return static + thumb + '.jpg'
  },
  name: function(serie) {
    if (serie.name) {
      return serie.name;
    } else {
      return serie.title;
    }
  },

  toast: function(serie) {
    if (!serie.volumes) {
      return;
    }
    var i = 0;
    var count = 0;
    for (var i=0; i < serie.volumes.length; i++) {
      if (serie.volumes[i].owned) {
        count++;
      }
    }
    return {
      text: count + ' / ' + i,
      class: count == i ? 'toast-success': 'toast-primary'
    };
  },
  link: function(serie) {
    return serie.isbn ? utils.urlize('books', serie.isbn): utils.urlize('series', serie.id);
  }
};
