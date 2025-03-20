//Aquí empieza la biografia
$('#first-mumimage').on('click', function(){
	
    $("#second-mumimage").css("filter","saturate(0%)");
    $("#third-mumimage").css("filter","saturate(0%)");
    $("#fourth-mumimage").css("filter","saturate(0%)");
    $("#first-mumimage").css("filter","saturate(100%)");
    $("#first-mumtext").css("opacity", "0");
    $("#fourth-mumtext").addClass("animation1");
    $("#second-mumtext").addClass("animation1");
    $("#third-mumtext").addClass("animation1");
    $("#second-mumtext").removeClass("animation2");
    $("#third-mumtext").removeClass("animation2");
    $("#fourth-mumtext").removeClass("animation2");
    $("#first-mumtext").removeClass("animation2");
    $("#first-mumtext").addClass("animation2");
;
});
$('#second-mumimage').on('click', function(){
	
    $("#first-mumimage").css("filter","saturate(0%)");
    $("#third-mumimage").css("filter","saturate(0%)");
    $("#fourth-mumimage").css("filter","saturate(0%)");
    $("#second-mumimage").css("filter","saturate(100%)");
    $("#first-mumtext").addClass("animation1");
    $("#fourth-mumtext").addClass("animation1");
    $("#third-mumtext").addClass("animation1");
    $("#first-mumtext").removeClass("animation2");
    $("#third-mumtext").removeClass("animation2");
    $("#fourth-mumtext").removeClass("animation2");
    $("#second-mumtext").addClass("animation2");
    
});
$('#third-mumimage').on('click', function(){
	
    $("#second-mumimage").css("filter","saturate(0%)");
    $("#first-mumimage").css("filter","saturate(0%)");
    $("#fourth-mumimage").css("filter","saturate(0%)");
    $("#third-mumimage").css("filter","saturate(100%)");
    $("#first-mumtext").addClass("animation1");
    $("#second-mumtext").addClass("animation1");
    $("#fourth-mumtext").addClass("animation1");
    $("#first-mumtext").removeClass("animation2");
    $("#second-mumtext").removeClass("animation2");
    $("#fourth-mumtext").removeClass("animation2");
    $("#third-mumtext").addClass("animation2");
    
});
$('#fourth-mumimage').on('click', function(){
	
    $("#second-mumimage").css("filter","saturate(0%)");
    $("#third-mumimage").css("filter","saturate(0%)");
    $("#first-mumimage").css("filter","saturate(0%)");
    $("#fourth-mumimage").css("filter","saturate(100%)");
    $("#first-mumtext").addClass("animation1");
    $("#second-mumtext").addClass("animation1");
    $("#third-mumtext").addClass("animation1");
    $("#first-mumtext").removeClass("animation2");
    $("#third-mumtext").removeClass("animation2");
    $("#second-mumtext").removeClass("animation2");
    $("#fourth-mumtext").addClass("animation2");
    
});



//Aqui empieza la discografia

$(".discographyClass").on("click", function() {
    $(".disco-left").addClass("discoanimate1");
    $(".disco-right").addClass("discoanimate2");
    $(".black-blurred").css("opacity", "1");

});
$("#disco-1").on ("click", function() {
    $("#wilder-mind").css("transform", "scale(0.3)");
    $("#delta").css("transform", "scale(0.3)");
    $("#sigh-no-more").css("transform", "scale(0.3)");
    $("#wilder-mind").css("opacity", "0");
    $("#sigh-no-more").css("opacity", "0");
    $("#delta").css("opacity", "0");
    $("#babel").css("opacity", "1");
    $("#babel").css("transform", "scale(1.0)")
})
$("#disco-2").on ("click", function() {
    $("#wilder-mind").css("transform", "scale(0.3)");
    $("#babel").css("transform", "scale(0.3)");
    $("#sigh-no-more").css("transform", "scale(0.3)");
    $("#babel").css("opacity", "0");
    $("#sigh-no-more").css("opacity", "0");
    $("#wilder-mind").css("opacity", "0");
    $("#delta").css("opacity", "1");
    $("#delta").css("transform", "scale(1.0)");
})
$("#disco-3").on ("click", function() {
    $("#wilder-mind").css("transform", "scale(0.3)");
    $("#delta").css("transform", "scale(0.3)");
    $("#babel").css("transform", "scale(0.3)");
    $("#babel").css("opacity", "0");
    $("#wilder-mind").css("opacity", "0");
    $("#delta").css("opacity", "0");
    $("#sigh-no-more").css("opacity", "1");
    $("#sigh-no-more").css("transform", "scale(1.0)");
})
$("#disco-4").on ("click", function() {
    $("#babel").css("transform", "scale(0.3)");
    $("#delta").css("transform", "scale(0.3)");
    $("#sigh-no-more").css("transform", "scale(0.3)");
    $("#babel").css("opacity", "0");
    $("#sigh-no-more").css("opacity", "0");
    $("#delta").css("opacity", "0");
    $("#wilder-mind").css("opacity", "1");
    $("#wilder-mind").css("transform", "scale(1.0)");
})


