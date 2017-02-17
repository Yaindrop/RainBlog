/*global $ajax*/
document.addEventListener("DOMContentLoaded", function (event) {
    "use strict";
    document.getElementById("name").addEventListener("click", function () {
        $ajax.sendGetRequest("scripts/temp.json", function (request) {
            window.alert(request.name);
        }, true);
    });
});