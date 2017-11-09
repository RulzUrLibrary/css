module.exports = {
  authors: function(authors) {
    return authors
    .map(function(author) {
      return author.name
    })
    .join(', ');
  }
};
