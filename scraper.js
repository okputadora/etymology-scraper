const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');

// let count = 0;
const entry = new mongoose.Schema({
  word: {type: String, required: true},
  POS: {type: String},
  text: {type: String},
  keywords: {type: Array}
})

const Entry = mongoose.model('Entry', entry)

mongoose.connect('mongodb://localhost/etyScrape', (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  scrape("amend")

});

function scrape(searchTerm) {
  axios.get(`https://www.etymonline.com/word/${searchTerm}`)
  .then(res => {
    let $ = cheerio.load(res.data)
    $(".word__name--TTbAA").each(function(i, el){
      let title = $(this).text();
      let word = $(this).text().slice(0, title.indexOf("("))
      let POS = $(this).text().slice(title.indexOf("(") + 1, title.length - 1  )
      let siblings = $(this).siblings()
      // console.log(siblings)
      let text = '';
      let keywords = [];
      $(siblings).each((i, sib) => {
        if (sib.name === 'section') {
          $(sib.children).each((i, el) => {
            $(el.children).each((i, p) => {
              if (p.data) {
                text += p.data;
              }
              else if (p.children[0].data) { 
                text += p.children[0].data;
                keywords.push(p.children[0].data)
              }
            })
          })
          Entry.create({word, POS, text, keywords,})
          .then(entry => console.log(entry))
          .catch(err => console.log("err: ", err))
        }
      })
    })
    // FIND THE NEXT WORD TO SEARCH 
    let nextWord = $('.alphabetical__active--FCYcm').next().children()['0'].children[0].data
    if (nextWord) {
      setTimeout(() => {scrape(nextWord)}, 700)
    }
  })

}