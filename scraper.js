const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');


const entry = new mongoose.Schema({
  word: {type: String, required: true},
  POS: {type: String},
  text: {type: String,}
})

const Entry = mongoose.model('Entry', entry)

mongoose.connect('mongodb://localhost/etyScrape', (err, res) => {
  if (err){console.log('DB CONNECTION FAILED: '+err)}
  else{console.log('DB CONNECTION SUCCESS')}
  scrape("'em")
  

});

function scrape(searchTerm) {
  axios.get(`https://www.etymonline.com/word/${searchTerm}`)
  .then(res => {
    let $ = cheerio.load(res.data)
    $(".word__name--TTbAA").each(function(i, el){
      let title = $(this).text();
      let word = $(this).text().slice(0, title.indexOf("("))
      console.log(word)
      let POS = $(this).text().slice(title.indexOf("(") + 1, title.length - 1  )
      let siblings = $(this).siblings()
      // console.log(siblings)
      let text = '';
      $(siblings).each((i, sib) => {
        if (sib.name === 'section') {
          $(sib.children).each((i, el) => {
            $(el.children).each((i, p) => {
              if (p.data) {
                text += p.data;
              }
              else if (p.children[0].data) { 
                text += p.children[0].data;
              }
            })
          })
        }
        Entry.create({word, POS, text,})
        .then(entry => console.log(entry))
        .catch(err => console.log("err: ", err))
      })
      // $(siblings).each(sib => console.log(sib))
    })
  })
}