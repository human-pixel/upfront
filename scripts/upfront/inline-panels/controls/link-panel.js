define([
	'scripts/upfront/inline-panels/dialog-control'
], function (DialogControl) {
	var LinkPanelControl = DialogControl.extend({
		initialize: function(options) {
			this.options = options || {};
			this.constructor.__super__.initialize.call(this, options);

			this.icon = this.options.icon;
			this.tooltip = this.options.tooltip;
			this.id = this.options.id;

			this.view = new Upfront.Views.Editor.LinkPanel({
				model: this.model,
				button: false
			});
		},

		onClickOk: function(event){
			event.preventDefault();
			if (this.view.model.get('type') === 'lightbox' && this.view.$el.find('.js-ulinkpanel-lightbox-input').val() !== '')
				this.view.createLightBox();
			this.close();
		}
	});

	return LinkPanelControl;
});
