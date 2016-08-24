(function ($) {
define([
	'elements/upfront-posts/js/post-list-settings-panels',
	'scripts/upfront/element-settings/settings',
	'scripts/upfront/element-settings/advanced-settings',
	'scripts/upfront/preset-settings/util',
	'text!elements/upfront-widget/tpl/preset-style.html'
], function(Panels, ElementSettings, AdvancedSettings, Util, styleTpl) {

var l10n = Upfront.Settings.l10n.posts_element;

var PostsSettings = ElementSettings.extend({
	panels: {},

	initialize: function (opts) {
		
		this.constructor.__super__.initialize.call(this, opts);

		this.panels = _.extend({ General: Panels.General, Parts: Panels.PostParts }, this.panels);
		
		this.stopListening(Upfront.Events, 'posts:settings:dispatched');
		this.stopListening(Upfront.Events, 'posts:post:added');
		this.stopListening(Upfront.Events, 'posts:post:removed');
		
		this.listenTo(Upfront.Events, 'posts:settings:dispatched', this.rerender, this);
		this.listenTo(Upfront.Events, 'posts:post:added', this.rerender, this);
		this.listenTo(Upfront.Events, 'posts:post:removed', this.rerender, this);
		
		ElementSettings.prototype.initialize.apply(this, opts);
	},

	rerender: function () {
		var active_panel = -1,
			panels = _(this.panels),
			me = this
		;

		panels.each(function (pl, idx) {
			if (pl && pl.is_active && pl.is_active()) active_panel = idx;
		});

		this.$el.empty();

		this.initialize(this.options);

		this.render();

		if (active_panel.length >= 0 && this.toggle_panel) this.toggle_panel(active_panel);
	},

	/**
	 * Toggles the active panel on
	 *
	 * @param {Int} panel_idx Panel index to toggle on
	 */
	toggle_panel: function (panel_idx) {
		if (panel_idx < 0) return false;
		_.each(this.panels, function (panel, idx) {
			if (panel_idx === idx && (panel || {}).showBody) panel.showBody();
			else if ((panel || {}).hideBody) panel.hideBody();
		});
	},

	title: l10n.posts_settings,

	get_title: function () {
		return l10n.settings;
	}
});

// Generate presets styles to page
Util.generatePresetsToPage('posts', styleTpl);

return PostsSettings;

});
})(jQuery);
