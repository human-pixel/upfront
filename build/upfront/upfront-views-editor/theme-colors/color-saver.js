!function(e){define([],function(){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views,n=function(){var n=[],o=function(e,n,o){var r={action:"upfront_update_theme_colors",theme_colors:e[0],range:e[1]};Upfront.Util.post(r).done(function(){n.resolve()}).fail(function(){n.reject(),Upfront.Views.Editor.notify(t.theme_colors_save_fail)});var i={action:"upfront_save_theme_colors_styles",styles:e[2]};Upfront.Util.post(i).done(function(){o.resolve()}).fail(function(){o.reject(),Upfront.Views.Editor.notify(t.theme_color_style_save_fail)})};this.save=function(){for(var t=[],r=e.Deferred();n.length;){var i=e.Deferred(),f=e.Deferred();t.push(i),t.push(f),o(n.pop(),i,f)}return t.length>0?(e.when.apply(e,t).done(function(){r.resolve()}).fail(function(){r.reject()}),r):r.resolve()},this.queue=function(e){n.push(e)}},o=new n;return o})}(jQuery);