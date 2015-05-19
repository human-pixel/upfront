define(function() {
	var SelectPresetField = Upfront.Views.Editor.Field.Chosen_Select.extend({
		className: 'preset select-preset-field',

		render: function() {
			Upfront.Views.Editor.Field.Chosen_Select.prototype.render.call(this);
			var me = this;
			var html = ['<a href="#" title="Edit preset" class="upfront-preset-edit">edit preset</a>'];
			this.$el.append(html.join(''));
			
			this.$el.find('.upfront-chosen-select').chosen({
				width: '230px'
			});

			this.$el.on('click', '.upfront-preset-edit', function(event) {
				event.preventDefault();

				if (me.get_value() === 'default') {
					alert('Default preset can not be edited.');
					return;
				} 
				me.trigger('upfront:presets:edit', me.get_value());
			});
			return this;
		},
	});

	return SelectPresetField;
});
