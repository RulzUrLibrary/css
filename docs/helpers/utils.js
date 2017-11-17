function urlize() {
  return '/' + [].join.call(arguments, '/')
}

module.exports = {
  url: function() {
    return urlize.apply(this, [].slice.call(arguments, 0, -1));
  },
  urlize: urlize
};
