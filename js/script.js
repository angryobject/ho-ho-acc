(function($, window, document, undefined) {
  prettyPrint();

  $("#example1").hoHoAcc({gapMin: 10, gapMax: 20});
  $("#example2").hoHoAcc({panelWidth: 668});
  $("#example3").hoHoAcc({speed: 600});
  $("#example4").hoHoAcc({gapMin: 5, gapMax: 15});

  $("#example4").on("expandPanelStart", function(e) {
  	$(this).find("h2").addClass("dull");
  });
  $("#example4").on("collapsePanelStart", function(e) {
    $(this).find("h2").removeClass("dull");
  });
})(jQuery, window, document);
