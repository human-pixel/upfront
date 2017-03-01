(function($){
    var l10n = Upfront.Settings && Upfront.Settings.l10n
            ? Upfront.Settings.l10n.global.views
            : Upfront.mainData.l10n.global.views
        ;
    define([
        "text!upfront/templates/popup.html",
				'scripts/upfront/upfront-views-editor/fields',
    ], function ( popup_tpl, Fields ) {

        return Backbone.View.extend({
            id: "upfront-entity_list-search",
            searchTpl: _.template($(popup_tpl).find('#upfront-filter-tpl').html()),
            events: {
                "click #upfront-search_action": "handle_search_request",
                "keydown #upfront-list-search_input": "dispatch_search_enter"
            },
          	initialize: function(options) {
            	this.postType = options.postType;
          	},
            render: function () {
                var query = this.collection.lastFetchOptions ? this.collection.lastFetchOptions.search : false;
                this.$el.html(this.searchTpl({query: query}));
            		this.add_filter_dropdowns();
            },
            dispatch_search_enter: function (e) {
                if(e.which == 13)
                    return this.handle_search_request(e);
            },
            handle_search_request: function (e) {
                e.preventDefault();
                var text = $("#upfront-search_container input").val();
                this.collection.fetch({search: text});
            },
						handle_filter_request: function () {
							// filters are set on change of field.
              	var status = (this.status ? this.status : false),
              		date = (this.date ? this.date : false),
              		category = (this.category ? this.category : false)
              	;
                this.collection.fetch({
									post_status: status,
									post_date: date,
									cat: category
                });
						},
						get_status_values: function(values) {
							// If each status does not have value, use the name.
							return _.mapObject(values, function(value) {
								if (typeof value.value === 'undefined') {
									value.value = value.name;
								}
								return value;
							});
						},
						get_date_values: function(values) {
							return values;
						},
						get_category_values: function(values) {
							// If each status does not have value, use the name.
							return _.mapObject(values, function(value) {
								if (typeof value.value === 'undefined') {
									value.value = value.term_id;
								}
								if (typeof value.label === 'undefined') {
									value.label = value.name;
								}
								return value;
							});
						},
						// Add dropdowns to filter panel (same as links in wp-admin/edit.php).
						add_filter_dropdowns: function() {
							var me = this;
							new Upfront.Collections.FilterList([], {postType: this.postType}).fetch({postType: this.postType}).done(function(data){
								var options = me.collection.lastFetchOptions,
									status_value = (options.post_status ? options.post_status : false),
									date_value = (options.post_date ? options.post_date : false),
									category_value = (options.cat ? options.cat : false)
								;
								var status_dropdown = new Fields.Select({
									model: me.model,
									name: 'upfront_post_status_filter',
									default_value: status_value ? status_value : 0,
									values: me.get_status_values(data.data.statuses),
									change: function (e) {
										me.status = e;
										me.handle_filter_request();
									}
								});

								var date_dropdown = new Fields.Select({
									model: me.model,
									name: 'upfront_post_date_filter',
									default_value: date_value ? date_value : 0,
									values: me.get_date_values(data.data.dates),
									change: function (e) {
										me.date = e;
										me.handle_filter_request();
									}
								});

								var category_dropdown= new Fields.Select({
									model: me.model,
									name: 'upfront_post_category_filter',
									default_value: category_value ? category_value : 0,
									values: me.get_category_values(data.data.categories),
									change: function (e) {
										me.category = e;
										me.handle_filter_request();
									}
								});

								me.filter_dropdowns = [
									status_dropdown,
									date_dropdown,
									category_dropdown
								];
								// Render Dropdowns.
								status_dropdown.render();
								date_dropdown.render();
								category_dropdown.render();
								// Add Dropdowns to start of filter panel.
								me.$el.children().prepend(category_dropdown.$el);
								me.$el.children().prepend(date_dropdown.$el);
								me.$el.children().prepend(status_dropdown.$el);
						});
					}
    	});

    });
}(jQuery));
