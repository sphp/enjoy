var PLAYER = PLAYER || {};
PLAYER.Playlist = function ($, video, options, mainContainer, element, preloader, preloaderAD, myVideo, canPlay, click_ev, params, pw, deviceAgent, agentID, youtube_array, isMobile) 
{
    //constructor
    var self = this;

    this.VIDEO = video;
    this.element = element;
	this.youtube_array = youtube_array;
	//if youtube playlist/channel fill options
	if(options.youtubePlaylistID != "" || options.youtubeChannelID != "")
		options.videos = self.youtube_array;
    this.canPlay = canPlay;
    this.CLICK_EV = click_ev;
	this.params = params;
    this.isMobile = isMobile;
    this.preloader = preloader;
    this.preloaderAD = preloaderAD;
    this.options = options;
    this.mainContainer = mainContainer;
    this.videoid = "VIDEOID";
    this.adStartTime = "ADSTARTTIME";
    this.videoAdPlayed = false;
	this.rand = Math.floor((Math.random() * (options.videos).length) + 0);
    this.ytQuality = options.youtubeQuality;
	this.youtubeSTARTED=false;
    this.deviceAgent = deviceAgent;
    this.agentID = agentID;
    this.YTAPI_onPlayerReady = false;
	this.vimeo_time;
    this.vimeo_duration;
	this.scrollingIsOn = false;
    this.touchmove = false;

    this.playlist = $("<div />");
    this.playlistContent= $("<div />");
    this.playlistContentOverlay = $("<div />").addClass("elite_vp_playlistContentOverlay").hide();
	this.playlistBar= $("<div />");
	// this.playlistBar.addClass("elite_vp_playlistBar")
	this.playlistBar.addClass("elite_vp_bg"+" "+"elite_vp_"+"elite_vp_"+this.options.instanceTheme);

	this.playlist.append(this.playlistBar);
	this.playlist.append(this.playlistContentOverlay);
	
	this.playlistBarInside= $("<div />");
	this.playlistBarInside.addClass("elite_vp_playlistBarInside");
	this.playlistBar.append(this.playlistBarInside);
	
	this.lastBtnIcon = $("<span />")
        .attr("aria-hidden","true")
        .addClass("fa-elite")
        .addClass("elite-icon-general")
		.addClass("elite_vp_controlsColor"+" "+"elite_vp_"+"elite_vp_"+this.options.instanceTheme)
        .addClass("fa-elite-step-forward")
		.attr("id", "elite_vp_lastBtn")
    
	this.firstBtnIcon = $("<span />")
        .attr("aria-hidden","true")
        .addClass("fa-elite")
        .addClass("elite-icon-general")
		.addClass("elite_vp_controlsColor"+" "+"elite_vp_"+this.options.instanceTheme)
        .addClass("fa-elite-step-backward")
		.attr("id", "elite_vp_firstBtn")
	
	this.nextBtnIcon = $("<span />")
        .attr("aria-hidden","true")
        .addClass("fa-elite")
        .addClass("elite-icon-general")
		.addClass("elite_vp_controlsColor"+" "+"elite_vp_"+this.options.instanceTheme)
        .addClass("fa-elite-forward")
		.attr("id", "elite_vp_nextBtn")
	
	this.previousBtnIcon = $("<span />")
        .attr("aria-hidden","true")
        .addClass("fa-elite")
        .addClass("elite-icon-general")
		.addClass("elite_vp_controlsColor"+" "+"elite_vp_"+this.options.instanceTheme)
        .addClass("fa-elite-backward")   
		.attr("id", "elite_vp_previousBtn")
	
	this.shuffleBtnIcon = $("<span />")
        .attr("aria-hidden","true")
		.attr("id", "elite_vp_shuffleBtn")
        .addClass("fa-elite")
        .addClass("elite-icon-general")
		.addClass("elite_vp_controlsColor"+" "+"elite_vp_"+this.options.instanceTheme)
        .addClass("fa-elite-random")
		.addClass("elite_vp_playerElement")
		
	this.lastBtn = $("<div />")
        .addClass("elite_vp_playlistBarBtn")
		.addClass("elite_vp_playerElement")
    this.lastBtn.append(this.lastBtnIcon);
	
	this.firstBtn = $("<div />")
        .addClass("elite_vp_playlistBarBtn")
		.addClass("elite_vp_playerElement")
    this.firstBtn.append(this.firstBtnIcon);
	
	this.nextBtn = $("<div />")
        .addClass("elite_vp_playlistBarBtn")
		.addClass("elite_vp_playerElement")
    this.nextBtn.append(this.nextBtnIcon);

	this.previousBtn = $("<div />")
        .addClass("elite_vp_playlistBarBtn")
		.addClass("elite_vp_playerElement")
    this.previousBtn.append(this.previousBtnIcon);
	
	this.shuffleBtn = $("<div />")
        .addClass("elite_vp_playlistBarBtn")
		.addClass("elite_vp_playerElement")
    this.shuffleBtn.append(this.shuffleBtnIcon);
	
    this.playlistBarInside.append(this.firstBtn);
	this.playlistBarInside.append(this.previousBtn);
	this.playlistBarInside.append(this.shuffleBtn);
    this.playlistBarInside.append(this.nextBtn);
	this.playlistBarInside.append(this.lastBtn);
		
    switch(this.options.playlist){
        case "Right playlist":
			this.playlist.attr('id', 'elite_vp_playlist');
			this.playlist.addClass("elite_vp_playlist"+" "+"elite_vp_"+this.options.instanceTheme)
            this.playlistContent.attr('id', self.options.instanceName + 'elite_vp_playlistContent');
			
			this.playlistBar.addClass("elite_vp_playlistBar")
            break;
        case "Bottom playlist":
            this.playlist.attr('id', 'elite_vp_playlist_bottom');
			this.playlist.addClass("elite_vp_playlist"+" "+"elite_vp_"+this.options.instanceTheme)
            this.playlistContent.attr('id', self.options.instanceName + 'elite_vp_playlistContent_bottom');

			this.playlistBar.addClass("elite_vp_playlistBar_bottom")
            break;
    }
    self.videos_array=new Array();
    self.item_array=new Array();

    

    this.vimeoWrapper = $('<div></div>');
    this.vimeoWrapper.attr('id', 'elite_vp_vimeoWrapper');
    if( self.element)
        self.element.append(self.vimeoWrapper);

    $(this.vimeoWrapper).html('<iframe id="'+self.options.instanceName+'" src="" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
	
    var offsetL=0;
    var offsetT=0;
    // document.addEventListener("eventYoutubeReady", onPlayerReady, false);
	
    this.onPlayerReady = function (eventYoutubeReady) {
		self.YTAPI_onPlayerReady = true;
        if(options.videos[0].videoType=="youtube" || options.videoType=="YouTube")
        {
			self.VIDEO.playButtonScreen.hide();
				
			//detect if IE cue first video as youtube
			var ms_ie = false;
			var ua = window.navigator.userAgent;
			var old_ie = ua.indexOf('MSIE ');
			var new_ie = ua.indexOf('Trident/');

			if ((old_ie > -1) || (new_ie > -1)) {
				ms_ie = true;
			}
			if ( ms_ie ) {
				//IE specific code goes here
				//alert("IE")
				if(options.loadRandomVideoOnStart=="Yes")
					self.VIDEO.youtubePlayer.cueVideoById(self.videos_array[self.rand].youtubeID);
				else
					self.VIDEO.youtubePlayer.cueVideoById(self.videos_array[self.videoid].youtubeID);
				/*if(options.loadRandomVideoOnStart=="Yes")
					self.VIDEO.youtubePlayer.loadVideoById(self.videos_array[self.rand].youtubeID);
				else
					self.VIDEO.youtubePlayer.loadVideoById(self.videos_array[0].youtubeID);
				self.VIDEO.youtubePlayer.pauseVideo();*/
			}
			else{
				if(options.loadRandomVideoOnStart=="Yes")
					self.VIDEO.youtubePlayer.cueVideoById(self.videos_array[self.rand].youtubeID);
				else
				{
					self.VIDEO.youtubePlayer.cueVideoById(self.videos_array[self.videoid].youtubeID);
				}
			}
			self.VIDEO.youtubePlayer.setPlaybackQuality(self.ytQuality);
			
			if(options.autoplay){
				if(!self.isMobile.any()){
                    if(self.VIDEO.getViewportStatus()){
                        self.VIDEO.youtubePlayer.playVideo();
                    }
                }
			}
			
            self.VIDEO.resizeAll();

			if(pw){
                if(self.options.videos[0].title!="AD 5 sec + Pieces After Effects project" && self.options.videos[0].title!="Pieces After Effects project" && self.options.videos[0].title!="AD 5 sec + Space Odyssey After Effects Project" && self.options.videos[0].title!="AD 5 sec Swimwear Spring Summer" && self.options.videos[0].title!="i Create" && self.options.videos[0].title!="Swimwear Spring Summer" && self.options.youtubePlaylistID!="PLuFX50GllfgP_mecAi4LV7cYva-WLVnaM" && self.options.videos[0].title!="Google drive video example" && self.options.videos[0].title!="Dropbox video example" && self.options.videos[0].title!="Livestream HLS m3u8 video example" && self.options.videos[0].title!="Openload video example" && self.options.videos[0].title!="Youtube 360 VR video"){
					self.VIDEO.pw();
                    if(self.VIDEO.youtubePlayer!= undefined){
                        self.VIDEO.youtubePlayer.stopVideo();
                        self.VIDEO.youtubePlayer.clearVideo();
                        self.VIDEO.youtubePlayer.setSize(1, 1);
                    }
                }
            }
			
			self.popupTimer = setInterval(function(){
					if(self.videos_array[self.videoid].popupAdShow=="yes")
						self.VIDEO.enablePopup();
            },1000);
        }
    }
    this.onPlayerStateChange = function (event) {
        var youtube_time = Math.floor(self.VIDEO.youtubePlayer.getCurrentTime());
		self.VIDEO.calculateYoutubeTotalTime(self.VIDEO.youtubePlayer.getDuration());
		if(event.data === 1 && youtube_time==0 ) {
			self.youtubeSTARTED=true;
			// self.VIDEO.calculateYoutubeTotalTime(self.VIDEO.youtubePlayer.getDuration());
		}
        if(event.data === 1) {
			//playing
			if(self.isMobile.any())
				self.VIDEO.playButtonScreen.addClass("elite_vp_playButtonScreenHide");
			
			element.removeClass("vp_paused");
			element.addClass("elite_vp_playing");
			video.change("elite_vp_playing");
			self.VIDEO.play();
			
			self._timer = setInterval(function() {
				if(options.videos[self.videoid].videoType=="HTML5" || options.videoType=="HTML5 (self-hosted)")
				return;
				// //progress
				self.progressWidth = (self.VIDEO.youtubePlayer.getCurrentTime()/self.VIDEO.youtubePlayer.getDuration() )*self.VIDEO.videoTrack.width();
				self.VIDEO.videoTrackProgress.css("width", self.progressWidth);
				self.progressIdleWidth = (self.VIDEO.youtubePlayer.getCurrentTime()/self.VIDEO.youtubePlayer.getDuration() )*self.VIDEO.progressIdleTrack.width();
				self.VIDEO.progressIdle.css("width", self.progressIdleWidth);
				// //time
				self.VIDEO.calculateYoutubeElapsedTime(self.VIDEO.youtubePlayer.getCurrentTime());
				// self.VIDEO.calculateYoutubeTotalTime(self.VIDEO.youtubePlayer.getDuration());
				// //download
				self.buffered = self.VIDEO.youtubePlayer.getVideoLoadedFraction();
				self.downloadWidth = (self.buffered )*self.VIDEO.videoTrack.width();
				self.VIDEO.videoTrackDownload.css("width", self.downloadWidth);
				self.progressIdleDownloadWidth = (self.buffered)*self.VIDEO.progressIdleTrack.width();
				self.VIDEO.progressIdleDownload.css("width", self.progressIdleDownloadWidth);
				
				if(self.VIDEO.secondsFormat(self.VIDEO.youtubePlayer.getCurrentTime()) == self.videos_array[self.videoid].midrollAD_displayTime)
				{
					if(self.VIDEO.midrollPlayed)
						return
					self.VIDEO.midrollPlayed = true;
					if(self.videos_array[self.videoid].midrollAD=="yes")
					{
						if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
						{
							self.canPlay = true;
							self.video_pathAD = self.videos_array[self.videoid].midroll_mp4;
						}
						self.VIDEO.youtubePlayer.pauseVideo();
						self.VIDEO.loadAD(self.video_pathAD, "midrollActive");
						self.VIDEO.openAD();
					}
				}
				if(self.VIDEO.secondsFormat(self.VIDEO.youtubePlayer.getCurrentTime()) >= self.VIDEO.secondsFormat(self.VIDEO.youtubePlayer.getDuration()-1) && self.VIDEO.youtubePlayer.getDuration()>0)
				{
					if(self.VIDEO.postrollPlayed)
						return
					self.VIDEO.postrollPlayed = true;
					if(self.videos_array[self.videoid].postrollAD=="yes")
					{
						if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
						{
							self.canPlay = true;
							self.video_pathAD = self.videos_array[self.videoid].postroll_mp4;
						}
						self.VIDEO.youtubePlayer.pauseVideo();
						self.VIDEO.loadAD(self.video_pathAD, "postrollActive");
						self.VIDEO.openAD();
					}
				}
			}, 50);   
		}
		else if(event.data === 2) {
			clearInterval(self._timer);
			//paused
			element.addClass("vp_paused");
			element.removeClass("elite_vp_playing");
			video.change("vp_paused");
			self.VIDEO.pause();
		}
        else if(event.data === 0) {
            //ended
            self.VIDEO.gaVideoEnded();
            
			self.VIDEO.midrollPlayed = false;
			self.VIDEO.postrollPlayed = false;
				// self.randEnd = Math.floor((Math.random() * (options.videos).length) + 0);
			
                self.videoAdPlayed=false;
                self.videoid = parseInt(self.videoid)+1;
                if (self.videos_array.length == self.videoid){
                    self.videoid = 0;
                }
                //play next on finish
                if(options.onFinish=="Play next video")
                {
					if(self.VIDEO.shuffleBtnEnabled){
						// self.VIDEO.setPlaylistItem(self.randEnd);
						// self.videoid = self.randEnd;
						
						self.VIDEO.generateRandomNumber();
						self.videoid = self.VIDEO.rand;
						self.VIDEO.setPlaylistItem(self.videoid);
					}
					else{
						self.VIDEO.setPlaylistItem(self.videoid);
					}
					self.VIDEO.playVideoById(self.videoid);
                }
                else if(options.onFinish=="Restart video")
                {
                    if(self.VIDEO.youtubePlayer!= undefined){
                        self.VIDEO.youtubePlayer.seekTo(0);
                        self.VIDEO.youtubePlayer.playVideo();
                    }

                }
                else if(options.onFinish=="Stop video")
                {
                    self.VIDEO.youtubePlayer.seekTo(0);
					self.VIDEO.youtubePlayer.pauseVideo();
                    self.VIDEO.youtubePlayer.stopVideo();//stop video and wait for cued event (5)
                    
					if(options.posterImgOnVideoFinish != ""){
						self.VIDEO.resetPlayer();
						self.VIDEO.youtubePlayer.seekTo(0);
						self.VIDEO.youtubePlayer.pauseVideo();
						
						self.VIDEO.showPoster2();
					}
                }

        }
        else if(event.data === 5) {//When the video is cued and ready to play, the player will broadcast a video cued event (5).
            self.VIDEO.resetPlayer();
            self.VIDEO.playButtonScreen.hide();
        }
        /*else if(event.data == YT.PlayerState.CUED){
//            console.log("cued",event)
//            self.VIDEO.resizeAll();
//            var src = $('iframe#elite_vp_ytPlayer').attr('src');
//            var theme = src + "&theme=light";
//            $('iframe#elite_vp_ytPlayer').attr('src',theme);
//
//           $('#elite_vp_ytPlayer').load(function(){
//                self.VIDEO.resizeAll(true);
//            });
        }*/
        //if prerollAD, play videoad
        if((event.data === 1 && youtube_time==0 )&& (self.videos_array[self.videoid].prerollAD=="yes" || self.options.showGlobalPrerollAds) ) {
            self.VIDEO.videoAdStarted = true;
            //check if ad played or not
            if(self.videoAdPlayed){
                self.VIDEO.youtubePlayer.playVideo();
            }
            else {
                self.VIDEO.youtubePlayer.pauseVideo();
                if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
                {
                    this.canPlay = true;
					if(options.showGlobalPrerollAds)
						self.video_pathAD = self.VIDEO.globalPrerollAds_arr[self.VIDEO.getGlobalPrerollRandomNumber()]
					else
						self.video_pathAD = self.videos_array[self.videoid].preroll_mp4;
                }
                self.VIDEO.loadAD(self.video_pathAD, "prerollActive");
                self.VIDEO.openAD();
            }
        }
		else if(event.data == YT.PlayerState.PLAYING || event.data == YT.PlayerState.CUED){
			self.youtubePLAYING=true;
		}
    }
    function onPauseVimeo(id) {
        self.vimeoStatus.text('paused');
        //console.log("vimeo paused")
    }
    function onFinishVimeo(id) {
        self.vimeoStatus.text('finished');
        self.videoAdPlayed=false;
		//console.log("vimeo finished")
        self.VIDEO.gaVideoEnded();
		// self.randEnd = Math.floor((Math.random() * (options.videos).length) + 0);

        if(options.playlist=="Right playlist" || options.playlist=="Bottom playlist" || options.playlist=="Off")
        {
            self.videoid = parseInt(self.videoid)+1;
            if (self.videos_array.length == self.videoid){
                self.videoid = 0;
            }
            //play next on finish
            if(options.onFinish=="Play next video")
            {
				if(self.VIDEO.shuffleBtnEnabled){
					// self.VIDEO.setPlaylistItem(self.randEnd);
					// self.videoid = self.randEnd;
					self.VIDEO.generateRandomNumber();
					self.videoid = self.VIDEO.rand;
					self.VIDEO.setPlaylistItem(self.videoid);
				}
				else{
					self.VIDEO.setPlaylistItem(self.videoid);
				}
				self.VIDEO.playVideoById(self.videoid);

            }
            else if(options.onFinish=="Restart video")
            {
                self.vimeoPlayer.api('play');

            }
            else if(options.onFinish=="Stop video")
            {
                if(options.posterImgOnVideoFinish != ""){
					self.VIDEO.showPoster2();
				}
            }
        }
		else{
			if(options.onFinish=="Restart video")
            {
                self.vimeoPlayer.api('play');
            }
            else if(options.onFinish=="Stop video")
            {
                //load more videos
            }
		}
    }
    function onPlayProgressVimeo(data, id) {

        self.vimeo_time = Math.floor(data.seconds);
        self.vimeo_duration = Math.floor(data.duration);
        self.vimeoStatus.text(data.seconds + 's played');
		
        if(self.vimeo_time == 0 && self.videos_array[self.videoid].prerollAD=="yes"){
            //play ad
            self.VIDEO.videoAdStarted = true;

            if(self.videoAdPlayed){
                self.vimeoPlayer.api('play');
            }
            else {
                self.vimeoPlayer.api('pause');
                if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
                {
                    this.canPlay = true;
                    self.video_pathAD = self.videos_array[self.videoid].preroll_mp4;
                }
                self.VIDEO.loadAD(self.video_pathAD, "prerollActive");
                self.VIDEO.openAD();
            }
        }
		
		self.tim = setInterval(function() {
			
			if(options.videos[self.videoid].videoType=="HTML5" || options.videoType=="HTML5 (self-hosted)")
			return;
		
			if(self.VIDEO.secondsFormat(self.vimeo_time) == self.videos_array[self.videoid].midrollAD_displayTime)
			{
				if(self.VIDEO.midrollPlayed)
					return
				self.VIDEO.midrollPlayed = true;
				if(self.videos_array[self.videoid].midrollAD=="yes")
				{
					if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
					{
						self.canPlay = true;
						self.video_pathAD = self.videos_array[self.videoid].midroll_mp4;
					}
					self.vimeoPlayer.api('pause');
					self.VIDEO.loadAD(self.video_pathAD, "midrollActive");
					self.VIDEO.openAD();
				}
			}
			if(self.VIDEO.secondsFormat(self.vimeo_time) >= self.VIDEO.secondsFormat(self.vimeo_duration-1) && self.vimeo_duration>0)
			{
				if(self.VIDEO.postrollPlayed)
					return
				self.VIDEO.postrollPlayed = true;
				if(self.videos_array[self.videoid].postrollAD=="yes")
				{
					if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
					{
						self.canPlay = true;
						self.video_pathAD = self.videos_array[self.videoid].postroll_mp4;
					}
					self.vimeoPlayer.api('pause');
					self.VIDEO.loadAD(self.video_pathAD, "postrollActive");
					self.VIDEO.openAD();
				}
			}
		}, 50);
		
		if(self.videos_array[self.videoid].popupAdShow=="yes"){
            self.VIDEO.enablePopup();
        }
    }

    function addVimeoListeners() {
        self.vimeoIframe = $(self.vimeoWrapper).find('#'+self.options.instanceName);
        self.vimeoPlayer = $f(self.vimeoIframe[0]);
        self.vimeoStatus = $('.status');
		// When the player is ready, add listeners for pause, finish, and playProgress
        self.vimeoPlayer.addEvent('ready', function() {
            //console.log("vimeo ready");
            self.vimeoPlayer.addEvent('pause', onPauseVimeo);
            self.vimeoPlayer.addEvent('finish', onFinishVimeo);
            self.vimeoPlayer.addEvent('playProgress', onPlayProgressVimeo);
			if(pw){
                if(self.options.videos[0].title!="AD 5 sec + Pieces After Effects project" && self.options.videos[0].title!="Pieces After Effects project" && self.options.videos[0].title!="AD 5 sec + Space Odyssey After Effects Project" && self.options.videos[0].title!="AD 5 sec Swimwear Spring Summer" && self.options.videos[0].title!="i Create" && self.options.videos[0].title!="Swimwear Spring Summer" && self.options.youtubePlaylistID!="PLuFX50GllfgP_mecAi4LV7cYva-WLVnaM" && self.options.videos[0].title!="Google drive video example" && self.options.videos[0].title!="Dropbox video example" && self.options.videos[0].title!="Livestream HLS m3u8 video example" && self.options.videos[0].title!="Openload video example" && self.options.videos[0].title!="Youtube 360 VR video"){
					self.VIDEO.pw();
                    self.vimeoWrapper.css({zIndex:0});
                    $('iframe#'+self.options.instanceName).attr('src','');
                }
            }
        });
    }

    var id=-1;

    $(options.videos).each(function loopingItems()
    {
        id= id+1;
        var obj=
        {
            id: id,
            title:this.title,
            videoType:this.videoType,
            youtubeID:this.youtubeID,
            vimeoID:this.vimeoID,
            video_path_mp4:this.mp4,
            enable_mp4_download:this.enable_mp4_download,
            imageUrl:this.imageUrl,
			imageTimer:this.imageTimer,
            prerollAD:this.prerollAD,
            prerollGotoLink:this.prerollGotoLink,
            preroll_mp4:this.preroll_mp4,
            prerollSkipTimer:this.prerollSkipTimer,
			midrollAD:this.midrollAD,
			midrollAD_displayTime:this.midrollAD_displayTime,
            midrollGotoLink:this.midrollGotoLink,
            midroll_mp4:this.midroll_mp4,
            midrollSkipTimer:this.midrollSkipTimer,
			postrollAD:this.postrollAD,
            postrollGotoLink:this.postrollGotoLink,
            postroll_mp4:this.postroll_mp4,
            postrollSkipTimer:this.postrollSkipTimer,
			popupImg:this.popupImg,
            popupAdShow:this.popupAdShow,
            popupAdStartTime:this.popupAdStartTime,
            popupAdEndTime:this.popupAdEndTime,
            popupAdGoToLink:this.popupAdGoToLink,
            description:this.description,
            thumbnail_image:this.thumbImg,
            info_text: this.info
        };
		
        self.videos_array.push(obj);

		self.nowPlayingThumbnail = $("<div />");
		self.nowPlayingThumbnail.addClass("elite_vp_nowPlayingThumbnail");
		self.nowPlayingThumbnail.text(self.options.nowPlayingTooltipTxt);
		self.nowPlayingThumbnail.hide();
		
		self.itemLeft = $("<div />");
		self.itemLeft.addClass("elite_vp_itemLeft");
		self.i = document.createElement('img');
		self.i.onload = function(){
			self.thumbImageW=this.width;
			self.thumbImageH=this.height;
		}
		self.i.src = obj.thumbnail_image;
		//auto youtube thumbnail
		if(options.videos[id].videoType=="youtube" || options.videoType=="YouTube"){
			if(obj.thumbnail_image == "auto" || obj.thumbnail_image == "")
				self.i.src = "http://img.youtube.com/vi/" + options.videos[id].youtubeID + "/1.jpg"
		}
		self.itemLeft.append(self.i);
		self.itemLeft.append(self.nowPlayingThumbnail);
		
		$(self.i).addClass('elite_vp_thumbnail_image elite_vp_themeColorThumbBorder');
		
        var itemRight = 
		'<div class="elite_vp_itemRight">'
			+ '<div class="elite_vp_title elite_vp_themeColorText">' + obj.title + '</div>'
			+ '<div class="elite_vp_description elite_vp_controlsColor'+" "+"elite_vp_"+self.options.instanceTheme+'"> ' + obj.description + '</div>'
		+ '</div>';
		
		var itemRight_bottom = 
		'<div class="elite_vp_itemRight_bottom">'
			+ '<div class="elite_vp_title elite_vp_themeColorText">' + obj.title + '</div>'
			+ '<div class="elite_vp_description elite_vp_controlsColor'+" "+"elite_vp_"+self.options.instanceTheme+'"> ' + obj.description + '</div>'
		+ '</div>';

        switch(options.playlist){
            case "Right playlist":
                self.item = $("<div />");
                self.item.addClass("elite_vp_item").css("top",String(offsetT)+"px");
                self.item_array.push(self.item);
				self.item.addClass("elite_vp_itemUnselected"+" "+"elite_vp_"+self.options.instanceTheme);
                self.item.append(self.itemLeft);
                self.item.append(itemRight);
                offsetT += 80;
                break;
            case "Bottom playlist":
                self.item = $("<div />");
                // self.item.addClass("elite_vp_item_bottom").css("left",String(offsetL)+"px");
                self.item.addClass("elite_vp_item").css("left",String(offsetL)+"px");
                self.item_array.push(self.item);
                // self.item.addClass("elite_vp_itemUnselected_bottom"+" "+self.options.instanceTheme);
                self.item.addClass("elite_vp_itemUnselected"+" "+"elite_vp_"+self.options.instanceTheme);
                // self.item.css("position","absolute");
                self.item.css("display","inline-flex");
                self.item.append(self.itemLeft);
                self.item.append(itemRight_bottom);
                // offsetL += 245;
                break;
        }
        self.playlistContent.append(self.item);

        //play new video
		if(self.item!=undefined){
			self.item.bind(self.CLICK_EV, function()
			{
                if(self.touchmove)
                    return
				if(self.scrollingIsOn && self.isMobile.any()){
                    return;
                }
				if(self.preloader)
					self.preloader.stop().animate({opacity:1},0,function(){$(this).show()});
					
				self.videoid = obj.id;
				self.VIDEO.setPlaylistItem(self.videoid);

				self.VIDEO.resetPlayer();
				self.VIDEO.resetPlayerAD();
				self.VIDEO.resizeAll();
				addVimeoListeners();
				self.VIDEO.playVideoById(self.videoid);
				self.youtubeSTARTED=false;
				
				if(pw){
					if(self.options.videos[0].title!="AD 5 sec + Pieces After Effects project" && self.options.videos[0].title!="Pieces After Effects project" && self.options.videos[0].title!="AD 5 sec + Space Odyssey After Effects Project" && self.options.videos[0].title!="AD 5 sec Swimwear Spring Summer" && self.options.videos[0].title!="i Create" && self.options.videos[0].title!="Swimwear Spring Summer" && self.options.youtubePlaylistID!="PLuFX50GllfgP_mecAi4LV7cYva-WLVnaM" && self.options.videos[0].title!="Google drive video example" && self.options.videos[0].title!="Dropbox video example" && self.options.videos[0].title!="Livestream HLS m3u8 video example" && self.options.videos[0].title!="Openload video example" && self.options.videos[0].title!="Youtube 360 VR video"){
						self.VIDEO.pw();
					}
				}
			});
		  }
	});
		if(options.loadRandomVideoOnStart=="Yes")
			self.videoid = self.rand;
		else
			self.videoid = 0;
		
		if(self.params.id){
			self.videoid = self.rand = parseInt(self.params.id)
		}
        //play first from playlist
        switch(self.options.playlist){
            case "Right playlist":
				if(options.loadRandomVideoOnStart=="Yes")
                {
					$(self.item_array[self.rand]).removeClass("elite_vp_itemUnselected"+" "+"elite_vp_"+this.options.instanceTheme).addClass("elite_vp_itemSelected"+" "+"elite_vp_"+this.options.instanceTheme);//first selected
					self.item_array[self.rand].find(".elite_vp_thumbnail_image").removeClass("elite_vp_thumbnail_image").addClass("elite_vp_thumbnail_imageSelected");// selected
					self.VIDEO.playedVideos.push(self.rand)
				}
				else
                {
					$(self.item_array[self.videoid]).removeClass("elite_vp_itemUnselected"+" "+"elite_vp_"+this.options.instanceTheme).addClass("elite_vp_itemSelected"+" "+"elite_vp_"+this.options.instanceTheme);//first selected
					self.item_array[self.videoid].find(".elite_vp_thumbnail_image").removeClass("elite_vp_thumbnail_image").addClass("elite_vp_thumbnail_imageSelected");// selected
					self.VIDEO.playedVideos.push(self.videoid)
                }
				break;
            case "Bottom playlist":
				if(options.loadRandomVideoOnStart=="Yes")
                {
					$(self.item_array[self.rand]).removeClass("elite_vp_itemUnselected_bottom"+" "+"elite_vp_"+this.options.instanceTheme).addClass("elite_vp_itemSelected_bottom"+" "+"elite_vp_"+this.options.instanceTheme);//first selected
					self.item_array[self.rand].find(".elite_vp_thumbnail_image").removeClass("elite_vp_thumbnail_image").addClass("elite_vp_thumbnail_imageSelected");// selected
					self.VIDEO.playedVideos.push(self.rand)
				}
				else
                {
					$(self.item_array[self.videoid]).removeClass("elite_vp_itemUnselected_bottom"+" "+"elite_vp_"+this.options.instanceTheme).addClass("elite_vp_itemSelected_bottom"+" "+"elite_vp_"+this.options.instanceTheme);//first selected
					self.item_array[self.videoid].find(".elite_vp_thumbnail_image").removeClass("elite_vp_thumbnail_image").addClass("elite_vp_thumbnail_imageSelected");// selected
					self.VIDEO.playedVideos.push(self.videoid)
                }
                break;
        }
		$(self.playlistContent).mCustomScrollbar("scrollTo", self.item_array[self.videoid]);


		
        if(options.videos[self.videoid].videoType=="youtube" || options.videoType=="YouTube")
        {	
			self.VIDEO.imageWrapper.css({zIndex:0});
			self.VIDEO.imageWrapper.css({visibility:"none"});
            self.VIDEO.hideVideoElements();

            self.preloader.stop().animate({opacity:0},0,function(){$(this).hide()});
            self.VIDEO.ytWrapper.css({zIndex:501});
            self.VIDEO.ytWrapper.css({visibility:"visible"});
            self.vimeoWrapper.css({zIndex:0});
        }
        else if(options.videos[self.videoid].videoType=="HTML5" || options.videoType=="HTML5 (self-hosted)")
        {
			self.VIDEO.imageWrapper.css({zIndex:0});
			self.VIDEO.imageWrapper.css({visibility:"none"});
			
            self.VIDEO.ytWrapper.css({zIndex:0});
            self.VIDEO.ytWrapper.css({visibility:"hidden"});
            self.vimeoWrapper.css({zIndex:0});
            if(myVideo.canPlayType && myVideo.canPlayType('video/mp4').replace(/no/, ''))
            {
                this.canPlay = true;
                if(options.loadRandomVideoOnStart=="Yes"){
					self.video_path = self.videos_array[self.rand].video_path_mp4;
					self.video_pathAD = self.videos_array[self.rand].preroll_mp4;
				}
				else{
					self.video_path = self.videos_array[self.videoid].video_path_mp4;
					self.video_pathAD = self.videos_array[self.videoid].preroll_mp4;
				}
            }
            self.VIDEO.load(self.video_path, "0");
        }
        else if(options.videos[self.videoid].videoType=="vimeo" || options.videoType=="Vimeo")
        {
			self.VIDEO.imageWrapper.css({zIndex:0});
			self.VIDEO.imageWrapper.css({visibility:"none"});
			self.VIDEO.hideCustomControls();
			
            self.VIDEO.hideVideoElements();
            self.preloader.stop().animate({opacity:0},700,function(){$(this).hide()});
            self.vimeoWrapper.css({zIndex:501});

            if(!self.isMobile.any()){
                if(options.autoplay){
					if(options.loadRandomVideoOnStart=="Yes")
                        $(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+self.videos_array[self.rand].vimeoID+"?autoplay=1?api=1&player_id="+self.options.instanceName+"&color="+options.vimeoColor);
					else
						$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+self.videos_array[self.videoid].vimeoID+"?autoplay=1?api=1&player_id="+self.options.instanceName+"&color="+options.vimeoColor);
				}
                else{
					if(options.loadRandomVideoOnStart=="Yes")
						$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+self.videos_array[self.rand].vimeoID+"?autoplay=0?api=1&player_id="+self.options.instanceName+"&color="+options.vimeoColor);
					else
						$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+self.videos_array[self.videoid].vimeoID+"?autoplay=0?api=1&player_id="+self.options.instanceName+"&color="+options.vimeoColor);
				}
            }
            else{
                if(options.loadRandomVideoOnStart=="Yes")
					$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+self.videos_array[self.rand].vimeoID+"?autoplay=0?api=1&player_id="+self.options.instanceName+"&color="+options.vimeoColor);
				else
					$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+self.videos_array[self.videoid].vimeoID+"?autoplay=0?api=1&player_id="+self.options.instanceName+"&color="+options.vimeoColor);
            }
            addVimeoListeners();
        }
		else if(options.videos[self.videoid].videoType=="image" || options.videoType=="Image")
        {
			self.VIDEO.hideCustomControls();
		
			self.VIDEO.hideVideoElements();
			self.VIDEO.ytWrapper.css({zIndex:0});
            self.VIDEO.ytWrapper.css({visibility:"hidden"});
            self.vimeoWrapper.css({zIndex:0});
			self.vimeoWrapper.css({visibility:"hidden"});
			
			self.VIDEO.imageWrapper.css({zIndex:502});
			self.VIDEO.imageWrapper.css({visibility:"visible"});
			
			self.VIDEO.imageDisplayed.src = self.videos_array[0].imageUrl
			
			$(self.VIDEO.imageDisplayed).on("load",function() {
				if(options.autoplay)
					self.VIDEO.setImageTimer();
			});
		}
		
		//play next from playlist
		self.nextBtn.bind(self.CLICK_EV, function()
        {
			//random
			if(self.VIDEO.shuffleBtnEnabled)
			{
				self.VIDEO.generateRandomNumber();
				self.videoid = self.VIDEO.rand;
				self.VIDEO.setPlaylistItem(self.videoid);
			}
			//in order
			else{
				//increase id by one
				self.videoid = self.videoid+1;
				if( self.videoid >= (options.videos).length)
					self.videoid=0;
				self.VIDEO.setPlaylistItem(self.videoid);
			}
			self.VIDEO.playVideoById(self.videoid);
			addVimeoListeners();
		});
		self.previousBtn.bind(self.CLICK_EV, function()
        {
			//random
			if(self.VIDEO.shuffleBtnEnabled)
			{
				self.VIDEO.generateRandomNumber();
				self.videoid = self.VIDEO.rand;
				self.VIDEO.setPlaylistItem(self.videoid);
			}
			//in order
			else{
				//decrease id by one
				self.videoid = self.videoid-1;
				if( self.videoid <0 )
					self.videoid=(options.videos).length-1;
				self.VIDEO.setPlaylistItem(self.videoid);
			}
			self.VIDEO.playVideoById(self.videoid);
			addVimeoListeners();
		});
		self.shuffleBtn.bind(self.CLICK_EV, function(){
			self.VIDEO.toggleShuffleBtn();
        });
		self.lastBtn.bind(self.CLICK_EV, function(){
			$(self.playlistContent).mCustomScrollbar("scrollTo","last");
        });
		self.firstBtn.bind(self.CLICK_EV, function(){
			$(self.playlistContent).mCustomScrollbar("scrollTo","first");
        });


    self.totalWidth = options.videoPlayerWidth;
    self.totalHeight = options.videoPlayerHeight;

    //check if playlist exist
    if(options.playlist=="Right playlist" || options.playlist=="Bottom playlist")
    {
        if( self.element){
            mainContainer.append(self.playlist);
            self.playlist.append(self.playlistContent);
        }
    }
    //save playlist width and height
    this.playlistW = this.playlist.width();
    this.playlistH = this.playlist.height();
    //check which playlist
    if(options.playlist=="Right playlist")
    {
        self.playlistContent.css("height",String(offsetT)+"px");

        self.playerWidth = self.totalWidth - self.playlist.width();
        self.playerHeight = self.totalHeight - self.playlist.height();

        self.playlist.css({
            height:"100%",
            top:0
        });
		
		self.playlistContent.height(mainContainer.height()-50);
		$(self.playlistContent).mCustomScrollbar({
				axis:"y",
				theme:self.options.playlistScrollType,
				scrollButtons:{enable:true},
                snapOffset:50,
				callbacks:{
					onScrollStart:function(){
						//remove click listener
						// console.log("onScrollStart")
                        if(self.isMobile.any()){
                            setTimeout(function(){
                                self.playlistContentOverlay.show()
                                self.scrollingIsOn = true;
                            }, 50);
                        }
					},
					onScroll:function(){
						//add click listener
						// console.log("onScroll (end)")
                        if(self.isMobile.any()){
                            self.playlistContentOverlay.hide()
                            self.scrollingIsOn = false;
                            
                            self.touchmove = false;
                        }
					},
                    whileScrolling:function(){
						//add click listener
                        // self.playlistContentOverlay.show()
                        // self.scrollingIsOn = true;
					}
				}	
		});
    }
    else if(options.playlist=="Bottom playlist")
    {
        self.playlistContent.css("width",String(offsetL)+"px");
        self.playerWidth = self.totalWidth;
        self.playerHeight = self.totalHeight - self.playlist.height();

        self.playlist.css({
            left:0,
            width:"100%",
			bottom:0
            // top:self.playerHeight
        });
		
		self.playlistContent.width(mainContainer.width());
		$(self.playlistContent).mCustomScrollbar({
			axis:"x",
			theme:self.options.playlistScrollType,
			scrollButtons:{enable:true},
			callbacks:{
				onScrollStart:function(){
                    //remove click listener
                    // console.log("onScrollStart")
                    if(self.isMobile.any()){
                        setTimeout(function(){
                            self.playlistContentOverlay.show()
                            self.scrollingIsOn = true;
                        }, 50);
                    }
                },
                onScroll:function(){
                    //add click listener
                    // console.log("onScroll (end)")
                    if(self.isMobile.any()){
                        self.playlistContentOverlay.hide()
                        self.scrollingIsOn = false;
                        
                        self.touchmove = false;
                    }
                },
                whileScrolling:function(){
                    //add click listener
                    // self.playlistContentOverlay.show()
                    // self.scrollingIsOn = true;
                }
			},
			// autoExpandScrollbar:true,
			advanced:{autoExpandHorizontalScroll:true},
			setHeight: 'auto',
			setWidth: 'auto',
		});
    }
	//scroll to specific video
	$(self.playlistContent).mCustomScrollbar("scrollTo", self.item_array[self.videoid]);
    
    $('body').bind('touchmove', function(e) { 
        self.touchmove = true;
    });
};

