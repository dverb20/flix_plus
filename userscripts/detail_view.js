// ==UserScript== 
// @name          Open Netflix Movies as Detail View
// @namespace     https://github.com/matthewpucc
// @version       1.3
// @updateURL     http://matthewpucc-db.s3.amazonaws.com/FTFY/NetflixFix/pwn.js
// @description   This will rewrite the image links in the default netflix views 
//                to open the information page instead of forcing the movie/show
//                to start playing. The makes managing a queue much easier.
// @include       http://*netflix.com/search*
// @include       http://*netflix.com/*
// @exclude       http://movies.netflix.com/WiPlayer*
// @exclude       http://movies.netflix.com/WiMovie*
// @copyright     2012+, matthewpucc, Beerware
// ==/UserScript==

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * matthewpucc wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return
 * ----------------------------------------------------------------------------
 */

// jaredsohn-lifehacker: Now requires extlib.js, fplib.js, and arrive.js.

if (fplib.isOldMyList())
{
    console.log("Script disabled since it does not work on old MyList.")
    return;
}

extlib.addGlobalStyle(".lockup:hover>.playHover { background-image:none; }  !important"); // jaredsohn-Lifehacker...so it doesn't show 'Play' on genre pages

var stopIt    = function (e) { e.preventDefault(); e.stopPropagation(); },
    clickIt   = function (e) { stopIt(e); window.location.href = this.href; },
    regex     = /^https?\:\/\/www\.netflix\.com\/WiPlayer\?movieid=([\d]+)/, // changed from movies to www lifehacker-jaredsohn
    linkBase  = 'http://www.netflix.com/WiMovie/',
    aTags     = Array.prototype.slice.call(document.getElementsByTagName('a')),
    playClass = /(?:\s|^)playLink|hoverPlay(?:\s|$)/, // hoverPlay added lifehacker-jaredsohn
    i         = aTags.length,
    tag;


var fixTag = function(tag)
{
  if (regex.test(tag.href)) {
    if (tag.id === "play-popover")
      return;

    tag.playhref     = tag.href;
    tag.className    = tag.className.replace(playClass, ' ');
    tag.href         = linkBase + tag.href.match(regex)[1];
    tag.onmousedown  = stopIt;
    tag.onclick      = clickIt;
  }
}

// jQuery link element
function playLink(movie_id, id) {
  return $('<a>', {
    href: window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movie_id,
    text: 'Play',
    id: id
  }).click(function() {
    //        _gaq.push(['_trackEvent', $(this).attr('id'), 'clicked']);
  });
}

while (i--) {
  tag = aTags[i];
  fixTag(tag);
}

// added by jaredsohn-lifehacker so that it fixes links that later are added to the page (such as when you add something to My List).
document.arrive("a", function()
{
  fixTag(this)
});

// Add a play button to the popup
// TODO: support other bobmovie classes, too
document.body.arrive("#BobMovie-content .readMore", function()
{
  console.log("arrive");
  var parts = $("#BobMovie-content .mdpLink")[0].href.split("/");
  var movie_id = parts[parts.length - 1];
  var link$ = playLink(movie_id, 'play-popover');
  $('#' + "BobMovie-content" + ' .readMore').after(link$).after(' \u00B7 ');
});
