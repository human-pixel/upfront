;(function($){
  $(function () {
    $('body').on('touchstart click', '.tabs-tab', function(event) {
      var $tab = $(event.currentTarget);
      var contentId;

      if ($tab.hasClass('tabs-tab-active')) {
        return;
      }

      $tab.addClass('tabs-tab-active');
      $tab.siblings().removeClass('tabs-tab-active');

      contentId = $tab.data('content-id');
      $('#' + contentId).addClass('utab-content-active')
        .siblings().removeClass('utab-content-active');
    });
  });
})(jQuery);
