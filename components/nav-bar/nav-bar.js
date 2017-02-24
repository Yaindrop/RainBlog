/*global $ajax*/
/*jshint browser: true */

/*
This script should be put in the root directory of the component and be named the same as the componentID.

Instructions:
    1. This script should run as soon as the component is loaded to the page, so make it a IIFE.
    2. When the uninstall function is called, any external effects made by this script should be inversed.
*/
(function () {
    "use strict";
    var component = document.getElementById("nav-bar");
    var body = document.getElementsByTagName("body")[0];
    var ContentWrapper = document.getElementById("content-wrapper");
    
    var content = document.getElementById("nb-content");
    var title = document.getElementById("nb-title");
    var menu = document.getElementById("nb-menu");
    var socialMenu = document.getElementById("nb-social");
    var socialItems = document.getElementsByClassName("nb-social-item");
    var socialStatus = new MenuStatus ();
    var settingsMenu = document.getElementById("nb-settings");
    var settingsItems = document.getElementsByClassName("nb-settings-item");
    var settingsStatus = new MenuStatus ();
    
    function MenuStatus () {
        this.isAnimating = false;
        this.isShown = false;
    }
    function showMenu (items, status) {
        if (status.isAnimating || status.isShown) return;
        status.isAnimating = true;
        var count = 0,
            timer = window.setInterval(function () {
                items[count].classList.toggle("nb-item-shown");
                count ++;
                if (count === items.length) {
                    window.clearInterval(timer);
                    status.isShown = true;
                    status.isAnimating = false;
                }
            }, 100);
    }
    function hideMenu (items, status) {
        if (status.isAnimating || !status.isShown) return;
        status.isAnimating = true;
        var count = items.length - 1,
            timer = window.setInterval(function () {
                items[count].classList.toggle("nb-item-shown");
                count --;
                if (count === -1) {
                    window.clearInterval(timer);
                    status.isShown = false;
                    status.isAnimating = false;
                }
            }, 100);
    }
    function toggleMenu (items, status) {
        if (status.isShown) {
            hideMenu(items, status);
        } else {
            showMenu(items, status);
        }
    }
    var lastPos = 0;
    var isHidden = false;
    
    function checkScroll () {
        if (document.body.scrollTop > component.offsetHeight && document.body.scrollTop > lastPos + 5) {
            if (!isHidden) {
                title.classList.add("hidden-nb-content");
                menu.classList.add("hidden-nb-content");
                component.classList.add("hidden-nb");
                hideMenu(socialItems, socialStatus);
                isHidden = true;
            }
        } else if (document.body.scrollTop < lastPos - 5){
            if (isHidden) {
                title.classList.remove("hidden-nb-content");
                menu.classList.remove("hidden-nb-content");
                component.classList.remove("hidden-nb");
                isHidden = false;
            }
        }
        lastPos = document.body.scrollTop;
    }
    
    function install () {
        component.style.display = "block";
        ContentWrapper.innerHTML = "<div id=\"nav-space\"></div>" + ContentWrapper.innerHTML;
        window.onscroll = checkScroll;
        component.active = true;
    }
    function uninstall () {
        component.style.display = "none";
        ContentWrapper.removeChild(document.getElementById("nav-space"));
        component.active = false;
    }
    
    install ();
    socialMenu.addEventListener("click", function () {
        toggleMenu(socialItems, socialStatus);
    });
    settingsMenu.addEventListener("click", function () {
        toggleMenu(settingsItems, settingsStatus);
    });
    ContentWrapper.addEventListener("click", function () {
        hideMenu(socialItems, socialStatus);
    });
    ContentWrapper.addEventListener("touchstart", function () {
        hideMenu(socialItems, socialStatus);
    });
    
    component.addEventListener("install", install);
    component.addEventListener("uninstall", uninstall);
})();