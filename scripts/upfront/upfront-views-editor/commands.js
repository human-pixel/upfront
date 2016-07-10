(function(){
    var l10n = Upfront.Settings && Upfront.Settings.l10n
            ? Upfront.Settings.l10n.global.views
            : Upfront.mainData.l10n.global.views
        ;
    define([
        'scripts/upfront/upfront-views-editor/fields',
        'scripts/upfront/upfront-views-editor/commands/command',
        'scripts/upfront/upfront-views-editor/commands/command-cancel-post-layout',
        'scripts/upfront/upfront-views-editor/commands/command-delete',
        'scripts/upfront/upfront-views-editor/commands/command-edit-background-area',
        'scripts/upfront/upfront-views-editor/commands/command-general-edit-custom-css',
        'scripts/upfront/upfront-views-editor/commands/command-edit-custom-css',
        'scripts/upfront/upfront-views-editor/commands/command-edit-global-regions',
        'scripts/upfront/upfront-views-editor/commands/command-edit-layout-background',
        'scripts/upfront/upfront-views-editor/commands/command-edit-structure',
        'scripts/upfront/upfront-views-editor/commands/command-exit',
        'scripts/upfront/upfront-views-editor/commands/command-export-history',
        'scripts/upfront/upfront-views-editor/commands/command-go-to-type-preview-page',
        'scripts/upfront/upfront-views-editor/commands/command-load-layout',
        'scripts/upfront/upfront-views-editor/commands/command-logo',
        'scripts/upfront/upfront-views-editor/commands/command-merge',
        'scripts/upfront/upfront-views-editor/commands/command-new-page',
        'scripts/upfront/upfront-views-editor/commands/command-new-post',
        'scripts/upfront/upfront-views-editor/commands/command-open-font-manager',
        'scripts/upfront/upfront-views-editor/commands/command-preview-layout',
        'scripts/upfront/upfront-views-editor/commands/command-publish-layout',
        'scripts/upfront/upfront-views-editor/commands/command-redo',
        'scripts/upfront/upfront-views-editor/commands/command-reset-everything',
        'scripts/upfront/upfront-views-editor/commands/command-save-layout',
        'scripts/upfront/upfront-views-editor/commands/command-save-layout-as',
        'scripts/upfront/upfront-views-editor/commands/command-save-post-layout',
        'scripts/upfront/upfront-views-editor/commands/command-select',
        'scripts/upfront/upfront-views-editor/commands/command-toggle-grid',
        'scripts/upfront/upfront-views-editor/commands/command-toggle-mode',
        'scripts/upfront/upfront-views-editor/commands/command-toggle-mode-small',
        'scripts/upfront/upfront-views-editor/commands/command-trash',
        'scripts/upfront/upfront-views-editor/commands/command-undo',
        'scripts/upfront/upfront-views-editor/commands/responsive/command-create-responsive-layouts',
        'scripts/upfront/upfront-views-editor/commands/responsive/command-start-responsive-mode',
        'scripts/upfront/upfront-views-editor/commands/responsive/command-stop-responsive-mode',
        'scripts/upfront/upfront-views-editor/commands/responsive/command-responsive-redo',
        'scripts/upfront/upfront-views-editor/commands/responsive/command-responsive-undo',
        'scripts/upfront/upfront-views-editor/commands/breakpoint/command-add-custom-breakpoint',
        'scripts/upfront/upfront-views-editor/commands/breakpoint/command-breakpoint-dropdown',
        'scripts/upfront/upfront-views-editor/commands/command-open-media-gallery',
        'scripts/upfront/upfront-views-editor/commands/command-popup-list'
    ], function (
        Fields,
        Command,
        CommandCancelPostLayout,
        CommandDelete,
        CommandEditBackgroundArea,
        CommandGeneralEditCustomCss,
        CommandEditCustomCss,
        CommandEditGlobalRegions,
        CommandEditLayoutBackground,
        CommandExit,
        CommandExportHistory,
        CommandGoToTypePreviewPage,
        CommandLoadLayout,
        CommandLogo,
        CommandMerge,
        CommandNewPage,
        CommandNewPost,
        CommandOpenFontManager,
        CommandPreviewLayout,
        CommandPublishLayout,
        CommandRedo,
        CommandResetEverything,
        CommandSaveLayout,
        CommandSaveLayoutAs,
        CommandSavePostLayout,
        CommandSelect,
        CommandToggleGrid,
        CommandToggleMode,
        CommandToggleModeSmall,
        CommandTrash,
        CommandUndo,
        CommandCreateResponsiveLayouts,
        CommandStartResponsiveMode,
        CommandStopResponsiveMode,
        CommandResponsiveRedo,
        CommandResponsiveUndo,
        CommandAddCustomBreakpoint,
        CommandBreakpointDropdown,
        CommandOpenMediaGallery,
        CommandPopupList
    ) {
        var Commands = Backbone.View.extend({
            "tagName": "ul",

            initialize: function () {
                this.Commands = _([
                    new CommandNewPage({"model": this.model}),
                    new CommandNewPost({"model": this.model}),
                    new CommandSaveLayout({"model": this.model}),
                    new CommandSaveLayoutAs({"model": this.model}),
                    //new CommandLoadLayout({"model": this.model}),
                    new CommandUndo({"model": this.model}),
                    new CommandRedo({"model": this.model}),
                    new CommandDelete({"model": this.model}),
                    new CommandSelect({"model": this.model}),
                    new CommandToggleGrid({"model": this.model}),
                    new CommandResetEverything({"model": this.model})
                ]);
                if (Upfront.Settings.Debug.transients) this.commands.push(new CommandExportHistory({model: this.model}));
            },
            render: function () {
                this.$el.find("li").remove();
                this.commands.each(this.add_command, this);
            },

            add_command: function (command) {
                if (!command) return;
                command.remove();
                command.render();
                this.$el.append(command.el);
                command.bind("upfront:command:remove", this.remove_command, this);
                command.delegateEvents();
            },

            remove_command: function (to_remove) {
                var coms = this.commands.reject(function (com) {
                        com.remove();
                        return com.cid == to_remove.cid;
                    })
                    ;
                this.commands = _(coms);
                this.render();
            }
        });

        return {
            Command: Command,
            Commands: Commands,
            Command_CancelPostLayout: CommandCancelPostLayout,
            Command_Delete: CommandDelete,
            Command_EditBackgroundArea: CommandEditBackgroundArea,
            Command_GeneralEditCustomCss: CommandGeneralEditCustomCss,
            Command_EditCustomCss: CommandEditCustomCss,
            Command_EditGlobalRegions: CommandEditGlobalRegions,
            Command_EditLayoutBackground: CommandEditLayoutBackground,
            Command_Exit: CommandExit,
            Command_ExportHistory: CommandExportHistory,
            Command_GoToTypePreviewPage: CommandGoToTypePreviewPage,
            Command_LoadLayout: CommandLoadLayout,
            Command_Logo: CommandLogo,
            Command_Merge: CommandMerge,
            Command_NewPage: CommandNewPage,
            Command_NewPost: CommandNewPost,
            Command_OpenFontManager: CommandOpenFontManager,
            Command_PreviewLayout: CommandPreviewLayout,
            Command_PublishLayout: CommandPublishLayout,
            Command_Redo: CommandRedo,
            Command_ResetEverything: CommandResetEverything,
            Command_SaveLayout: CommandSaveLayout,
            Command_SaveLayoutAs: CommandSaveLayoutAs,
            Command_SavePostLayout: CommandSavePostLayout,
            Command_Select: CommandSelect,
            Command_ToggleGrid: CommandToggleGrid,
            Command_ToggleMode: CommandToggleMode,
            Command_ToggleModeSmall: CommandToggleModeSmall,
            Command_Trash: CommandTrash,
            Command_Undo: CommandUndo,
            Command_CreateResponsiveLayouts: CommandCreateResponsiveLayouts,
            Command_StartResponsiveMode: CommandStartResponsiveMode,
            Command_StopResponsiveMode: CommandStopResponsiveMode,
            Command_ResponsiveRedo: CommandResponsiveRedo,
            Command_ResponsiveUndo: CommandResponsiveUndo,
            Command_AddCustomBreakpoint: CommandAddCustomBreakpoint,
            Command_BreakpointDropdown: CommandBreakpointDropdown,
            Command_OpenMediaGallery: CommandOpenMediaGallery,
            Command_PopupList: CommandPopupList
        };


    });
})();
