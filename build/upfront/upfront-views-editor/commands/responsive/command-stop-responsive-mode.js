!function(t){var n=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/upfront-views-editor/commands/command"],function(e){return e.extend({enabled:!0,className:"exit-responsive sidebar-commands-small-button",render:function(){this.$el.html("<span title='"+n.exit_responsive+"'>"+n.exit_responsive+"</span>")},on_click:function(){t("li.desktop-breakpoint-activate").trigger("click"),Upfront.Events.trigger("upfront:exit:responsive"),Upfront.Application.start_previous()}})})}(jQuery);