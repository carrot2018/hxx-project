$(document).ready(function () {
    var nick = getCookie("nickname");
    $(".welcome").html(nick)
    var isAdmin = getCookie("isAdmin");

    //如果获取的cookie isAdmin 的 值为“true” 则显示管理员身份和用户管理
    isAdmin === "true" ? ($(".admin").show(), $(".menu-users").show()) : ($(".admin").hide(), $(".menu-users").hide());

    //点击退出弹出提示框，确定则退出到登录页
    $("#quit").click(function () {
        var con;
        con = confirm("退出将回到登录哦！");
        if (con == true) {
            deleteCookie("nickname");
            deleteCookie("isAdmin");
            window.location.reload();
        }
    });
    $(".cancel").click(function () {
        $(".update-box").fadeOut();
    });
    $($(".bms-menu").children("li")).hover(function () {
        $(this).stop().animate({ "height": "120px", "line-height": "120px", "font-size": "20px" }).siblings().stop().animate({ "height": "60px", "line-height": "60px", "font-size": "14px" })
    }, function () {
        $(".bms-menu").children("li").stop().animate({ "height": "80px", "line-height": "80px", "font-size": "16px" })
    });

})



