var bg = chrome.extension.getBackgroundPage()
  , tabId = bg.tabid
  , favState = bg.favState
  , playState = bg.playState
  , haveTab = bg.haveTab
  , playlist = bg.playlist
  , playlist_html = ''
  , color_class = ''
  , banner
  , artist
  , track
  , postURL
  , next
  , prev
  , pp
  , fav
  , banner
  , trackDiv
  , contentDiv
  , fb_url = ''
  , tw_url = ''
  , amazon_url = '';


window.onload = function () {
	// Some setup stuff...
	next = document.getElementById('goNext');
	prev = document.getElementById('goPrev');
	pp = document.getElementById('goPlay');
	fav = document.getElementById('goFav');
	trackDiv = document.getElementById('track');
	contentDiv = document.getElementById('the_blurb');
	$playlist_container = $('#playlist');
	$share_buy = $('#share_buy');
	$readmore = $share_buy.find('.read-more');


	// Bind functions to click events
	next.onclick = nextSong;
	prev.onclick = prevSong;
	pp.onclick = pausePlay;
	fav.onclick = favorite;

    // Hotkeys
    var hotkeys =
        {   74: nextSong // J
        ,   78: nextSong // N
        ,   39: nextSong // ->
        ,   75: prevSong // K
        ,   80: prevSong // P
        ,   37: prevSong // <-
        ,   32: pausePlay // Spacebar
        ,   70: favorite // F
        }
    $(document).bind('keyup', function(e) {
        var code = e.keyCode || e.which;
        if (hotkeys[code]) hotkeys[code]();
    });

	// Set up the buttons
	// Update all controls.
	if ( haveTab )
	{
		chrome.tabs.sendMessage(tabId, {todo: "update"}, function(response) {
			playlist             = bg.playlist;
			pp.className         = bg.playState;
			fav.className        = bg.favState;
			trackDiv.innerHTML   = bg.currentTrack;
			contentDiv.innerHTML = bg.currentBlurb;
			setSocialLinks(bg.nowplaying);
			setAmazonLink(bg.nowplaying);
			$readmore.attr('href',bg.readMore);
            $('#share_buy').show();

            // TODO: Move the playlist update stuff into a function
			// Do playlist items
			if ( playlist )
			{

	        	$.each(playlist, function(key, hype) {
	        		if ( hype.track_id )
	        		{ // This if-block protects from the magical last element which is not actually a track
	        			var current_status = hype.track_id == bg.songId ? bg.playState : "play"; // If currently playing, show playstate, else play.
	                    playlist_html += "<div class='playlist-item "+color_class+"'>";
	                    playlist_html += "<a id='"+hype.play_button+"' class='playlist-control "+current_status+"' href='#'></a>"+hype.artist+ " - "+hype.track_title;
	                    playlist_html += "</div>";
	                    color_class = color_class=="white" ? "" : "white";
	                }
				});

	        	// Append to the playlist container
				$playlist_container.html(playlist_html);

				// Handle playlist button clicks
				$playlist_container.find('.playlist-item a')
				                   .click(function(evt) {
				                   	    var ele = playlist["_"+evt.target.id.split('_')[2]]; // Pull this object from the playlist array
				                   	    setSocialLinks(ele);
				                   	    setAmazonLink(ele);
				                   	    pausePlayId(evt.target.id);
				                   	    $readmore.attr('href', ele.blog_url);
				                    });
	        } // End playlist stuff if
		});



	}
	else
	{
		// Just set stuff to the background page values and don't try to send a message.
		pp.className = bg.playState;
		fav.className = bg.favState;
		trackDiv.innerHTML = bg.currentTrack;
		contentDiv.innerHTML = bg.currentBlurb;
	}
	// Done setting up buttons!

}
function nextSong() {
	if ( !haveTab ) return false;
	chrome.tabs.sendMessage(tabId, {todo: "next"}, function(response) {
		fav.className = bg.favState;
	  	pp.className = bg.playState;
	  	trackDiv.innerHTML = bg.currentTrack;
	  	contentDiv.innerHTML = bg.currentBlurb;
        updatePlaylistButtons();
	});

}
function prevSong() {
	if ( !haveTab ) return false;
	chrome.tabs.sendMessage(tabId, {todo: "prev"}, function(response) {
		fav.className = bg.favState;
		pp.className = bg.playState;
		trackDiv.innerHTML = bg.currentTrack;
	  	contentDiv.innerHTML = bg.currentBlurb;
        updatePlaylistButtons();
	});
}
function pausePlay() {
	if ( !haveTab ) return false;

	chrome.tabs.sendMessage(tabId, {todo: "pp"}, function(response) {
		pp.className = bg.playState;
		updatePlaylistButtons(bg.songId);
	});
}
function favorite() {
	if ( !haveTab ) return false;
	chrome.tabs.sendMessage(tabId, {todo: "fav"}, function(response) {
		fav.className = bg.favState;
	});
}
function pausePlayId(id_selector) {
	if ( !haveTab ) return false;
	$playlist_container.find('.playlist-item a.playlist-control').removeClass('pause').addClass('play'); // Set all other buttons to play
	chrome.tabs.sendMessage(tabId, {todo: "click_id", button_id: id_selector}, function(response) {
		document.getElementById(id_selector).className = bg.playState;
		pp.className = bg.playState;
		fav.className = bg.favState;
		trackDiv.innerHTML = bg.currentTrack;
		contentDiv.innerHTML = bg.currentBlurb;
	});
}
function setSocialLinks(ele) {
	console.log(ele.share_text);
	fb_url = "http://www.facebook.com/sharer.php?u="+ele.share_url+"&t="+ele.share_title;
    tw_url = "https://twitter.com/share?url="+ele.share_url+"&text="+ele.share_text;
    $share_buy.find('.facebook').attr('href', fb_url);
    $share_buy.find('.twitter').attr('href', tw_url);
}
function setAmazonLink(ele) {
    amazon_url = ele.amazon;
    $share_buy.find('.amazon').attr('href', amazon_url);
}
function updatePlaylistButtons() {
	$("#playlist").find("a.playlist-control").removeClass('pause').addClass('play');
    $("#play_ctrl_"+bg.songId).attr('class','playlist-control '+bg.playState);
}
