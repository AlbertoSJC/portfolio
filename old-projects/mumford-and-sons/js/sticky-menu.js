
 jQuery(function(){
    var menuOffset = jQuery('#menu')[0].offsetTop;
    jQuery(document).bind('ready scroll',function() {
      var docScroll = jQuery(document).scrollTop();
      if(docScroll >= menuOffset) {
        jQuery('#menu').addClass('fixed').css('width',jQuery('#masthead').width());
      } else {
        jQuery('#menu').removeClass('fixed').removeAttr("width");
      }
     });
  });
  
  
