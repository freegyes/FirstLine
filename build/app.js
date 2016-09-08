Parse.initialize("hM0HusTC50hHwF9ToMM9BYMvb9jA0sPoo8ucQzZp", "JYPke4jXEv0kl4JpmBV9bybpTbzqsHYrfqpVQsui");

    var firstLine = $('#firstLine');
    var author = $('#author');
    var book = $('#book');

    var FirstLine = Parse.Object.extend("FirstLine");
    
    var query = new Parse.Query(FirstLine);
    query.find({
      success: function(results) {

        var rnd = Math.floor(Math.random() * (results.length));

        firstLine.append(results[rnd].attributes.firstline);
        book.append(results[rnd].attributes.book);
        author.append("&mdash; " + results[rnd].attributes.author);
      },

      error: function(error) {
        firstline.append("Something went wrong.");
        book.append("Try again.");
      }
    });