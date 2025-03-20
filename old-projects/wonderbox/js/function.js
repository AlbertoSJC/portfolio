$(window).scroll(function () {
    var $heightScrolled = $(window).scrollTop();
    var $defaultHeight = 50;

    if ($heightScrolled < $defaultHeight) {
        $('#mynav').removeClass("b")
        $('#mynav').addClass("a")
    }
    else {
        $('#mynav').addClass("b")
    }

});