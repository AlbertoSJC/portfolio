jQuery(function(){
    var menuOffset = jQuery('#small-menu')[0].offsetTop;
    jQuery(document).bind('ready scroll',function() {
      var docScroll = jQuery(document).scrollTop();
      if(docScroll >= menuOffset) {
        jQuery('#small-menu').addClass('fixed').css('width',jQuery('#masthead').width());
      } else {
        jQuery('#small-menu').removeClass('fixed').removeAttr("width");
      }
     });
  });
  