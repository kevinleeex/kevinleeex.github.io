/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'assets/particlesstars.json', function () {
    console.log('callback - particles.js config loaded');
});

window.onload = function () {
    let name = document.getElementById("name");
    let fires = document.getElementById("fires");
    let old_name = name.innerHTML;
    let old_fires = fires.innerHTML;
    name.onmouseover = function () {
        name.innerHTML = "李灯举";
    };
    name.onmouseout = function () {
        name.innerHTML = old_name;
    };

    fires.onmouseover = function () {
        fires.innerHTML = "<span class='icon has-text-warning'><i class='fas fa-code'></i></span><span style='color: azure'> with </span>" +
            "<span class='icon has-text-warning'><i class='fas fa-heart'></i></span>";
    }
    fires.onmouseleave = function () {
        fires.innerHTML = old_fires;
    }
}
