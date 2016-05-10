;(function($){define(["text!upfront/templates/post-editor/edition-box.html"], function(editionBox_tpl){
	
var l10n = Upfront.Settings && Upfront.Settings.l10n
			? Upfront.Settings.l10n
			: Upfront.mainData.l10n
		;

var Box = Backbone.View.extend({
    className: 'ueditor-box-wrapper upfront-ui',
    post: false,
    taxSection: false,
    offset: {min:0, max:0},
    position: {min:0, max:0},
    onScrollFunction: false,
    statusSelect: false,
    visibilitySelect: false,
    taxSections : [],
    events: {
        'click .ueditor-action-preview': 'navigate_to_preview',
        'click .ueditor-button-cancel-edit': 'cancel',
        'click .ueditor-action-publish': 'publish',
        'click .ueditor-action-draft': 'saveDraft',
        'click .ueditor-action-trash': 'trash',
        'click .ueditor-box-title': 'toggle_section',
        'click .ueditor-save-post-data': 'save_post_data'
    },

    initialize: function(options){
        var me = this;
        this.post = options.post;
				
        this.statusSection = new PostStatusView({post: this.post});
        this.visibilitySection = new PostVisibilityView({post: this.post});
        this.scheduleSection = new PostScheduleView({post: this.post});
        this.urlEditor = new PostUrlEditor( { post: this.post } );

        this.tpl = _.template($(editionBox_tpl).find("#ueditor-box-main").html());
        this.datepickerTpl = _.template($(Upfront.data.tpls.popup).find('#datepicker-tpl').html());
        //Upfront.Events.trigger('upfront:element:edit:start', 'write', this.post);

        Upfront.Events.on("upfront:element:edit:stop", this.element_stop_prop, this);

		// We should clear old events
		this.stopListening(Upfront.Events, "command:layout:trash");
		this.stopListening(Upfront.Events, "command:layout:save");
		this.stopListening(Upfront.Events, "command:layout:save_as");
	
		// re-listen events
		this.listenTo(Upfront.Events, "command:layout:trash", this.trash, this);
		this.listenTo(Upfront.Events, "command:layout:save", this.publish, this);
		this.listenTo(Upfront.Events, "command:layout:save_as", this.publish, this);

    },
	
	rebindEvents: function () {
		// Rebind events for status section
		this.statusSection.render();
		this.statusSection.delegateEvents();
		
		// Rebind events for visibility section
		this.visibilitySection.render();
        this.visibilitySection.delegateEvents();
		
		// Rebind events for schedule section
		this.scheduleSection.render();
        this.scheduleSection.delegateEvents();
		
		// Rebind events for url section
		this.urlEditor.render();
        this.urlEditor.delegateEvents();
		
		//Rebind events for whole box
		this.render();
		this.delegateEvents();
	},

    element_stop_prop: function () {
        if (
            Upfront.Application.mode.current === Upfront.Application.MODE.POSTCONTENT
            &&
            Upfront.Application.current_subapplication.contentEditor
        ) $('.upfront-module').each(function(){
        	if ( $(this).is('.ui-draggable') )
				$(this).draggable('disable');
			if ( $(this).is('.ui-resizable') )
				$(this).resizable('disable');
        });
    },

	render: function(){
		this.destroy();
		if (Upfront.Application.user_can("EDIT") === false) {
			if (parseInt(this.post.get('post_author'), 10) === Upfront.data.currentUser.id && Upfront.Application.user_can("EDIT_OWN") === true) {
				// Pass through
			} else {
				return;
			}
		}

		var me = this,
		postData = this.post.toJSON(),
			extraData = {},
			base = me.post.get("guid")
				;

		extraData.rootUrl = base ? base.replace(/\?.*$/, '') : window.location.origin + '/';
		postData.permalink = this.permalink = extraData.rootUrl + this.post.get("post_name");
		postData.previewLink = this.post.get("guid") + "&preview=true";

		postData.buttonText = this.getButtonText();
		postData.draftButton = ['publish', 'future'].indexOf(this.initialStatus) == -1;
		postData.cancelButton = !(this.post.is_new);

		postData.cid = this.cid;

		Upfront.Events.trigger('upfront:box:rendered', this.getButtonText());

		extraData.post_type_conditional_box_title = this._post_type_has_taxonomy('post_tag') && this._post_type_has_taxonomy('category')
			? l10n.global.content.tags_cats_url
			: l10n.global.content.no_tax_url
			;
		extraData.url_label = "post" === me.post.get("post_type") ? l10n.global.content.post_url : l10n.global.content.page_url;
		this.$el.html(this.tpl(_.extend({}, postData, extraData) ));
		this.populateSections();
		return this;
	},

    navigate_to_preview: function(e){
        e.preventDefault();

        if( this.post.get("post_status") === "auto-draft" ){
            this.post.trigger('editor:auto-draft');
            this.trigger('auto-draft');
            window.open(this.post.get("guid") + "&preview=true", '_blank');
            return;
        }

        window.open(this.post.get("guid"), '_blank');
    },
    renderTaxonomyEditor: function($el, tax){
        var self = this,
            tax = typeof tax === "undefined" ? "category" : tax,
            termsList = new Upfront.Collections.TermList([], {postId: this.post.id, taxonomy: tax})
        ;

        if (!this._post_type_has_taxonomy(tax)) {
            // Post type doesn't support this taxonomy. Bail out
            $el.hide();
            return false;
        }

        termsList.fetch({allTerms: true}).done(function(response){
            var tax_view_constructor = response.data.taxonomy.hierarchical ? ContentEditorTaxonomy_Hierarchical : ContentEditorTaxonomy_Flat,
                tax_view = self.taxSections[tax] = new tax_view_constructor({collection: termsList, tax: tax})
            ;

            tax_view.allTerms = new Upfront.Collections.TermList(response.data.allTerms);
            tax_view.render();
            $el.html(tax_view.$el);
        });

    },
    populateSections: function(){
        this.$('.misc-pub-post-status').html(this.statusSection.$el);
        this.$('.misc-pub-visibility').html(this.visibilitySection.$el);
        this.$('.misc-pub-schedule').html(this.scheduleSection.$el);

        this.$(".misc-pub-section.misc-pub-post-url").html( this.urlEditor.$el  );
		
		// We dont need this as we have another tab for them
        //this.renderTaxonomyEditor(this.$(".misc-pub-post-category"), "category");
        //this.renderTaxonomyEditor(this.$(".misc-pub-post-tags"), "post_tag");
    },

    /**
     * Helper method to determine if a currently edited post type supports a taxonomy.
     *
     * Currently very simplistic
     *
     * @param {String} tax Taxonomy to check for
     *
     * @return {Boolean}
     */
    _post_type_has_taxonomy: function (tax) {
        if (!tax) return true;
        var type = this.post.get("post_type") || 'post';
        return "page" !== type;
    },

    getButtonText: function(){
        var initial = this.initialStatus,
            date = this.post.get('post_date'),
            now = new Date()
            ;

        date = date ? date.getTime() : 0;
        now = now.getTime();

        // Check the initial status value and deal with it appropriately
        if (!initial && this.post && this.post.get) {
            initial = this.post.get("post_status")
        }

        if(now < date) {
            if(initial == 'future')
                return l10n.global.content.update;
            return l10n.global.content.schedule;
        }
        else {
            if(initial == 'publish')
                return l10n.global.content.update;
            return l10n.global.content.publish;
        }
    },

    setPosition: function(){
        var $container = $(".upost-data-object-post_data, .upfront-output-this_post").length ? $(".upost-data-object-post_data, .upfront-output-this_post") : this.$el.closest(".upfront-postcontent-editor"),
            container_pos = $container.map(function(){
               return {
                   right: $(this).width() + $(this).offset().left,
                   $el: $(this)
               };
            }),
            right_container = _.max(container_pos, function(container){ return container.right; }),
            right_space = $("body").width() - right_container.right,
            right = right_space > this.$el.width() ? right_space - this.$el.width() :  10
        ;

        if( Upfront.Util.isRTL() ){
            this.$el.css({
                left: right + 10,
                right: "auto"
            });
        }else{
            this.$el.css({
                right: right + 10
            });
        }

    },

    toggleRegionClass: function (show) {
        this.$el.closest('.upfront-region-container').toggleClass('upfront-region-container-editing-post', show);
    },

    destroy: function(){
    	Upfront.Events.off("upfront:element:edit:stop", this.element_stop_prop);
    },

    _stop_overlay: function () {
        $(".editing-overlay").remove();
        $(".upfront-module").removeClass("editing-content");
        $(".upfront-module.fadedOut").fadeTo( "slow" , 1).removeClass("fadedOut");
        $(".ueditor-display-block").removeClass("ueditor-display-block");
    },

    cancel: function(e){
        e.preventDefault();
        if(confirm(l10n.global.content.discard_changes.replace(/%s/, this.post.get('post_title')))){
            //this.toggleRegionClass(false);
            //this.destroy();
            this.post.trigger('editor:cancel');
            this.trigger('cancel');
            Upfront.Events.trigger('upfront:element:edit:stop', 'write', this.post);
            this.fadein_other_elements();
            //this.remove();
        }
    },
    fadein_other_elements: function(){
        $(".editing-overlay").remove();
        $(".upfront-module").removeClass("editing-content");
        $(".upfront-module.fadedOut").fadeTo( "fast" , 1).removeClass("fadedOut");
        $(".ueditor-display-block").removeClass("ueditor-display-block");
    },
    publish: function(){
        this.post.trigger('editor:publish');
        this.trigger('publish');
        Upfront.Events.trigger('upfront:element:edit:stop', 'write', this.post);
        Upfront.Events.trigger('upfront:post:edit:stop', 'write', this.post.toJSON());
        this.fadein_other_elements();
        this._stop_overlay();
        //$(".editing-overlay").remove();

        //this.toggleRegionClass(false);
        //this.remove();
    },

    saveDraft: function(e){
        e.preventDefault();

        this.destroy();

        this.post.trigger('editor:draft');
        this.trigger('draft');
        Upfront.Events.trigger('upfront:element:edit:stop', 'write', this.post, true);// last true means 'saving draft'
        this.remove();
    },

    trash: function(){
        if(confirm( l10n.global.content.delete_confirm.replace(/%s/, this.post.get('post_type')))){
            this.destroy();
            this.trigger('trash');
            Upfront.Events.trigger('upfront:element:edit:stop', 'write', this.post);
            this.remove();
        }
    },

    toggle_section: function(e){
        e.preventDefault();
        var $this = $(e.target),
            $this_section = $this.closest(".ueditor-box-section"),
            $this_wrap = $this_section.find(".ueditor-box-content-wrap")
            ;

        $this_section.toggleClass("show");
        $this_wrap.slideToggle();
    }
});

var PostSectionView = Backbone.View.extend({
    events:{
        'click .ueditor-btn-edit': 'toggleEditor',
        'click .ueditor-button-cancel': 'cancelEdit',
        "click .ueditor-button-small-ok" : "update",
        'change input[type="radio"][name="visibility"]': 'visibility_radio_change',
        "change input[name='visibility']" : "set_visibility"
    },
    toggleEditor: function(e){
        e.preventDefault();
        var $button = $(e.target),
			$this_togglable,
            $this_prev_data_toggle = $button.closest(".misc-pub-section").find(".ueditor-previous-data-toggle")
            ;
		
		if($button.hasClass('ueditor-edit-post-url')) {
			$this_togglable = $button.parent().siblings(".ueditor-togglable");
		} else {
			$this_togglable = $button.siblings(".ueditor-togglable");
		}
		
		if(!$button.hasClass('ueditor-edit-post-url')) {
			$(".ueditor-box-content-wrap .ueditor-togglable").parent().removeClass('upfront-settings-toggled');
        }
		$(".ueditor-box-content-wrap .ueditor-togglable").not($this_togglable).slideUp();
        $(".ueditor-box-content-wrap .ueditor-btn-edit").show();
        $(".ueditor-previous-data-toggle").not( $this_prev_data_toggle ).show();

        $this_prev_data_toggle.hide();
        $button.hide();
        $this_togglable.slideDown(100);
		$this_togglable.parent().addClass('upfront-settings-toggled');
    },
    cancelEdit: function(e){
        e.preventDefault();
        var $button = $(e.target),
            $this_prev_data_toggle = $button.closest(".misc-pub-section").find(".ueditor-previous-data-toggle")
            ;
        $this_prev_data_toggle.show();
        $button.closest(".ueditor-togglable").slideUp(100, function(){
            $button.closest(".ueditor-togglable").siblings(".ueditor-btn-edit").show();
			$button.closest(".ueditor-togglable").parent().removeClass('upfront-settings-toggled');
        });

    },
    visibility_radio_change: function(e){
        var $this = $(e.target),
            val = $this.val(),
            $this_togglable = $(".ueditor-togglable-child-" + val)
            ;
        $this.closest(".ueditor-togglable").find(".ueditor-togglable-child").not($this_togglable).hide();
        $this_togglable.show();
    }
});

var ContentEditorTaxonomy_Hierarchical = PostSectionView.extend({
    termListingTpl : _.template($(editionBox_tpl).find('#upfront-term-list-tpl').html()),
    termSingleTpl : _.template($(editionBox_tpl).find('#upfront-term-single-tpl').html()),
    defaults: {
        title: "Categories"
    },
    className: "upfront-taxonomy-hierarchical",
    events: _.extend({},PostSectionView.prototype.events, this.events, {
        "click #upfront-tax-add_term": "handle_new_term",
        "click #add-new-taxonomies-btn": "toggle_add_new",
        "keydown #upfront-add_term": "handle_enter_new_term",
        "change .upfront-taxonomy_item": "handle_terms_update",
        'keydown #upfront-new_term': 'handle_enter_new_term',
        'click .ueditor-save-post-hie-tax': 'update'
    }),
    updateTimer: false,
    allTerms: false,
    initialize: function(options){
        this.tax = options.tax;
        //this.collection.on('add remove', this.render, this);
    },

    render: function() {
        var self = this,
            selected_term_ids = self.collection.pluck("term_id"),
            all_terms =  this.allTerms.sortBy(function(term, indx) {
                return selected_term_ids.indexOf( term.get("term_id") ) !== -1;
            })
            ;

        this.$el.html(
            this.termListingTpl(_.extend({}, this.defaults, {
                allTerms: this.allTerms.where({'parent': '0'}),
                postTerms: this.collection,
                termTemplate: this.termSingleTpl,
                labels: this.collection.taxonomyObject.labels
            }))
        );
		
		// Get chosen select
		var selectAddTaxonomy = this.chosen_field();
		var termsChosen = this.normalize_tax_object(this.allTerms);
		
		// Init chosen select
		this.taxonomySelect = new selectAddTaxonomy({
			model: this.model,
			label: l10n.global.content.category_label,
			values: termsChosen,
			placeholder: l10n.global.content.category_placeholder,
			change: function(value) {
				//me.model.set_property('preset', this.get_value());
			}
		});
		this.taxonomySelect.render();
		
		this.listenTo(this.taxonomySelect, 'taxonomy:new', this.handle_new_term);
		this.listenTo(this.taxonomySelect, 'taxonomy:changed', this.handle_choose_term);

		// Attach chosen select to template
		this.$el.find('.upfront-taxonomy-chosen').html(this.taxonomySelect.$el);

    },
	
	normalize_tax_object: function(otherTerms) {
		var termsChosen = {};
		otherTerms.each(function (term, idx) {
			termsChosen[term.get('term_id')] = { label: term.get('name'), value: term.get('term_id') }
		});
		
		return termsChosen;
	},
	
	chosen_field: function() {
		var chosenField = Upfront.Views.Editor.Field.Chosen_Select.extend({
			className: 'select-taxonomy-chosen',
			render: function() {
				Upfront.Views.Editor.Field.Chosen_Select.prototype.render.call(this);
				var me = this;
				var selectWidth = '230px';

				this.$el.find('.upfront-chosen-select').chosen({
					search_contains: true,
					width: selectWidth,
					disable_search: false,
				});

				var html = ['<a href="#" title="'+ l10n.global.content.add_label +'" class="upfront-taxonomy-add">'+ l10n.global.content.add_label +'</a>'];
				this.$el.find('.chosen-search').append(html.join(''));

				this.$el.on('click', '.upfront-taxonomy-add', function(e) {
					e.preventDefault();
					var taxonomy_value = me.$el.find('.chosen-search input').val();
					me.trigger('taxonomy:new', taxonomy_value.trim());
				});

				return this;
			},
			on_change: function() {
				this.$el.find('.chosen-drop').css('display', 'none');
				this.trigger('changed');
				this.trigger('taxonomy:changed', this.get_value());
			},
		});
		
		return chosenField;
	},

    handle_new_term: function() {
        var me = this,
            $term_name = this.$(".upfront-tax-new_term"),
            term_name = $term_name.val(),
            parentId, term
            ;

        if(!term_name)
            return false;

        if ($("#upfront-taxonomy-parents").length)
            parentId = $("#upfront-taxonomy-parents").val();

        term = new Upfront.Models.Term({
            taxonomy: this.collection.taxonomy,
            name: term_name,
            parent: parentId
        });

        term.save().done(function(response){
            me.allTerms.add(term);
            me.collection.add(term);
        });

        var new_term_html = this.termSingleTpl( {term: term, termTemplate: me.termSingleTpl, termId: term.get('term_id'), postTerms: me.collection, selected: true} );
        this.$("#upfront-taxonomy-list").prepend(new_term_html);
        this.$("#upfront-taxonomy-list").scrollTop(0);
        $term_name.val("");
    },

    handle_terms_update: function(e){
        var me = this,
            $target = $(e.target),
            termId = $target.val()
            ;

        if(!$target.is(':checked')){
            this.collection.remove(this.allTerms.get(termId));
        }
        else
            this.collection.add(this.allTerms.get(termId));

    },

    handle_enter_new_term: function (e) {
        if(e.which == 13){
            this.handle_new_term(e);
        }
    },
    update: function(e){
        this.collection.save();
        Upfront.Events.trigger("editor:post:tax:updated", this.collection, this.tax);
        this.render();

    },
    toggle_add_new: function(){
        this.$(".ueditor-togglable-child").slideToggle();
    }
});

var ContentEditorTaxonomy_Flat = PostSectionView.extend({
    "className": "upfront-taxonomy-flat",
    termListTpl: _.template($(editionBox_tpl).find('#upfront-flat-term-list-tpl').html()),
    termSingleTpl: _.template($(editionBox_tpl).find('#upfront-term-flat-single-tpl').html()),
    changed: false,
    updateTimer: false,
    events: _.extend({}, PostSectionView.prototype.events, {
        "click .ueditor-button-small-flat-tax-add": "handle_new_term",
        'click .upfront-taxonomy_item-flat': 'handle_term_click',
        'keydown #upfront-flat-tax-add_term': 'handle_enter_new_term',
        'keydown .upfront-flat-tax-new_term': 'handle_enter_new_term',
        'click .upfront-taxonomy-list-choose-from-prev': 'toggle_prev_used_tax'
    }),
    initialize: function(options){
        this.collection.on('add remove', this.update, this);
        this.tax = options.tax;
    },
    render: function () {
        var me = this,
            currentTerms = new Upfront.Collections.TermList(),
            otherTerms = new Upfront.Collections.TermList()
            ;

        this.allTerms.each(function (term, idx) {
            term.children = [];
            if(me.collection.get(term.get('term_id')))
                currentTerms.add(term);
            else
                otherTerms.add(term);
        });

        this.$el.html(this.termListTpl({
            currentTerms: currentTerms,
            otherTerms: otherTerms,
            termTemplate: this.termSingleTpl,
            labels: this.collection.taxonomyObject.labels
        }));
		
		// Get chosen select
		var selectAddTaxonomy = this.chosen_field();
		var termsChosen = this.normalize_tax_object(otherTerms);
		
		// Init chosen select
		this.taxonomySelect = new selectAddTaxonomy({
			model: this.model,
			label: l10n.global.content.tags_label,
			values: termsChosen,
			placeholder: l10n.global.content.tags_placeholder,
			change: function(value) {
				//me.model.set_property('preset', this.get_value());
			}
		});
		this.taxonomySelect.render();
		
		this.listenTo(this.taxonomySelect, 'taxonomy:new', this.handle_new_term);
		this.listenTo(this.taxonomySelect, 'taxonomy:changed', this.handle_choose_term);

		// Attach chosen select to template
		this.$el.find('.upfront-taxonomy-chosen').html(this.taxonomySelect.$el);
    },
	
	normalize_tax_object: function(otherTerms) {
		var termsChosen = { label: '', value: ''};
		otherTerms.each(function (term, idx) {
			termsChosen[term.get('term_id')] = { label: term.get('name'), value: term.get('term_id') }
		});
		
		return termsChosen;
	},
	
	chosen_field: function() {
		var chosenField = Upfront.Views.Editor.Field.Chosen_Select.extend({
			className: 'select-taxonomy-chosen',
			render: function() {
				Upfront.Views.Editor.Field.Chosen_Select.prototype.render.call(this);
				var me = this;
				var selectWidth = '230px';

				this.$el.find('.upfront-chosen-select').chosen({
					search_contains: true,
					width: selectWidth,
					disable_search: false,
				});

				var html = ['<a href="#" title="'+ l10n.global.content.add_label +'" class="upfront-taxonomy-add">'+ l10n.global.content.add_label +'</a>'];
				this.$el.find('.chosen-search').append(html.join(''));

				this.$el.on('click', '.upfront-taxonomy-add', function(e) {
					e.preventDefault();
					var taxonomy_value = me.$el.find('.chosen-search input').val();
					me.trigger('taxonomy:new', taxonomy_value.trim());
				});

				return this;
			},
			on_change: function() {
				this.$el.find('.chosen-drop').css('display', 'none');
				this.trigger('changed');
				this.trigger('taxonomy:changed', this.get_value());
			},
		});
		
		return chosenField;
	},

    handle_term_click: function(e){
        var me = this,
            $target = $(e.currentTarget),
            termId = $target.attr('data-term_id');

        if($target.parent().attr('id') == 'upfront-taxonomy-list-current')
            this.collection.remove(termId);
        else
            this.collection.add(this.allTerms.get(termId));
    },
	
	handle_choose_term: function(termId) {
		this.collection.add(this.allTerms.get(termId));
	},

    handle_new_term: function (term_name) {
        var me = this,
            term
            ;

        if(! term_name)
            return false;

        term = new Upfront.Models.Term({
            taxonomy: this.collection.taxonomy,
            name: term_name
        });

        term.save().done(function(response){
            me.allTerms.add(term);
            me.collection.add(term).save();
        });
    },

    handle_enter_new_term: function (e) {
        if(e.which == 13){
            this.handle_new_term(e);
        }
    },
    toggle_prev_used_tax: function(e){
        e.preventDefault();
        this.$(".ueditor-togglable-child").slideToggle();
    },
    update: function(e){
		var me = this;
        this.collection.save();
        Upfront.Events.trigger("editor:post:tax:updated", this.collection, this.tax);
		setTimeout( function () {
			me.render();
		}, 50);
    }
});


var PageTemplateEditor = PostSectionView.extend({
    "className": "upfront-page-template-editor",
    pageTemplateListTpl: _.template($(editionBox_tpl).find('#upfront-page-template-list-tpl').html()),
    changed: false,
    updateTimer: false,
    allPageTemplates: false,
    events: _.extend({}, PostSectionView.prototype.events, {
		"click .save-post-template": "handle_save_as",
		"click .apply-post-template": "apply_template",
		"click .update-post-template": "update_template",
		"click .delete-post-template": "delete_template",
    }),
    initialize: function(options){
			var me = this;
			this.label = options.label;
			this.layout_loaded = false;
			this.listenTo(Upfront.Events, 'entity:module:update', this.on_layout_change);
			this.listenTo(Upfront.Events, 'layout:after_render', this.on_layout_loaded);
    },
    render: function () {
        var me = this;
				
			this.$el.html(this.pageTemplateListTpl({
					label: me.label
			}));
			
			this.$el.find('.upfront-page-template-action').html(_.template($(editionBox_tpl).find('#upfront-page-action').html()));
			
			// Get chosen select and type checkbox
			var selectTemplate = this.chosen_field();
			var templateOptions = this.get_options();

			// Init chosen select
			this.templateSelect = new selectTemplate({
				model: me.model,
				label: '',
				values: templateOptions
			});
			
			this.templateSelect.render();

			// Attach chosen select and type checkbox to template
			this.$el.find('.upfront-page-template-chosen').html(this.templateSelect.$el);
			
			// Hide first Update Template / Save As
			this.$el.find('.upfront-page-template-description').hide();
			this.$el.find('.upfront-page-template-action a.update-post-template').hide();
			this.$el.find('.upfront-page-template-action a.save-post-template').hide();
			
			setTimeout( function () {
				// overwriting click event on chosen.jquery.min.js
				me.$el.find('.upfront-field-multiple input').bind('click.chosen', function(e){
					me.stop_bubble(e);
				});
				me.$el.find('.upfront-field-multiple span.upfront-field-label-text').bind('click.chosen', function(e){
					me.stop_bubble(e);
				});
				
				// set default value
				if ( typeof _upfront_post_data.template_slug !== 'undefined' ) me.templateSelect.set_value(_upfront_post_data.template_slug);
			}, 500);
    },
		
		apply_template: function(e) {	
			e.preventDefault();
			// TODO: show warning as per Invision flow
			
			// apply selected layout
			var selected = this.$el.find('.upfront-chosen-select').val();
			_upfront_post_data.template_slug = selected;
			Upfront.Events.trigger("command:layout:save_meta");
		},
		
		update_template: function(e) {	
			e.preventDefault();
			
			// save selected layout
			Upfront.Events.trigger("command:layout:save_meta");
			
			// TODO: show notification as per Invision flow
		},
		
		delete_template: function(e) {	
			e.preventDefault();
			
			// delete current layout template
			//TODO: show popup warning first if really want to delete template
			Upfront.Events.trigger("command:layout:delete_layout");
		},
		
		stop_bubble: function(e) {
			e.stopImmediatePropagation();
			return true;
		},
		
		filter_list: function(selected) {
			// disable all first
			this.$el.find('optgroup').attr('disabled','disabled');
			// enable selected
			for ( key in selected ) {
				this.$el.find('optgroup[label="'+ selected[key] +'"]').removeAttr('disabled');
			}
			// trigger chosen update
			this.$el.find('.upfront-chosen-select').trigger("chosen:updated");
		},
	
	handle_save_as: function(e) {
		var me = this;
		e.preventDefault();
		this.save_fields = new SaveLayoutFields({ model: this.model });
		this.save_fields.render();
		this.$el.find('.upfront-page-template-action').html(this.save_fields.$el);
		this.add_overlay();
		
		this.listenTo(this.save_fields, 'click:cancel', this.cancel_save);
		this.listenTo(this.save_fields, 'click:save', this.save);
	},
	
	cancel_save: function() {
		this.$el.find('.upfront-page-template-action').html(_.template($(editionBox_tpl).find('#upfront-page-action').html()));
		this.remove_overlay();
	},

	save: function(value) {
		// all saved templates will be considered as Layout template
		_upfront_post_data.template_type = 'layout';
		_upfront_post_data.template_slug = value;
		_upfront_post_data.save_as = 1;
		
		Upfront.Events.trigger("command:layout:save");
		
		// hide overlay
		this.cancel_save();
	},
	
	add_overlay: function() {
		this.$el.find('.upfront-page-template-dropdown, .upfront-page-template-description').append('<div class="upfront-templates-overlay"></div>').css({opacity: 0.6});
	},
	
	remove_overlay: function() {
		this.$el.find('.upfront-page-template-dropdown .upfront-templates-overlay, .upfront-page-template-description .upfront-templates-overlay').remove();
		this.$el.find('.upfront-page-template-dropdown, .upfront-page-template-description').css({opacity: 1});
	},
	
	on_layout_loaded: function() {
		this.layout_loaded = true;
	},
	
	on_layout_change: function(module) {
		if ( this.layout_loaded ) {
			// show dot icon
			var $dot = this.$el.find('.chosen-container .changes-dot');
			if($dot.length) return;
			
			this.$el.find('.upfront-page-template-description').show();
			this.$el.find('.chosen-container').append('<div class="changes-dot"></div>');
			
			// show update / save as
			var $temp_description = this.$el.find('.upfront-page-template-description'),
				template_name = this.$el.find('select.upfront-chosen-select option[value="'+ _upfront_post_data.template_slug +'"]').text();
			;
			$temp_description.find('span.template_name').text(template_name);
			$temp_description.show();
			this.$el.find('.upfront-page-template-action a.update-post-template').show();
			this.$el.find('.upfront-page-template-action a.save-post-template').show();
			this.$el.find('.upfront-page-template-action a.delete-post-template').hide();
		}
	},
	
	get_options: function () {
		var options = {
			templates: this.normalize_template_object(this.allPageTemplates),
			layouts: this.normalize_template_object(this.allPageLayouts)
		}
		
		return options;
	},
	
	normalize_template_object: function(templates) {
		var templateOptions = { label: '', value: ''};
		templates.each(function (template, idx) {
			if ( typeof template.get('ID') !== 'undefined' ) {
				templateOptions[idx] = { label: template.get('post_name'), value: template.get('ID') };
			} else if ( typeof template.get('template_type') !== 'undefined' && template.get('template_type') == 'page' ) {
				templateOptions[idx] = { label: template.get('name'), value: template.get('slug') };
			} else {
				templateOptions[idx] = { label: template.get('name'), value: template.get('slug') };
			}
		});
		
		return templateOptions;
	},

	chosen_field: function() {
		var template_editor = this;
		var chosenField = Upfront.Views.Editor.Field.Chosen_Select.extend({
			className: 'select-page-template-chosen',
			initialize: function(options) {
				this.options = options;
				//Close dropdown on parent scroll
				$('.sidebar-panel-content, #sidebar-scroll-wrapper').on('scroll', this, this.closeChosen);
			},
			render: function() {
				Upfront.Views.Editor.Field.Chosen_Select.prototype.render.call(this);
				var me = this;
				var selectWidth = '155px';
				
				this.typeCheckbox = this.type_field();
				this.typeCheckbox.render();

				setTimeout( function () {
					me.$el.find('.chosen-drop').prepend(me.typeCheckbox.$el);
				}, 200);

				this.$el.find('.upfront-chosen-select').chosen({
					search_contains: true,
					width: selectWidth,
					disable_search: true,
					display_disabled_options: false
				});
				
				this.$el.find('.upfront-chosen-select').on('chosen:hiding_dropdown', function() {
					me.allowMouseWheel();
				});
				
				return this;
			},
			on_change: function() {
				this.allowMouseWheel();
				this.$el.find('.chosen-drop').css('display', 'none');
				this.trigger('changed');
			},
			get_value_html: function (value, index) {
				var selected = '',
					string = '';
				
				string += '<optgroup label="'+ index +'">';
				_.each(value,  function(option){
					string += '<option value="'+ option.value +'">'+ option.label +'</option>';
				});
				string += '</optgroup>';
				return string;
			},
			type_field: function() {
				var typeField = new Upfront.Views.Editor.Field.Checkboxes({
					label: l10n.global.views.label_show_templates + ':',
					className: 'chosen-checkbox-filter',
					default_value: ['templates','layouts'],
					layout: 'horizontal-inline',
					multiple: true,
					values: [
						{label: l10n.global.views.pages, value: 'templates'},
						{label: l10n.global.views.layouts, value: 'layouts'}
					],
					change: function (e) {
						template_editor.filter_list(this.get_value());
					}
				});
				return typeField;
			},
			openOptions: function(e) {
				var me = this;
				
				//Disable scroll when chosen is opened
				$('.sidebar-panel-content .sidebar-tab-content').bind('mousewheel', function() {
					return false;
				});

				_.delay(function() { // Delay because opening animation causes wrong outerHeight results
					var in_sidebar = me.$el.parents('#sidebar-ui').length,
						in_settings = me.$el.parents('#element-settings-sidebar').length,
						settingsTitleHeight = 44;

					// Apply if select field is in sidebar or settings sidebar
					if(in_sidebar == 1 || in_settings == 1) {
						var select_dropdown = me.$el.find('.chosen-drop'),
							select = select_dropdown.parent(),
							dropDownTop = (select.offset().top - $('#element-settings-sidebar').offset().top) + select.height();
						dropDownTop = dropDownTop + settingsTitleHeight;

						select_dropdown.css("width", select.width());
						select_dropdown.css('top', dropDownTop + "px");
						select_dropdown.css('left', select.offset().left + "px");
						select_dropdown.css('display', 'block');
					}
				}, 20);

				me.$el.find('.chosen-drop').show();
			},
			closeChosen: function(e) {
				var me = e.data;
				var in_sidebar = me.$el.parents('#sidebar-ui').length,
					in_settings = me.$el.parents('#element-settings-sidebar').length;

				if(in_sidebar == 1 || in_settings == 1) {
					me.$el.find('.chosen-drop').css('display', 'none');
				}
				me.$el.find('select').trigger("chosen:close");
				me.allowMouseWheel();
			},
			allowMouseWheel: function() {
				//Enable scroll when chosen is closed
				$('.sidebar-panel-content .sidebar-tab-content').unbind('mousewheel');
			}
		});
		
		return chosenField;
	}
});

var SaveLayoutFields = Backbone.View.extend({
	initialize: function(options) {
		var me = this;

		this.editor = options.editor;

		this.fields = [
			new Upfront.Views.Editor.Field.Button({
				className: 'save-form-cancel',
				model: this.model,
				label: l10n.global.content.cancel,
				compact: true,
				on_click: function(){
					me.trigger('click:cancel');
				}
			}),
			new Upfront.Views.Editor.Field.Text({
				className: 'save-form-name',
				model: this.model,
				compact: true,
			}),
			new Upfront.Views.Editor.Field.Button({
				className: 'save-form-save',
				model: this.model,
				label: l10n.global.content.ok,
				compact: true,
				on_click: function(){
					me.trigger('click:save', me.$el.find('.save-form-name input').val());
				}
			})
		];
	},
	render: function() {
		this.$el.html('');
		_.each(this.fields, function(field) {
			field.render();
			field.delegateEvents();
			this.$el.append(field.el);
		}, this);

		return this;
	}
});	

var PostUrlEditor = PostSectionView.extend({
    hasDefinedSlug : false,
    className: "upfront-slug_editor-url",
    tpl : _.template($(editionBox_tpl).find("#post-url-editor").html()),
    initialize: function(opts){
        this.post = opts.post;
        this.hasDefinedSlug = _.isEmpty( this.post.get("post_name") ) ? false : true;
        this.render();

    },
    render: function(){
        var self = this,
            base = this.post.get("guid");
        base = base ? base.replace(/\?.*$/, '') : window.location.origin + '/';
        this.$el.html(this.tpl({
            rootUrl: base,
            slug: self.post.get('post_name'),
            url_label : "post" === self.post.get("post_type") ? l10n.global.content.post_url : l10n.global.content.page_url
    }));
    },
    update: function(e){
        e.preventDefault();
        var val = this.$(".ueditor-post-url-text").val();
        if( val.length > 1 ){
            this.post.set( "post_name", val );
            this.hasDefinedSlug = true;
            this.render();
        }
    }
});

var PostStatusView = PostSectionView.extend({
    statusOptions: {
        future: {value:'future', name: l10n.global.content.scheduled},
        publish: {value: 'publish', name: l10n.global.content.published},
        pending: {value: 'pending', name: l10n.global.content.pending_review},
        draft: {value: 'draft', name: l10n.global.content.draft},
        'private': {value: 'private', name: l10n.global.content.private_post},
        'auto-draft': {value: 'auto-draft', name: l10n.global.content.new_post},
        'trash': {value: 'trash', name: l10n.global.content.deleted_post}
    },
    initialStatus: false,
	className: 'upfront-toggleable-content',
    tpl: _.template($(editionBox_tpl).find('#post-status-tpl').html()),
    initialize: function(options){
        this.post = options.post;
        this.render();
    },
    render: function(){
        this.initialStatus = this.currentStatus = this.post.get("post_status");
        this.status = this.getStatus();
        this.options = this.getStatusOptions();
        this.$el.html( this.tpl(_.extend({}, this.post, {status: this.status}, {options: this.options} )) );
        return this;
    },
    getStatusOptions: function(postata){
        var ops = [],
            status = this.initialStatus
            ;

        if(status == 'publish'){
            ops.push(this.statusOptions.publish);
        }
        else if(status == 'future'){
            ops.push(this.statusOptions.future);
        }
        ops.push(this.statusOptions.pending);
        ops.push(this.statusOptions.draft);

        if(status == 'private'){
            ops = [ this.statusOptions.private ];
        }

        return ops;
    },
    getStatus: function(){
        var current = this.post.get("post_status");
        if(['auto-draft', 'draft', 'pending'].indexOf(current) != -1)
            return this.statusOptions[current];
        return this.statusOptions[this.initialStatus];
    },
    update: function(e){
        e.preventDefault();

		var $button = $(e.target);
		$button.closest(".ueditor-togglable").slideUp(100, function(){
            $button.closest(".ueditor-togglable").siblings(".ueditor-btn-edit").show();
        });
		
		$button.closest(".ueditor-togglable").parent().removeClass('upfront-settings-toggled');

        var status = this.$("select").val();
        if(!_.isEmpty( status ) && status !== this.initialStatus ){
            this.post.set("post_status", status);
            this.trigger("status:change", status);
            this.render();
        }
    }

});

var PostVisibilityView = PostSectionView.extend({
    tpl: _.template($(editionBox_tpl).find('#post-visibility-tpl').html()),
    post_password: "",
    postVisibility: false,
	className: 'upfront-toggleable-content',
    visibilityOptions: {
        'public': {value: 'public', name:l10n.global.content.public_post},
        'sticky': {value: 'sticky', name:l10n.global.content.sticky},
        'password': {value: 'password', name: l10n.global.content.protected_post},
        'private': {value: 'private', name: l10n.global.content.is_private}
    },
    initialize: function(opts){
        this.post = opts.post;
        this.render();
    },
    render: function(){
        this.postVisibility = !this.postVisibility ? this.post.getVisibility() : this.postVisibility;
        this.status = this.visibilityOptions[ this.postVisibility ];
        if(this.postVisibility == 'password')
            this.post_password = this.post.get('post_password');

        this.$el.html( this.tpl(_.extend({}, this.post, {status : this.status, post_password: this.post_password} ) ) );
        return this;
    },
    getVisibilityOptions: function(){
        var now = this.post.getVisibility(),
            ops = this.visibilityOptions
            ;
        if(now == 'password')
            return [
                {value: 'password', name: l10n.global.content.edit_pwd},
                ops.public,
                ops.sticky,
                ops.private
            ]
                ;
        return _.values(ops);
    },
    set_visibility: function(e){
        var visibility_status = $(e.target).val();
        this.postVisibility = visibility_status;
    },
    update: function(){
        var $pass = this.$(".ueditor-post-pass"),
            pass = $pass.val();
        this.postVisibility = this.$("input[name='sticky']").is(":checked") ? this.postVisibility = "sticky" : this.postVisibility;

        if( !this.visibilityOptions.hasOwnProperty( this.postVisibility ) ) return;

        switch ( this.postVisibility ){
            case "password":
                if( pass !== ""  ){
                    $pass.css("border", "1px solid #a3bfd9");
                    this.post.setVisibility(this.postVisibility);
                    this.post.set("post_password", pass);
                    this.trigger("visibility:change", "password", pass);
                }else{
                    $pass.css("border", "1px solid red");
                    return;
                }
                break;
            default:
                this.post.setVisibility(this.postVisibility);

                this.trigger("visibility:change", this.postVisibility, "");
                break;
        }

        this.render();
    }
});

var PostScheduleView = PostSectionView.extend({
    tpl: _.template($(editionBox_tpl).find('#post-schedule-tpl').html()),
	className: 'upfront-toggleable-content',
    initialize: function(options){
        this.post = options.post;
        this.render();
    },
    render: function(){
		this.initialDate = this.post.get("post_date");
		 
        var date = new Object(),
			objDate = new Date(this.initialDate),
			locale = "en-us",
			month = objDate.toLocaleString(locale, { month: "short" });
			me = this;
       
		date.date = month + " " +this.initialDate.getDate() + ", " + this.initialDate.getFullYear();
        date.currentHour = this.initialDate.getHours();
        date.currentMinute = this.initialDate.getMinutes();
        this.schedule = this.getSchedule();
        this.$el.html( this.tpl(_.extend( {}, this.post, date, {schedule: this.schedule }) ) );
		
		this.$('#upfront-schedule-datepicker').datepicker({
			dateFormat: "M d, yy"
		});

        return this;
    },
    getSchedule: function(){
        var now = new Date(),
            date = this.initialDate,
            formatDate = Upfront.Util.format_date
            ;
        if(!date && !this.initialDate)
            return {
                key: l10n.global.content.publish,
                text: l10n.global.content.immediately
            };

        if(date.getTime() == this.initialDate){
            if(date.getTime() < now.getTime())
                return {
                    key: l10n.global.content.published,
                    text: formatDate(date, true)
                };
            else
                return {
                    key: l10n.global.content.scheduled,
                    text: formatDate(date, true)
                };
        }

        if(date.getTime() < now.getTime())
            return {
                key: l10n.global.content.publish_on,
                text: formatDate(date, true)
            };
        else
            return {
                key: l10n.global.content.scheduled_for,
                text: formatDate(date, true)
            };
    },
    update: function(){
		
		var dateField = this.$('#upfront-schedule-datepicker').datepicker( 'getDate' ),
			date = new Date(),
            year = dateField.getFullYear(),
            month = dateField.getMonth(),
            day = dateField.getDate(),
            hour = this.$("input[name='hh']").val(),
            minute = this.$("input[name='mn']").val()
            ;
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
        date.setHours(hour);
        date.setMinutes(minute);
        this.post.set("post_date", date);
        this.trigger('date:updated', date);
        this.render();
    }

});


return {
    Box: Box,
	ContentEditorTaxonomy_Hierarchical: ContentEditorTaxonomy_Hierarchical,
	ContentEditorTaxonomy_Flat: ContentEditorTaxonomy_Flat,
	PageTemplateEditor: PageTemplateEditor
}

});})(jQuery);
