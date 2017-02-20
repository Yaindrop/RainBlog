/*global $ajax*/
/*jshint browser: true */
document.addEventListener("DOMContentLoaded", function (event) {
    "use strict";
    
    function MenuStatus () {
        this.isAnimating = false;
        this.isShown = false;
    }
    
    var socialItems = document.getElementsByClassName("social-item");
    var socialStatus = new MenuStatus ();
    
    document.getElementById("social").addEventListener("click", function () {
        toggleMenu(socialItems, socialStatus);
    });
    document.querySelector("body").addEventListener("click", function () {
        hideMenu(socialItems, socialStatus);
    });
    document.querySelector("body").addEventListener("touchstart", function () {
        hideMenu(socialItems, socialStatus);
    });
    
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
});