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
    var content = document.getElementById("content-wrapper");
    
    var socialMenu = document.getElementById("social");
    var socialItems = document.getElementsByClassName("social-item");
    var socialStatus = new MenuStatus ();
    
    function MenuStatus () {
        this.isAnimating = false;
        this.isShown = false;
    }
    function showMenu (items, status) {
        if (status.isAnimating || status.isShown) return;
        status.isAnimating = true;
        var count = 0,
            timer = window.setInterval(function () {
                items[count].classList.toggle("social-item-shown");
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
                items[count].classList.toggle("social-item-shown");
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
    
    function install () {
        component.style.display = "block";
        content.innerHTML = "<div id=\"nav-space\"></div>" + content.innerHTML;
        component.active = true;
    }
    function uninstall () {
        component.style.display = "none";
        content.removeChild(document.getElementById("nav-space"));
        component.active = false;
    }
    
    install ();
    socialMenu.addEventListener("click", function () {
        toggleMenu(socialItems, socialStatus);
    });
    content.addEventListener("click", function () {
        hideMenu(socialItems, socialStatus);
    });
    content.addEventListener("touchstart", function () {
        hideMenu(socialItems, socialStatus);
    });
    
    component.addEventListener("install", install);
    component.addEventListener("uninstall", uninstall);
})();