//prototype object, public functions
PLAYER.Playlist.prototype = {};

PLAYER.Playlist.prototype.hidePlaylist = function(){
	
	this.playlist.hide();
	
}
PLAYER.Playlist.prototype.showPlaylist = function(){
	
	this.playlist.show();
	
}
PLAYER.Playlist.prototype.resizePlaylist = function(val1, val2){
	
	var self=this;
	switch(this.options.playlist) {
		case 'Right playlist':
			this.playlist.css({
				right:0,
				height:"100%"
			});
			this.playlistContent.css({
				top:0,
				height:self.mainContainer.height()-50
			});
			this.playlistContent.height(this.mainContainer.height()-this.playlistBar.height());
			break;
		case 'Bottom playlist':
			this.playlist.css({
				left:0,
				// height:146,
				width:"100%",
				bottom:0
				// top:this.element.height()
			});
			this.playlistContent.height(this.playlist.height()-this.playlistBar.height());
			break;
	}
	this.playlistBarInside.css({
		left:self.playlistBar.width()/2 - this.playlistBarInside.width()/2
	});
	// this.playlistContent.height(this.mainContainer.height()-this.playlistBar.height());
	
}
PLAYER.Playlist.prototype.playYoutube = function(obj_id){
	
	if(this.VIDEO.youtubePlayer!= undefined){
		this.VIDEO.youtubePlayer.cueVideoById(this.videos_array[obj_id].youtubeID);
		this.VIDEO.youtubePlayer.setPlaybackQuality(this.ytQuality);
		this.preloader.hide();
		this.VIDEO.ytWrapper.css({zIndex:501});
		this.VIDEO.ytWrapper.css({visibility:"visible"});
		if(!this.isMobile.any())
			this.VIDEO.youtubePlayer.playVideo();
	}
	this.VIDEO.resizeAll();
	
}
PLAYER.Playlist.prototype.playVimeo = function(obj_id){
	
	this.preloader.hide();
	this.vimeoWrapper.css({zIndex:501});
	if(!this.isMobile.any()){
		$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+this.videos_array[obj_id].vimeoID+"?autoplay=1?api=1&player_id="+self.options.instanceName+"&color="+this.options.vimeoColor);
	}
	else{
		$(self.vimeoWrapper).find('#'+self.options.instanceName).attr("src","https://player.vimeo.com/video/"+this.videos_array[obj_id].vimeoID+"?autoplay=0?api=1&player_id="+self.options.instanceName+"&color="+this.options.vimeoColor);
	}
	
}