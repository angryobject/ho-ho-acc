(function($, window, document, undefined) {
  $("#about-example1").hoHoAcc({gapMin: 10, gapMax: 20});
  $("#about-example2").hoHoAcc();
  $("#about-example3").hoHoAcc({speed: 600});
  $("#about-example4").hoHoAcc({gapMin: 5, gapMax: 15});

  $("#about-example4").on("expandPanelStart", function(e) {
  	$(this).find("h2").addClass("dull");
  });
  $("#about-example4").on("collapsePanelStart", function(e) {
    $(this).find("h2").removeClass("dull");	
  });
})(jQuery, window, document);
