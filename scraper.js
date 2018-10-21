const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
let prevHTML;
let nextWord;
// let count = 0;
const entry = new mongoose.Schema({
  word: {type: String, required: true},
  POS: {type: String},
  text: {type: String},
  keywords: {type: Array},
  relatedWords: {type: Array}
})

const Entry = mongoose.model('Entry', entry)

mongoose.connect('mongodb://localhost/etyScrape', (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  scrape("wurlitzer")
});

function scrape(searchTerm) {
  axios.get(`https://www.etymonline.com/word/${searchTerm}`)
  .then(res => {
    let $ = cheerio.load(res.data)
    if ($.html() === prevHTML) {
      // skip agead
      console.log("SKIP")
      // console.log($('.alphabetical__active--FCYcm'))
      nextWord = $('.alphabetical__active--FCYcm').next().next().children()['0'].children[0].data
      console.log("NEXT WORD: ", nextWord)
      scrape(nextWord)
    }
    else {
      prevHTML = $.html();
      $(".word__name--TTbAA").each(function(i, el){
        let title = $(this).text();
        let word = $(this).text().slice(0, title.indexOf("("))
        let POS = $(this).text().slice(title.indexOf("(") + 1, title.length - 1  )
        let siblings = $(this).siblings()
        // console.log(siblings)
        let text = '';
        let keywords = [];
        let relatedWords = []
        $(".related__word--3Si0N").each((i, related) => {
          // console.log(related.children[0].data);
          relatedWords.push(related.children[0].data)
        })
        $(siblings).each((i, sib) => {
          if (sib.name === 'section') {
            $(sib.children).each((i, el) => {
              $(el.children).each((i, p) => {
                if (p.data) {
                  text += p.data;
                }
                else if (p.children[0]) {
                  if( p.children[0].data) { 
                    text += p.children[0].data;
                    keywords.push(p.children[0].data)
                  }
                }
              })
            })
            Entry.create({word, POS, text, keywords, relatedWords})
            .then(entry => console.log(entry.word))
            .catch(err => console.log("err: ", err))
          }
        })
      })
      // FIND THE NEXT WORD TO SEARCH 
      nextWord = $('.alphabetical__active--FCYcm').next().children()['0'].children[0].data
      
      if (nextWord) {
        setTimeout(() => {scrape(nextWord)}, 0)
      }
    }
  })

}

//@TODO GRAB RELATED ENTRIES