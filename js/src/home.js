/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'assets/particlesstars.json', function () {
    console.log('callback - particles.js config loaded');
});

window.onload = function () {
    let name = document.getElementById("name");
    let fires = document.getElementById("fires");

    let b_blog = document.getElementById("blog");
    let b_email = document.getElementById("email");
    let b_resume = document.getElementById("resume");
    let b_projects = document.getElementById("projects");
    let b_github = document.getElementById("github");

    let old_name = name.innerHTML;
    let old_fires = fires.innerHTML;

    let old_blog = b_blog.innerHTML;
    let old_email = b_email.innerHTML;
    let old_resume = b_resume.innerHTML;
    let old_projects = b_projects.innerHTML;
    let old_github = b_github.innerHTML;

    b_blog.onmouseover = function () {
        b_blog.innerHTML = "博客";
    };
    b_blog.onmouseout = function () {
        b_blog.innerHTML = old_blog;
    };

    b_email.onmouseover = function () {
        b_email.innerHTML = "邮件";
    };
    b_email.onmouseout = function () {
        b_email.innerHTML = old_email;
    };

    b_resume.onmouseover = function () {
        b_resume.innerHTML = "简历";
    };
    b_blog.onmouseout = function () {
        b_resume.innerHTML = old_resume;
    };

    b_projects.onmouseover = function () {
        b_projects.innerHTML = "项目";
    };
    b_projects.onmouseout = function () {
        b_projects.innerHTML = old_projects;
    };

    b_github.onmouseover = function () {
        b_github.innerHTML = "吉特哈布";
    };
    b_github.onmouseout = function () {
        b_github.innerHTML = old_github;
    };


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
    fires.onmouseout = function () {
        fires.innerHTML = old_fires;
    }
}
