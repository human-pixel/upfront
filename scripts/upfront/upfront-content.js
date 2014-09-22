;(function ($, undefined) {

var deps = [
	"text!upfront/templates/content.html",
	'upfront/post-editor/upfront-post-content',
	'upfront/post-editor/upfront-post-layout'
];

define("content", deps, function(postTpl, ContentTools) {
	var PostEditor = Backbone.View.extend({
		tpl: Upfront.Util.template(postTpl),
		events: {
			'dblclick': 'editContents',
			'click a': 'preventLinkNavigation'
		},
		initialize: function(options){
			var me = this;
			this.postId = options.post_id;
			this.setElement(options.node);
			this.autostart = options.autostart || false;
			this.content_mode = options.content_mode;
			this.changed = {};

			//If the post is in the cache, prepare it!
			if(Upfront.data.posts[this.postId]){
				this.post = Upfront.data.posts[this.postId];
				if(!this.post.meta.length)
					this.post.meta.fetch();

				this.loadingPost = new $.Deferred();
				this.loadingPost.resolve(this.post);
			}

			this.postView = options.view;
			this.getPost();

			this.getPostLayout();

		},

		setDefaults: function(){
			this.mode = 'content'; // Also 'layout' to edit post layout.
		},

		getPost: function(){
			var deferred = $.Deferred();
			if(this.post){
				deferred.resolve(this.post);
				this.loadingPost = deferred.promise();
			}
			if(this.loadingPost) {
				return this.loadingPost;
			}

			var post = Upfront.data.posts[this.postId];
			if(post){
				this.post = post;
				deferred.resolve(post);
				this.loadingPost = deferred.promise();
				return this.loadingPost;
			}

			return this.fetchPost();
		},


		getPostLayout: function(){
			if(this.loadingLayout)
				return this.loadingLayout;

			var me = this,
				deferred = $.Deferred(),
				layoutData
			;

			if(me.postView.postLayout && me.postView.parts[me.postId]){
				layoutData = {
					postLayout: me.postView.postLayout,
					partOptions: me.postView.partOptions || {}
				};

				me.layoutData = true;
				me.parts = me.postView.parts[me.postId];

				deferred.resolve(layoutData);
				this.loadingLayout = deferred.promise();
				return this.loadingLayout;
			}


			this.loadingLayout = this.fetchPostLayout();
			return this.loadingLayout;
		},

		fetchPostLayout: function(){
			var deferred = $.Deferred(),
				me = this,
				layoutType = me.postView.property('type') == 'ThisPostModel' ? 'single' : 'archive',
				id = layoutType == 'single' ? this.postId : me.postView.property('element_id').replace('uposts-object-','')
			;

			this.getPost().done(function(){
				Upfront.Util.post({
					action: 'upfront_get_postlayout',
					type: layoutType,
					id: id,
					layout_cascade: Upfront.Application.current_subapplication.get_layout_data().layout,
					post_id: me.postId,
					post_type: me.post.get('post_type')
				}).done(function(response){
					var layoutData = response.data;
					if(!layoutData.partOptions)
						layoutData.partOptions = {};

					_.extend(me.postView, layoutData);

					if(!me.postView.parts)
						me.postView.parts = {};

					me.postView.parts[me.postId] = layoutData.partContents;
					me.parts = layoutData.partContents;

					me.layoutData = true;

					deferred.resolve(layoutData);
				}).fail(function(error){
					console.log('error!!');
				});
			});

			return deferred.promise();
		},

		render: function(){
			var me = this,
				markupper = ContentTools.getMarkupper()
			;

			if(!this.layoutData){
				this.$el.html('Loading');
				return this.loadingLayout.done(function(){
					me.render();
				});
			}

			var wrappers = this.postView.postLayout,
				options = this.postView.partOptions || {},
				layout = {
					wrappers: wrappers,
					wrappersLength: wrappers.length,
					extraClasses: {},
					attributes: {}
				}
			;

			_.each(wrappers, function(wrapper){
				wrapper.objectsLength = wrapper.objects.length;
				_.each(wrapper.objects, function(object){

					var attributes = options && options[object.slug] && options[object.slug].attributes ? options[object.slug].attributes : {},
						attrs = ''
					;
					_.each(attributes, function(value, key){
						attrs += key +'="' + value + '" ';
					});

					layout.attributes[object.slug] = attrs;
					layout.extraClasses[object.slug] = options && options[object.slug] && options[object.slug].extraClasses ? options[object.slug].extraClasses : '';

					object.markup = markupper.markup(object.slug, me.parts.replacements, me.getTemplate(object.slug));
				});
			});


			this.$el.html(this.tpl(layout));
			this.setContentPadding();
			this.trigger('rendered');


		},

		getTemplate: function(part){
			var templates = this.postView.partTemplates;

			if(part == 'contents' && this.content_mode == 'post_excerpt')
				part = 'excerpt';
			if(templates && templates[part])
				return templates[part];

			return Upfront.data.thisPost.templates[part];
		},

		fetchPost: function(){
			var me = this,
				deferred = $.Deferred()
			;
			this.post = new Upfront.Models.Post({ID: this.postId});

			//this.bindPostEvents();
			me.loadingPost = deferred.promise();
			this.post.fetch({withMeta: true, filterContent: true}).done(function(response){
				if(!Upfront.data.posts)
					Upfront.data.posts = {};
				Upfront.data.posts[me.postId] = me.post;
				deferred.resolve(me.post);
			});


			return this.loadingPost;
		},

		editContents: function(e, focusElement){
			//If we are already editing, don't do anything
			if(this.contentEditor)// || Upfront.Application.current_subapplication == Upfront.Application.PostContentEditor)
				return;

			//If we haven't fetched all the data, return too
			if(!this.layoutData || !this.post) {
				return;
			}

			// Make sure that the content is ready for editing, if not, render again and return
			if(this.$el.find('.upfront-content-marker').length < 1) {
				this.render();
				return;
			}

			var target = e ? $(e.currentTarget) : focusElement;


			this.contentEditor = new ContentTools.PostContentEditor({
				post: this.post,
				postView: this.postView,
				content_mode: this.content_mode,
				el: this.el,
				triggeredBy: target,
				authorTpl: this.getTemplate('author'),
				partOptions: this.postView.partOptions,
				rawContent: this.parts.replacements['%raw_content%'],
				rawExcerpt: this.parts.replacements['%raw_excerpt%']
			});

			this.$el.closest('.upfront-wrapper').addClass('upfront-postcontent-editor');
			Upfront.Events.trigger('post:content:edit:start', this.contentEditor);

			this.listenTo(this.contentEditor, 'cancel', this.cancelChanges);
			this.listenTo(this.contentEditor, 'publish', this.publish);
			this.listenTo(this.contentEditor, 'draft', this.saveDraft);
			this.listenTo(this.contentEditor, 'trash', this.trash);
		},

		stopEditContents: function(){
			this.stopListening(this.contentEditor);
			this.contentEditor.stop();
			this.contentEditor = false;
			this.$el.closest('.upfront-wrapper').removeClass('upfront-postcontent-editor');
			Upfront.Events.trigger('post:content:edit:stop', this.contentEditor);
		},

		cancelChanges: function(){
			this.stopEditContents();
			this.render();
		},

		publish: function(results){
			this.save(results, 'publish', 'Publishing ' + this.post.get('post_type') + ' ...', this.capitalize(this.post.get('post_type')) + ' published');
		},
		saveDraft:function(results){
			this.save(results, 'draft', 'Saving ' + this.post.get('post_type') + ' ...', this.capitalize(this.post.get('post_type')) + ' saved as a draft');
		},

		trash: function(){
			var me = this,
				postType = this.post.get('post_type'),
				loading = new Upfront.Views.Editor.Loading({
					loading: 'Deleting ' + postType + ' ...',
					done: "Here we are!",
					fixed: false
				})
			;
			loading.render();
			this.$el.append(loading.$el);
			this.post.set('post_status', 'trash').save().done(function(){
				console.log('Deleting');
				loading.$el.remove();
				Upfront.Views.Editor.notify('The ' + postType + ' has been deleted.');
				me.stopEditContents();

				if(me.postView.property('type') == 'UpostsModel')
					me.postView.refreshMarkup();
			});
		},

		save: function(results, status, loadingMsg, successMsg){
			var me = this,
				changed = this.changed,
				updateMeta = true,
				metaUpdated = !updateMeta,
				loading = new Upfront.Views.Editor.Loading({
					loading: loadingMsg,
					done: "Here we are!",
					fixed: false
				}),
				postUpdated = false
			;

			console.log('Saving post');

			loading.render();
			this.$el.append(loading.$el);
			this.contentEditor.bar.$el.hide();
            console.log("results", results);
			if(results.title)
				this.post.set('post_title', results.title);
			if(results.content) {
				if(this.postView.property('content_type') == 'excerpt')
					this.post.set('post_excerpt', results.content);
				else
					this.post.set('post_content', results.content);
			}
			if(results.author)
				this.post.set('post_author', results.author);

            if(results.excerpt)
                this.post.set('post_excerpt', results.excerpt);

			if(results.inserts){
				this.post.meta.setValue('_inserts_data', results.inserts);
			}

			if(results.date)
				this.post.set('post_date', results.date);

			if(results.visibility){
				this.post.setVisibility(results.visibility);
				if(results.pass)
					this.post.set('post_password', results.pass);
			}

			this.post.set('post_status', status);
			this.post.save().done(function(data){
				if(metaUpdated){
					loading.done();
					Upfront.Views.Editor.notify(successMsg);
					me.fetchPostLayout().then(function(){
						me.stopEditContents();
						me.render();
					});
				}

				postUpdated = true;
			});

			if(updateMeta){
				me.post.meta.save().done(function(){
					if(postUpdated){
						loading.done();
						Upfront.Views.Editor.notify(successMsg);
						me.fetchPostLayout().then(function(){
							me.stopEditContents();
							me.render();
						});
					}
					metaUpdated = true;
				});
			}
			else
				metaUpdated
		},

		capitalize: function(str){
			return str.charAt(0).toUpperCase() + str.slice(1);
		},

		preventLinkNavigation: function(e){
			e.preventDefault();
		},

		setContentPadding: function(){
			var colSize = Upfront.Behaviors.GridEditor.col_size,
				options = this.postView.partOptions,
				rightPadding = options.contents ? options.contents.padding_right * colSize : 0,
				leftPadding = options.contents ? options.contents.padding_left * colSize : 0,
				styles = this.postView.$('.upfront-post-padding'),
				rules = '#' + this.postView.property('element_id') + ' .upfront-content-marker-contents>* {'
			;

			if(!styles.length){
				styles = $('<style class="upfront-post-padding"></style>');
				this.postView.$el.append(styles);
			}

			rules += 'padding-left: ' + leftPadding + 'px; padding-right: ' + rightPadding + 'px;}';

			styles.html(rules);
		}
	});

	// Publish the post editor to the Upfront.Content object
	Upfront.Content.PostEditor = PostEditor;
});

})(jQuery);
