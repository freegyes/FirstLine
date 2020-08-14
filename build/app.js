var firstLine = $('#firstLine');
var author = $('#author');
var book = $('#book');

$.getJSON( "http://first-moustache-unicorn.s3-website.eu-central-1.amazonaws.com/firstLines.json", function( data ) {
  var rnd = Math.floor(Math.random() * (data.length));

  firstLine.append(data[rnd].firstline);
  book.append(data[rnd].book);
  author.append("&mdash; " + data[rnd].author);
});