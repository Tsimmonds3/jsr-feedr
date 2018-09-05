"use strict";
/*exported Source */
// Source.js

class Source {

  constructor(name, url) {

    this.url = url;
    this.name = name;

  }

  getUrl() {
    return this.url;
  }

  getName() {
    return this.name;
  }

}

/*
  Please add all Javascript code to this file.
*/

// Guardian API Key 26e4cff6-a4aa-42ec-bba7-ab4da22aecb7
// Guardian URL: https://content.guardianapis.com/search?api-key=26e4cff6-a4aa-42ec-bba7-ab4da22aecb7
//"apiUrl": "https://content.guardianapis.com/sport/live/2018/sep/02/us-open-2018-nadal-serena-williams-sloane-stephens-thiem-v-anderson-and-more-live?api-key=26e4cff6-a4aa-42ec-bba7-ab4da22aecb7",

// Financial Times API Key 59cbaf20e3e06d3565778e7b83391c17095945479c0b5b4a2472a5c0
// Financial Times URL https://api.ft.com/search?api-key=59cbaf20e3e06d3565778e7b83391c17095945479c0b5b4a2472a5c0

// Digg URL https://accesscontrolalloworiginall.herokuapp.com/http://digg.com/api/news/popular.json
// Sources: title_alt, display_name description, digg_score

// Reddit URL https://www.reddit.com/top.json
// Thoughts: NSFW content?
// Sources: title: result.title | link: result.data.permalink | image: result.data.thumbnail | category: result.data.subreddit | impression: result.data.ups | description: "Reddit is too cool for descriptions! Click the buttion for more detail!"

$(function () { 
  resetSource('The Guardian');// Page always starts with The Guardian as source

  // $('article').on('click',showArticle);
  // $('body').css('background','blue');

  // Toggle search on click
  $('#search-button').on('click', function () {
    $('#search').toggleClass('active');
  });

  // Toggle on enter
  $(document).keypress(function (e) {
    if (e.which == 13) { // Run search
      $('#search').toggleClass('active');
    }
  }
  );

  $('.closePopUp').on('click', closePopUp);

  $('.choice').on('click', dropDown);

});
function resetSource(sourceName) {
  let newSource;
  $('#popUp').removeClass().addClass('loader');
  switch (sourceName) {
    case 'The Guardian':
      newSource = new Source(sourceName, "https://content.guardianapis.com/search?api-key=26e4cff6-a4aa-42ec-bba7-ab4da22aecb7&show-fields=thumbnail,bodyText,wordcount");
      break;

    case 'Digg':
      newSource = new Source(sourceName, "https://accesscontrolalloworiginall.herokuapp.com/http://digg.com/api/news/popular.json");
      break;

    case 'Reddit':
      newSource = new Source(sourceName, "https://www.reddit.com/top.json");
      break;

    default: //You should never be here
      break;
  }
  $('#source').text(newSource.getName());
  $('.popUpAction').text("Read more from " + newSource.getName());
  $('#main').empty();
  // source.setGetImage(() => this.result.fields.thumbnail);
  $.get(newSource.getUrl(), function (results) {
    // console.log(results);
    let resultsArray;
    switch (newSource.getName()) {
      case 'The Guardian':
        resultsArray = results.response.results;
        break;

      case 'Digg':
        resultsArray = results.data.feed;
        break;

      case 'Reddit':
        resultsArray = results.data.children;
        break;

      default: //You should never be here
        break;
    }
    resultsArray.forEach(function (result) {
      let fields = getFields(newSource.getName(), result);
      let article = `<article class="article"><section class="featuredImage">  
      <img src="${fields.XXXIMAGE}" alt="No Thumb Image Found" /></section><section class="articleContent">    
      <a href="#"><h3>${fields.XXXTITLE}</h3></a>    
      <h6>${fields.XXXCATEGORY}</h6></section><section class="impressions">  ${fields.XXXVIEWS} </section>
      <div class="clearfix"></div></article>`;
      article = $(article);
      article.attr('bodyText', fields.XXXBODYTEXT);
      article.attr('webUrl', fields.XXXWEBURL);
      article.on('click', showArticle);
      $('#main').append(article);
      $('#popUp').removeClass('loader').addClass('hidden');
    })
    .fail(function() {
      alert( "Error! Content could not be found." );
    });
    // $('#popUp').toggleClass('hidden');
  });
  return newSource;
}
function getFields(name, result) {
  let XXXTITLE, XXXCATEGORY, XXXVIEWS, XXXIMAGE, XXXWEBURL, XXXBODYTEXT;
  switch (name) {
    case 'The Guardian':
      XXXTITLE = result.webTitle;
      XXXCATEGORY = result.sectionName;
      XXXVIEWS = 100 + result.fields.wordcount % 500;
      XXXIMAGE = result.fields.thumbnail;
      XXXBODYTEXT = result.fields.bodyText;
      XXXWEBURL = result.webUrl;
      break;

    case 'Digg':
      XXXTITLE = result.content.title_alt;
      XXXCATEGORY = result.content.tags[0].display_name;
      XXXVIEWS = result.digg_score;
      XXXIMAGE = result.content.media.images[0].url;
      // Could loop for image
      XXXBODYTEXT = result.content.description;
      XXXWEBURL = result.content.original_url;
      break;

    case 'Reddit':
      XXXTITLE = result.data.title;
      XXXCATEGORY = result.data.subreddit;
      XXXVIEWS = result.data.ups;
      XXXIMAGE = result.data.thumbnail;
      XXXBODYTEXT = "Reddit is too cool for text! Click the link to check out more!";
      XXXWEBURL = "https://www.reddit.com" + result.data.permalink;
      break;

    default: //You should never be here
      break;
  }
  return {
    'XXXTITLE': XXXTITLE,
    'XXXCATEGORY': XXXCATEGORY,
    'XXXVIEWS': XXXVIEWS,
    'XXXIMAGE': XXXIMAGE,
    'XXXWEBURL': XXXWEBURL,
    'XXXBODYTEXT': XXXBODYTEXT
  };
}

function showArticle() {
  $('#popUp').find('h1').text($(this).find('.articleContent h3').text());
  let summary = firstWords($(this).attr('bodyText'), 200);
  $('#popUp p').text(summary + ' ...');
  $('#popUp').removeClass().find('.popUpAction').attr('href', $(this).attr('webUrl'));
}

function dropDown() {
  resetSource($(this).find('a').text());
}

function firstWords(string, count) {
  return string.split(/\s+/).slice(0, count).join(' ');
}

function closePopUp() {
  $('#popUp').addClass("hidden").removeClass('loader');
}