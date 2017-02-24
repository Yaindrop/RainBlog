/* global $ajax*/
/* jshint browser: true */
(function () {
    "use strict";
    var component = document.getElementById("music-player");
    var content = document.getElementById("content-wrapper");
    var showButton = document.getElementById("player-minimized");
    var controller = document.getElementById("player-controller");
    var bar = document.getElementById("player-bar");
    
    var musicButtons = document.getElementsByClassName("music-button");
    var cover = document.getElementById("controller-cover");
    var hideButton = document.getElementById("controller-hide");
    var pauseButton = document.getElementById("controller-pause");
    var forwardButton = document.getElementById("controller-forward");
    var backwardButton = document.getElementById("controller-backward");
    var listButton = document.getElementById("controller-list");
    var playmodeButton = document.getElementById("controller-playmode");
    
    var musicInfos = document.getElementsByClassName("music-info");
    var musicTitle = document.getElementById("info-title");
    var musicArtist = document.getElementById("info-artist");
    var musicAlbum = document.getElementById("info-album");
    
    var musicCurrent = document.getElementById("progress-current");
    var musicProgressController = document.getElementById("progress-control");
    var musicProgressMark = document.getElementById("progress-control");
    var musicDuration = document.getElementById("progress-duration");
    
    var musicList = [];
    
    var ajaxLoadedEvent = $ajax.makeEvent();
    var audioContainer = document.getElementById("audio-container");
    var loadedAudio = null;
    var listindex = 0;
    var isPaused = true;
    var checkProgress;
    
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
    function requestAudio () {
        $ajax.sendGetRequest("/components/music-player/playlist/" + listindex + ".json", function (request) {
        loadedAudio = request;
        audioContainer.dispatchEvent(ajaxLoadedEvent);
        }, true);
    }
    
    
    /*Control Bar*/
    var musicBar = document.getElementById("bar-progress");
    var isOnBar = false;
    var toTime = null;
    musicBar.addEventListener("mousedown", function (e) {
        if (!isOnBar) {
            isOnBar = true;
            window.console.log("enterBar");
            toTime = (e.pageX - getPos(musicBar).x)/musicBar.offsetWidth;
        }
    });
    musicBar.addEventListener("mouseup", function () {
        if (isOnBar) {
            isOnBar = false;
            barSetTime();
            window.console.log("leaveBar - release");
        }
    });
    musicBar.addEventListener("mouseleave", function () {
        if (isOnBar) {
            isOnBar = false;
            window.console.log("leaveBar - out");
        }
    });
    musicBar.addEventListener("mousemove", function (e) {
        if (isOnBar) {
            toTime = (e.pageX - getPos(musicBar).x)/musicBar.offsetWidth;
        }
    });
    function barSetTime () {
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
    
    install ();
    showButton.addEventListener("click", showPlayer);
    hideButton.addEventListener("click", hidePlayer);
    
    cover.addEventListener("mouseenter", showMB);
    controller.addEventListener("mouseleave", hideMB);
    controller.addEventListener("click", showMB);
    
    pauseButton.addEventListener("click", PauseOrResume);
    
    function install () {
        component.style.display = "block";
        content.addEventListener("touchstart", hideMB);
        component.active = true;
    }
    function uninstall () {
        component.style.display = "none";
        content.removeEventListener("touchstart", hideMB);
        component.active = false;
    }
    
    for (var i = 0; i < musicInfos.length; i ++) {
        musicInfos[i].addEventListener("mouseenter", setInfoActive(musicInfos, i));
        musicInfos[i].addEventListener("mouseleave", removeInfoActive(musicInfos, i));
        musicInfos[i].addEventListener("click", setInfoActive(musicInfos, i));
        content.addEventListener("touchstart", removeInfoActive(musicInfos, i));
    }
    
    audioContainer.addEventListener("ajaxfinished", loadAudio);
    
    component.addEventListener("install", install);
    component.addEventListener("uninstall", uninstall);
}) ();