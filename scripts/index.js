/*global $ajax*/
/*jshint browser: true */
document.addEventListener("DOMContentLoaded", function (event) {
    "use strict";
    
    document.getElementById("name").addEventListener("click", function () {
        $ajax.sendGetRequest("scripts/temp.json", function (request) {
            window.alert(request.name);
        }, true);
    });
    
    var socialEmerged = false,
        socialRunning = false;
    document.getElementById("social").addEventListener("click", function () {
        if (!socialRunning) {
            var tags = document.getElementsByClassName("social-tag"),
                num = 0;
            if (!socialEmerged) {
                num = 0;
                var timer_in = window.setInterval(function () {
                    socialRunning = true;
                    if (num < 3) {
                        tags[num].style.display = "block";
                        tags[num].style.animation = "emerge .15s ";
                    }
                    if (num > 0) {
                        tags[num - 1].style.opacity = 1;
                    }
                    if (num === 3) {
                        window.clearInterval(timer_in);
                        socialRunning = false;
                        socialEmerged = true;
                    }
                    num ++;
                }, 50);
            } else {
                num = 2;
                var timer_out = window.setInterval(function () {
                    socialRunning = true;
                    if (num > -1) {
                        tags[num].style.animation = "vanish .15s ";
                    }
                    if(num < 2){
                        tags[num + 1].style.display = "none";
                        tags[num + 1].style.opacity = 0;
                    }
                    if (num === -1) {
                        window.clearInterval(timer_out);                       
                        socialRunning = false;
                        socialEmerged = false;
                    }
                    num --;
                }, 50);
            }
        }
    });
});