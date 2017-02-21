/*global $ajax*/
/*jshint browser: true */
(function () {
    
    "use strict";
    
    var content = document.getElementById("content");
    content.innerHTML = "<div id=\"nav-space\"></div>" + content.innerHTML;
    
    function MenuStatus () {
        this.isAnimating = false;
        this.isShown = false;
    }
    var socialMenu = document.getElementById("social");
    var socialItems = document.getElementsByClassName("social-item");
    var socialStatus = new MenuStatus ();
    
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
    
    socialMenu.addEventListener("click", function () {
        toggleMenu(socialItems, socialStatus);
    });
    content.addEventListener("click", function () {
        hideMenu(socialItems, socialStatus);
    });
    content.addEventListener("touchstart", function () {
        hideMenu(socialItems, socialStatus);
    });
})();