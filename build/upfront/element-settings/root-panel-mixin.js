(function(e){define([],function(){var t={className:"uf-settings-panel upfront-settings_panel",events:{"click .uf-settings-panel__title":"toggleBody"},getTitle:function(){var e=this.options.title?this.options.title:this.title;return e=e?e:"Default Panel Title",e},getBody:function(){var t=e("<div />");return t.append("<p>Implement getBody() in child class</p>"),t},toggleBody:function(){this.$el.find(".uf-settings-panel__body").toggle(),this.$el.toggleClass("uf-settings-panel--expended")},render:function(){var e;this.$el.html('<div class="uf-settings-panel__title">'+this.getTitle()+"</div>"),e=this.getBody(),e.addClass("uf-settings-panel__body"),this.$el.append(e)}};return t})})(jQuery);