/* global $ajax*/
/* jshint browser: true */
(function (external) {
    "use strict";
    var name = "music-player";
    var component = {};
    var css;
    var html;
    var body = document.getElementsByTagName("body")[0];
    var head = document.getElementsByTagName("head")[0];
    var ContentWrapper = document.getElementById("content-wrapper");
    
    var showButton, controller, bar;
    
    var musicButtons, cover, hideButton, pauseButton, forwardButton, backwardButton, listButton, playmodeButton;
    
    var musicInfos, musicTitle, musicArtist, musicAlbum;
    
    var musicProgress, musicCurrent, musicProgressControl, musicDuration;
    
    var audioContainer;
    
    var loadedAudio = null;
    
    var listLength= 2;
    var listIndex = 0;
    
    var isPaused = true;
    var checkProgress;
    
    function load () {
        css = document.createElement("link");
        css.href = "\/components\/" + name + "\/" + name + ".css";
        css.type = "text/css";
        css.rel = "stylesheet";
        head.appendChild(css);
        window.console.log("%c" + name +"> Component CSS Loaded:", "color: green");
        
        $ajax.sendGetRequest("\/components\/" + name + "\/" + name + ".html", function (request) {
            //Parse returned HTML to div element, and append to body
            //Note: The order is determined by the returning order of the AJAX requests.
            html = parseStringToElement(request);
            body.appendChild(html);
            window.console.log("%c" + name +"> Component HTML Loaded:", "color: green");
            initialize();  
        });
    }
    function initialize () {
        showButton = document.getElementById("player-minimized");
        controller = document.getElementById("player-controller");
        bar = document.getElementById("player-bar");

        musicButtons = document.getElementsByClassName("music-button");
        cover = document.getElementById("controller-cover");
        hideButton = document.getElementById("controller-hide");
        pauseButton = document.getElementById("controller-pause");
        forwardButton = document.getElementById("controller-forward");
        backwardButton = document.getElementById("controller-backward");
        listButton = document.getElementById("controller-list");
        playmodeButton = document.getElementById("controller-playmode");

        musicInfos = document.getElementsByClassName("music-info");
        musicTitle = document.getElementById("info-title");
        musicArtist = document.getElementById("info-artist");
        musicAlbum = document.getElementById("info-album");

        musicProgress = document.getElementById("bar-progress");
        musicCurrent = document.getElementById("progress-current");
        musicProgressControl = document.getElementById("progress-control");
        musicDuration = document.getElementById("progress-duration");
        
        audioContainer = document.getElementById("audio-container");
        
        showButton.addEventListener("click", showPlayer);
        hideButton.addEventListener("click", hidePlayer);
        
        cover.addEventListener("mouseenter", showMB);
        controller.addEventListener("mouseleave", hideMB);
        controller.addEventListener("click", showMB);
        
        pauseButton.addEventListener("click", PauseOrResume);
    
        for (var i = 0; i < musicInfos.length; i ++) {
            musicInfos[i].addEventListener("mouseenter", setInfoActive(musicInfos, i));
            musicInfos[i].addEventListener("mouseleave", removeInfoActive(musicInfos, i));
            musicInfos[i].addEventListener("click", setInfoActive(musicInfos, i));
            ContentWrapper.addEventListener("touchstart", removeInfoActive(musicInfos, i));
        }
        musicProgress.addEventListener("mousedown", function (e) {
            if (!isOnBar) {
                isOnBar = true;
                console.log("enterBar");
                toTime = (e.pageX - getPos(musicProgress).x)/musicProgress.offsetWidth;
            }
        });
        musicProgress.addEventListener("mouseup", function () {
            if (isOnBar) {
                isOnBar = false;
                setTime();
                console.log("leaveBar - release");
            }
        });
        musicProgress.addEventListener("mouseleave", function () {
            if (isOnBar) {
                isOnBar = false;
                console.log("leaveBar - out");
            }
        });
        musicProgress.addEventListener("mousemove", function (e) {
            if (isOnBar) {
                toTime = (e.pageX - getPos(musicProgress).x)/musicProgress.offsetWidth;
            }
        });
        component.install = install;
        component.uninstall = uninstall;
        install();
    }
    function install () {
        ContentWrapper.addEventListener("touchstart", hideMB);
        external[name] = component;
        window.console.log("%c" + name +"> Component Installed", "color: green");
    }
    function uninstall () {
        ContentWrapper.removeEventListener("touchstart", hideMB);
        delete external[name];
        css.parentNode.removeChild(css);
        html.innerHTML = "";
        html.parentNode.removeChild(html);
        window.console.log("%c" + name +"> Component Uninstalled", "color: green");
    }
    
    /*Player Show & Hide*/
    function showPlayer () {
        var count = 0,
            timer = window.setInterval(function () {
                if (count === 0) showButton.classList.add("player-minimized-hide");
                if (count === 1) controller.classList.add("player-shown");
                if (count === 2) {
                    bar.classList.add("player-shown");
                    window.clearInterval(timer);
                }
                count ++;
            }, 200);
    }
    function hidePlayer () {
        var count = 0,
            timer = window.setInterval(function () {
                if (count === 0) bar.classList.toggle("player-shown");
                if (count === 1) controller.classList.toggle("player-shown");
                if (count === 2) {
                    showButton.classList.toggle("player-minimized-hide");
                    window.clearInterval(timer);
                }
                count ++;
            }, 100);
    }
    
        /*Music Button Show & Hide*/
    var MBShown = false;
    function showMB () {
        if (MBShown) return;
        for (var i = 0; i < musicButtons.length; i ++) {
            musicButtons[i].classList.add("music-button-shown");
        }
        MBShown = true;
    }
    function hideMB () {
        if (!MBShown) return;
        for (var i = 0; i < musicButtons.length; i ++) {
            musicButtons[i].classList.remove("music-button-shown");
        }
        MBShown = false;
    }
    
        /*Music Info Active & Inactive*/
    function setInfoActive (infos, index) {
        return function () {
            infos[index].classList.add("info-active");
            for (var i = 0; i < infos.length; i ++) {
                if (i === index) continue;
                infos[i].classList.add("info-inactive");
            }
        };
    }
    function removeInfoActive (infos, index) {
        return function () {
            infos[index].classList.remove("info-active");
            for (var i = 0; i < infos.length; i ++) {
                if (i === index) continue;
                infos[i].classList.remove("info-inactive");
            }
        };
    }
    
        /*Control Audio*/
    function PauseOrResume () {
        if (loadedAudio) {
            if (audioContainer.paused) {
                audioContainer.play();
                pauseButton.style.backgroundImage = "url(/components/music-player/resources/pause.png)";
                checkProgress = window.setInterval(listenTime, 500);
            } else {
                audioContainer.pause();
                pauseButton.style.backgroundImage = "url(/components/music-player/resources/resume.png)";
                window.clearInterval(checkProgress);
            }
        } else {
            requestAudio();
        }
    }
    function listenTime() {
        if (loadedAudio !== null && !audioContainer.paused) {
            musicCurrent.innerHTML = parseInt(audioContainer.currentTime / 60) + ":" + parseInt(audioContainer.currentTime % 60);
            musicDuration.innerHTML = parseInt(audioContainer.duration / 60) + ":" + parseInt(audioContainer.duration % 60);
        }
    }
    function requestAudio () {
        $ajax.sendGetRequest("/components/music-player/playlist/" + listIndex + ".json", function (request) {
        loadedAudio = request;
        loadAudio();
        }, true);
    }
    function loadAudio () {
        window.console.log(loadedAudio);
        audioContainer.src = loadedAudio.external_link;
        cover.style.backgroundImage = "url(" + loadedAudio.album_cover + ")";
        musicTitle.innerHTML = loadedAudio.title;
        musicArtist.innerHTML = loadedAudio.artist;
        musicAlbum.innerHTML = loadedAudio.album;
        audioContainer.volume = loadedAudio.default_volume;
        audioContainer.load();
        PauseOrResume();
    }
    
    
    /*Control Bar*/
    var isOnBar = false;
    var toTime = null;
    function setTime () {
        audioContainer.currentTime = audioContainer.duration * toTime;
    }
    function getPos (ele) {
        var eleParent;
        var eleLeft = ele.offsetLeft;
        var eleTop = ele.offsetLeft;
        while(ele.offsetParent) {
            eleParent = ele.offsetParent;
            eleLeft += eleParent.offsetLeft;
            eleTop += eleParent.offsetTop;
            ele = eleParent;
        }
        return {x: eleLeft, y: eleTop};
    }
    load ();
}) (window);