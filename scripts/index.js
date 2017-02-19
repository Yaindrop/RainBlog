/*global $ajax*/
/*jshint browser: true */
document.addEventListener("DOMContentLoaded", function (event) {
    "use strict";
    
    /*ajax temp code*/
    document.getElementById("name").addEventListener("click", function () {
        $ajax.sendGetRequest("scripts/temp.json", function (request) {
            window.alert(request.name);
        }, true);
    });
    
    /*Social Tag Animation*/
    var socialRunning = false,
        socialShown = false;
    document.getElementById("social").addEventListener("click", function () {
        if (!socialRunning) {
            var tags = document.getElementsByClassName("social-tag");
            socialRunning = true;
            var num;
            if (!socialShown) {
                num = 0;
            } else {
                num = tags.length - 1;
            }
            var timer = window.setInterval(function () {
                tags[num].classList.toggle("social-tag-shown");
                if (!socialShown) {
                    num ++;
                } else {
                    num --;
                }
                if ((socialShown && num == -1)||num === tags.length) {
                    window.clearInterval(timer);
                    socialShown = !socialShown;
                    socialRunning = false;
                }
            }, 100);
        }
    });
    
    /*Back to Top*/
    document.getElementById("back-to-top").addEventListener("click", smoothscroll);
    function smoothscroll () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo (0,currentScroll - (currentScroll/4));
        }
    }
    /*Music Player*/
    /*Player Show & Hide*/
    document.getElementById("player-button").addEventListener("click", function () {
        var button = document.getElementById("player-button");
        var control = document.getElementById("player-control");
        var bar = document.getElementById("player-bar");
        var num = 0,
            timer = window.setInterval(function () {
                if (num === 0) button.classList.toggle("player-button-hide")
                if (num === 1) control.classList.toggle("player-shown");
                if (num === 2) {
                    bar.classList.toggle("player-shown");
                    window.clearInterval(timer);
                }
                num ++;
            }, 160);
    });
    document.getElementById("music-hide").addEventListener("click", function () {
        var button = document.getElementById("player-button");
        var control = document.getElementById("player-control");
        var bar = document.getElementById("player-bar");
        var button = document.getElementById("player-button");
        var control = document.getElementById("player-control");
        var bar = document.getElementById("player-bar");
        var num = 0,
            timer = window.setInterval(function () {
                if (num === 0) bar.classList.toggle("player-shown");
                if (num === 1) control.classList.toggle("player-shown");
                if (num === 2) {
                    button.classList.toggle("player-button-hide")
                    window.clearInterval(timer);
                }
                num ++;
            }, 160);
    });
    /*Music Button Show & Hide*/
    var MBShowed = false;
    function showMB () {
        if(!MBShowed){
            var buttons = document.getElementsByClassName("music-button");
            for (var i = 0; i < buttons.length; i ++) {
                buttons[i].classList.toggle("music-button-shown");
            }
        }
        MBShowed = true;
    }
    function hideMB () {
        if(MBShowed){
            var buttons = document.getElementsByClassName("music-button");
            for (var i = 0; i < buttons.length; i ++) {
                buttons[i].classList.toggle("music-button-shown");
            }
        }
        MBShowed = false;
    }
    document.getElementById("music-cover").addEventListener("mouseenter", showMB);
    document.getElementById("player-control").addEventListener("mouseleave", hideMB);
    document.getElementById("player-control").addEventListener("click", function () {
        if(!MBShowed) showMB();
    });
    document.getElementById("content").addEventListener("click", function () {
        if(MBShowed) hideMB();
    });
    document.getElementById("music-title").addEventListener("click", function () {
        document.getElementById("music-title").classList.toggle("info-active");
    });
});