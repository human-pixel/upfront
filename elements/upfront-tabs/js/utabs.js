(function ($) {

  var templates = [
    'text!' + Upfront.data.utabs.template ];

  require(templates, function(tabsTpl) {
    var UtabsModel = Upfront.Models.ObjectModel.extend({
      init: function () {
        var properties = _.clone(Upfront.data.utabs.defaults);
        properties.element_id = Upfront.Util.get_unique_id("utabs-object");
        this.init_properties(properties);
      }
    });

    var UtabsView = Upfront.Views.ObjectView.extend({
      model: UtabsModel,
      tabsTpl: Upfront.Util.template(tabsTpl),
      elementSize: {width: 0, height: 0},

      initialize: function(){
        var me = this;
        if(! (this.model instanceof UtabsModel)){
          this.model = new UtabsModel({properties: this.model.get('properties')});
        }
        this.events = _.extend({}, this.events, {
          'click .single-video': 'setType',
          'click .multiple-videos': 'setType'
        });
        this.delegateEvents();

        this.model.get("properties").bind("change", this.render, this);
        this.model.get("properties").bind("add", this.render, this);
        this.model.get("properties").bind("remove", this.render, this);

        Upfront.Events.on("entity:resize_stop", this.onResizeStop, this);
      },

      get_content_markup: function () {
        var rendered,
          props = this.extract_properties();

        rendered = this.tabsTpl(this.extract_properties());

        return rendered;
      },

      extract_properties: function() {
        var props = {};
        this.model.get('properties').each(function(prop){
          props[prop.get('name')] = prop.get('value');
        });
        return props;
      },

      onResizeStop: function(view, model, ui) {
        var width;
        //TODO allow adding more tabs depending on width of element
        if(this.property('youtube_status') !== 'starting'){
          width = this.$el.find('.upfront-object-content').width();
          this.property('player_height', parseInt(width/1.641, 10));
          this.property('player_width', width, false);
        }
      },

      property: function(name, value, silent) {
        if(typeof value != "undefined"){
          if(typeof silent == "undefined")
            silent = true;
          return this.model.set_property(name, value, silent);
        }
        return this.model.get_property_value_by_name(name);
      }
    });

    var TabsElement = Upfront.Views.Editor.Sidebar.Element.extend({
      priority: 200,
      render: function () {
        this.$el.addClass('upfront-icon-element upfront-icon-element-tabs');
        this.$el.html('Tabs');
      },
      add_element: function () {
        var object = new UtabsModel(),
        module = new Upfront.Models.Module({
          "name": "",
          "properties": [
            {"name": "element_id", "value": Upfront.Util.get_unique_id("module")},
            {"name": "class", "value": "c9 upfront-tabs_module"},
            {"name": "has_settings", "value": 0},
            {"name": "row", "value": 15}
          ],
          "objects": [
            object
          ]
        })
        ;
        this.add_module(module);
      }
    });

    var TabsSettings = Upfront.Views.Editor.Settings.Settings.extend({
      initialize: function () {
        this.panels = _([
          new Upfront.Views.Editor.Settings.Panel({
            className: 'utabs-settings-panel',
            model: this.model,
            label: "Appearance",
            title: "Select settings",
            settings: [
              new Upfront.Views.Editor.Settings.Item({
                model: this.model,
                title: "Display style",
                fields: [
                  new Upfront.Views.Editor.Field.Checkboxes({
                    className: 'inline-checkbox',
                    model: this.model,
                    property: 'check_theme_style',
                    label: "",
                    values: [
                      { label: "", value: 'check_theme_style' },
                    ]
                  }),
                  new Upfront.Views.Editor.Field.Select({
                    model: this.model,
                    property: 'theme_style',
                    label: "Theme Styles",
                    values: [
                      { label: "Tabbed", value: 'options1' },
                      { label: "Simple text", value: 'options2' },
                      { label: "Button Tabs", value: 'options3' },
                    ]
                  }),
                  new Upfront.Views.Editor.Field.Checkboxes({
                    className: 'inline-checkbox',
                    model: this.model,
                    property: 'check_custom_style',
                    label: "",
                    values: [
                      { label: "", value: 'check_custom_style' },
                    ]
                  }),
                  new Upfront.Views.Editor.Field.Select({
                    model: this.model,
                    property: 'custom_style',
                    label: "Custom",
                    values: [
                      { label: "Tabbed", value: 'options1' },
                      { label: "Simple text", value: 'options2' },
                      { label: "Button Tabs", value: 'options3' },
                    ]
                  }),
                  new Upfront.Views.Editor.Field.Color({
                    model: this.model,
                    property: 'active_tab_color',
                    label: 'Active tab:'
                  }),
                  new Upfront.Views.Editor.Field.Color({
                    model: this.model,
                    property: 'active_tab_text_color',
                    label: 'Active tab text:'
                  }),
                  new Upfront.Views.Editor.Field.Color({
                    model: this.model,
                    property: 'inactive_tab_color',
                    label: 'Inactive tab:'
                  }),
                  new Upfront.Views.Editor.Field.Color({
                    model: this.model,
                    property: 'inactive_tab_text_color',
                    label: 'Inactive tab text:'
                  })
                ]
              })
            ]
          })
        ]);
      },
      // initialize: function () {
        // this.panels = _([
          // new AppearancePanel({model: this.model})
        // ]);
      // },

      get_title: function () {
        return "Tabs settings";
      }
    });

    var AppearancePanel = Upfront.Views.Editor.Settings.Panel.extend({
      className: 'utabs-settings',
      initialize: function () {
        var render_all = function(){
            this.settings.invoke('render');
          },
          me = this,
          SettingsItem =  Upfront.Views.Editor.Settings.Item,
          Fields = Upfront.Views.Editor.Field
        ;

        this.model.on('doit', render_all, this);

        this.settings = _([
          new SettingsItem({
            className: 'optional-field align-center',
            title: 'Display Style',
            fields: [
              new Fields.Radios({
              model: this.model,
              property: 'display_style',
              layout: "horizontal",
              className: 'field-display_style upfront-field-wrap upfront-field-wrap-multiple upfront-field-wrap-radios',
              values: [
                  {
                  label: 'Gallery',
                  value: 'gallery',
                  icon: 'display-style-gallery'
                },
                {
                  label: 'List',
                  value: 'list',
                  icon: 'display-style-list'
                }
                ]
              }),
            ]
          })
        ]);

        this.$el
          .on('change', 'input[name=display_style]', function(e){
            me.changeDisplayStyle(e);
          })
          .on('change', 'input[name=thumbWidth]', function(e) {
            me.onThumbChangeSize(e);
          })
        ;
        this.on('concealed', this.setFieldEvents, this);
      },

      get_label: function () {
        return 'Appearance';
      },

      get_title: function () {
        return false;
      },

      property: function(name, value, silent) {
        if(typeof value != "undefined"){
          if(typeof silent == "undefined")
            silent = true;
          return this.model.set_property(name, value, silent);
        }
        return this.model.get_property_value_by_name(name);
      }
    });


    Upfront.Application.LayoutEditor.add_object("Utabs", {
      "Model": UtabsModel,
      "View": UtabsView,
      "Element": TabsElement,
      "Settings": TabsSettings,
      'anchor': {
        is_target: false
      }
    });

    Upfront.Models.UtabsModel = UtabsModel;
    Upfront.Views.UtabsView = UtabsView;

  }); //End require

})(jQuery);
