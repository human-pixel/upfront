<?php

class Upfront_EditorL10n_Server implements IUpfront_Server {
	
	public static function serve () {
		$me = new self;
		$me->_add_hooks();
	}

	private function _add_hooks () {
		add_filter('upfront_l10n', array($this, 'add_l10n_strings'));
	}

	public function add_l10n_strings ($strings) {
		if (!empty($strings['global'])) return $strings;
		$strings['global'] = self::_get_l10n();
		return $strings;
	}

	private static function _get_l10n ($key=false) {
		$l10n = array(
			'application' => array(
				'preview_not_ready' => __('Your preview is not ready yet', 'upfront'),
				'revisions' => __('Revisions', 'upfront'),
				'created_by' => __('created by', 'upfront'),
				'save_layout_pop' => __('Do you wish to save the post layout just for this post or apply it to all posts?', 'upfront'),
				'this_post_only' => __('This post only', 'upfront'),
				'all_posts_of_this_type' => __('All posts of this type', 'upfront'),
				'saving_post_layot' => __('Saving post layout...', 'upfront'),
				'thank_you_for_waiting' => __('Thank you for waiting', 'upfront'),
				'save_part_pop' => __('Do you wish to save this part template only for this element, or for all the elements of this post type?', 'upfront'),
				'this_element_only' => __('This element only', 'upfront'),
				'all_elements' => __('All elements with the same post type', 'upfront'),
				'saved_template' => __('Saved template for %s part.', 'upfront'),
				'post_layout_editor' => __('Post Layout Editor', 'upfront'),
				'loading' => __('Loading...', 'upfront'),
				'preparing_new_post_type' => __('Preparing new %s...', 'upfront'),
				'here_we_are' => __('Here we are!', 'upfront'),
				'loading_path' => __('Loading %s...', 'upfront'),
				'navigation_confirm' => __('You have unsaved changes you\'re about to lose by navigating off this page. Do you really want to leave this page?', 'upfront'),
				'please_hold_on' => __('Please, hold on for just a little bit more', 'upfront'),
			),
			'behaviors' => array(
				'group' => __('Group', 'upfront'),
				'this_post_only' => __('Do you wish to save layout just for this post or apply it to all posts?', 'upfront'),
				'loading_content' => __('Loading content...', 'upfront'),
				'theme_text_fonts' => __('Theme Text Fonts', 'upfront'),
				'ok' => __('OK', 'upfront'),
				'loading' => __('Loading...', 'upfront'),
				'page_layout_name' => __('Page name (leave empty for single-page.php)', 'upfront'),
				'start_fresh' => __('Start fresh', 'upfront'),
				'start_from_existing' => __('Start from existing layout', 'upfront'),
				'create' => __('Create', 'upfront'),
				'create_new_layout' => __('Create New Layout', 'upfront'),
				'no_saved_layout' => __('No saved layout', 'upfront'),
				'edit' => __('Edit', 'upfront'),
				'edit_saved_layout' => __('Edit Saved Layout', 'upfront'),
				'checking_layouts' => __('Checking layouts', 'upfront'),
				'layout_exported' => __('Layout exported!', 'upfront'),
				'select_theme' => __('Select Theme', 'upfront'),
				'new_theme' => __('New theme', 'upfront'),
				'theme_name' => __('Theme Name', 'upfront'),
				'directory' => __('Directory', 'upfront'),
				'author' => __('Author', 'upfront'),
				'author_uri' => __('Author URI', 'upfront'),
				'activate_upon_creation' => __('Activate the new theme upon creation', 'upfront'),
				'export_theme_images' => __('Export images with the theme', 'upfront'),
				'export_button' => __('Export', 'upfront'),
				'export_theme' => __('Export Theme', 'upfront'),
				'creating_theme' => __('Creating theme', 'upfront'),
				'exporting_layout' => __('Exporting layout: ', 'upfront'),
				'excellent_start' => __('Excellent start!', 'upfront'),
				'homepage_created' => __('Your HOMEPAGE — Static layout has been successfully created. You can create more Layouts for your theme by clicking ‘New Layout’ in  the left sidebar. Remember, the best themes in life <del>are free</del> have lots of layouts!', 'upfront'),
				'style_exporter' => __('Style exported.', 'upfront'),
				'style_export_fail' => __('Style could not be exported.', 'upfront'),
				'region_css_cleaned' => __('Region CSS cleaned', 'upfront'),
				'cleaning_region_css' => __('Cleaning Region CSS...', 'upfront'),
				'structure' => __('Structure', 'upfront'),
				'grid_settings' => __('Grid Settings', 'upfront'),
				'recommended_settings' => __('Recommended Settings', 'upfront'),
				'custom_settings' => __('Custom Settings', 'upfront'),
				'padding_large' => __('15px column padding', 'upfront'),
				'padding_medium' => __('10px column padding', 'upfront'),
				'padding_small' => __('5px column padding', 'upfront'),
				'no_padding' => __('no column padding', 'upfront'),
				'page_bg_color' => __('Page Background Color', 'upfront'),
				'column_width' => __('Column Width', 'upfront'),
				'column_padding' => __('Column Padding', 'upfront'),
				'baseline_grid' => __('Baseline Grid', 'upfront'),
				'additional_type_padding' => __('Additional Type Padding', 'upfront'),
				'allow_floats_outside_main_grid' => __('Allow floated areas outside main grid', 'upfront'),
				'delay_before_drag' => __('Delay before drag:', 'upfront'),
				'delay_before_changing_position' => __('Delay before changing position:', 'upfront'),
				'show_debug_info' => __('Show debugging info/outline', 'upfront'),
				'close' => __('Close', 'upfront'),
			),
			'content' => array(
				'loading' => __('Loading', 'upfront'),
				'publishing' => __('Publishing %s...', 'upfront'),
				'published' => __('%s published', 'upfront'),
				'saving' => __('Saving %s...', 'upfront'),
				'drafted' => __('%s saved as a draft', 'upfront'),
				'deleting' => __('Deleting %s...', 'upfront'),
				'deleted' => __('The %s has been deleted.', 'upfront'),
				'here_we_are' => __('Here we are!', 'upfront'),
				'trigger_edit_featured_image' => __('Click to edit the post\'s featured image', 'upfront'),
				'starting_img_editor' => __('Starting image editor ...', 'upfront'),
				'swap_image' => __('Swap Image', 'upfront'),
				'scheduled' => __('Scheduled', 'upfront'),
				'published' => __('Published', 'upfront'),
				'pending_review' => __('Pending Review', 'upfront'),
				'draft' => __('Draft', 'upfront'),
				'private_post' => __('Privately Published', 'upfront'),
				'new_post' => __('New', 'upfront'),
				'deleted_post' => __('Deleted', 'upfront'),
				'public_post' => __('Public', 'upfront'),
				'sticky' => __('Sticky', 'upfront'),
				'protected_post' => __('Protected', 'upfront'),
				'is_private' => __('Private', 'upfront'),
				'publish' => __('Publish', 'upfront'),
				'immediately' => __('Immediately', 'upfront'),
				'publish_on' => __('Publish on', 'upfront'),
				'schedule' => __('Schedule', 'upfront'),
				'edit_pwd' => __('Edit password...', 'upfront'),
				'update' => __('Update', 'upfront'),
				'discard_changes' => __('Are you sure to discard the changes made to %s?', 'upfront'),
				'delete_confirm' => __('Are you sure you want to delete this %s?', 'upfront'),
				'popup_loading' => __('No such thing as <q>too many drinks</q>.', 'upfront'),
				'categories' => __('Categories', 'upfront'),
				'tags' => __('Tags', 'upfront'),
				'no_posts' => __('No posts found', 'upfront'),
				'posts' => __('Posts', 'upfront'),
				'edit' => __('Edit', 'upfront'),
				'edit_post' => __('Edit post', 'upfront'),
				'select_page' => __('Please select Page', 'upfront'),
				'featured_image' => __('Featured Image', 'upfront'),
				'template' => __('Template', 'upfront'),
				'default_opt' => __('Default', 'upfront'),
				'edit_page' => __('Edit page', 'upfront'),
				'no_comments' => __('This post or page has no comments.', 'upfront'),
				'author' => __('Author', 'upfront'),
				'date' => __('Date', 'upfront'),
				'comment' => __('Comment', 'upfront'),
				'ok' => __('OK', 'upfront'),
				'cancel' => __('Cancel', 'upfront'),
				'reply' => __('Reply', 'upfront'),
				'approve' => __('Approve', 'upfront'),
				'unapprove' => __('Unapprove', 'upfront'),
				'unspam' => __('Unspam', 'upfront'),
				'spam' => __('Spam', 'upfront'),
				'untrash' => __('Untrash', 'upfront'),
				'trash' => __('Trash', 'upfront'),
				'edit_post_url' => __('Edit the <b>URL</b> for this post', 'upfront'),
				'post_url_info' => __('By default, your URL is determined by a post\'s or page\'s title. You can change it here.<br/>It is a good idea to keep them short and memorable.', 'upfront'),
				'parent_category' => __('Parent Category', 'upfront'),
				'insert_font' => __('Insert Font', 'upfront'),
				'insert_theme_image' => __('Link theme image', 'upfront'),
				'available_element_selectors' => __('Available element selectors:', 'upfront'),
				'save' => __('Save', 'upfront'),
				'loading_fonts' => __('Loading fonts...', 'upfront'),
				'choose_typeface' => __('Choose Typeface above to Preview its Font Styles', 'upfront'),
				'typeface_info_text' => __('(If just want to stick to defaults like Arial and Times, click \'Ok\'.<br>You can always come back and add Google Fonts later.)', 'upfront'),
				'theme_font_styles' => __('Theme Font Styles:', 'upfront'),
				'no_fonts_added' => __('You haven\'t added any font styles to theme yet.', 'upfront'),
				'links_to' => __('Links to:', 'upfront'),
				'no_link' => __('No link', 'upfront'),
				'url' => __('URL', 'upfront'),
				'post_or_page' => __('Post or Page', 'upfront'),
				'anchor' => __('Anchor', 'upfront'),
				'change_link' => __('Change link', 'upfront'),
				'larger_image' => __('Larger image', 'upfront'),
				'lightbox' => __('Lightbox', 'upfront'),
				'lightbox_name' => __('Lightbox Name', 'upfront'),
				'new_lightbox' => __('New Lightbox', 'upfront'),
				'advanced_tools' => __('Advanced tools', 'upfront'),
				'save_draft' => __('save_draft', 'upfront'),
				'password' => __('Password', 'upfront'),
				'edit_tax' => __('Edit Categories and Tags', 'upfront'),
				'edit_url' => __('Edit URL', 'upfront'),
				'general_setup' => __('General setup', 'upfront'),
				'general' => __('General', 'upfront'),
				'date_format' => __('Date format', 'upfront'),
				'date_setup' => __('Date setup', 'upfront'),
				'php_date_fmt' => __('PHP date format', 'upfront'),
				'tags_settings' => __('Tags settings', 'upfront'),
				'tag_separator' => __('Tags separator', 'upfront'),
				'left' => __('Left', 'upfront'),
				'right' => __('Right', 'upfront'),
				'content_padding' => __('Content padding', 'upfront'),
				'post_featured_image' => __('Post Featured Image', 'upfront'),
				'edit_html_tpl' => __('Edit HTML template', 'upfront'),
				'save_layout_nag' => __('Do you wish to save layout just for this post or apply it to all posts?', 'upfront'),
			),
			'views' => array(
				'unsaved_changes_nag' => __('You have unsaved changes you\'re about to lose by navigating off this page.', 'upfront'),
				'save' => __('Save', 'upfront'),
				'undo' => __('Undo', 'upfront'),
				'hide_grid' => __('Hide Grid', 'upfront'),
				'show_grid' => __('Show Grid', 'upfront'),
				'ungroup' => __('Ungroup', 'upfront'),
				'reorder' => __('Reorder', 'upfront'),
				'done' => __('Done', 'upfront'),
				'region_container_label' => __('Region container', 'upfront'),
				'region_container_info' => __('The layer that contains all the regions.', 'upfront'),
				'main_content_label' => __('Main content region', 'upfront'),
				'main_content_info' => __('The main content region.', 'upfront'),
				'lsr_label' => __('Left sidebar region', 'upfront'),
				'lsr_info' => __('The left sidebar region.', 'upfront'),
				'rsr_label' => __('Right sidebar region', 'upfront'),
				'rsr_info' => __('The left sidebar region.', 'upfront'),
				'finish_editing' => __('Finish Editing', 'upfront'),
				'edit_background' => __('Edit Background', 'upfront'),
				'add_floating_region' => __('Add Floating Region', 'upfront'),
				'change_background' => __('Change Background', 'upfront'),
				'finish_edit_bg' => __('Finish editing background', 'upfront'),
				'rw_label' => __('Region wrapper', 'upfront'),
				'rw_info' => __('The layer that wrap region.', 'upfront'),
				'section_delete_nag' => __('Are you sure you want to delete this section?', 'upfront'),
				'main_area' => __('Main Area', 'upfront'),
				'click_to_edit_floating_region' => __('Click to edit this<br />Floating Region', 'upfront'),
				'ok' => __('OK', 'upfront'),
				'ltbox_area_label' => __('Lightbox Area', 'upfront'),
				'ltbox_area_info' => __('The Lightbox Area.', 'upfront'),
				'ltbox_close_icon_label' => __('Close Icon', 'upfront'),
				'ltbox_close_icon_info' => __('Lightbox Close Icon.', 'upfront'),
				'edit_ltbox' => __('Edit Lightbox', 'upfront'),
				'show_element' => __('show element', 'upfront'),
				'show_region' => __('show region', 'upfront'),
				'exiting_upfront' => __('Exiting upfront...', 'upfront'),
				'exit_done' => __('Wow, those are cool!', 'upfront'),
				'already_creating_post' => __('You are already creating a new %s.', 'upfront'),
				'preparing_new_post' => __('Preparing new %s...', 'upfront'),
				'preparing_done' => __('Wow, those are cool!', 'upfront'),
				'new_page' => __('New Page', 'upfront'),
				'add_new_page' => __('Add New Page', 'upfront'),
				'none' => __('None', 'upfront'),
				'create_page' => __('Create Page', 'upfront'),
				'permalink' => __('Permalink', 'upfront'),
				'page_template' => __('Page Template', 'upfront'),
				'save_as' => __('Save As...', 'upfront'),
				'save_layout' => __('Save layout', 'upfront'),
				'cancel' => __('Cancel', 'upfront'),
				'building' => __('Building...', 'upfront'),
				'preview' => __('Preview', 'upfront'),
				'alternate_layout' => __('Alternate layout', 'upfront'),
				'publish_layout' => __('Publish layout', 'upfront'),
				'undoing' => __('Undoing...', 'upfront'),
				'undoing_done' => __('Thank you for waiting', 'upfront'),
				'redo' => __('Redo', 'upfront'),
				'redoing' => __('Redoing...', 'upfront'),
				'redoing_done' => __('Thank you for waiting', 'upfront'),
				'export_history' => __('Export history', 'upfront'),
				'merge_selected' => __('Merge selected', 'upfront'),
				'delete_string' => __('Delete', 'upfront'),
				'select_mode_on' => __('Select mode on', 'upfront'),
				'select_mode_off' => __('Select mode off', 'upfront'),
				'destroy_layout' => __('destroy the layout and clear everything up', 'upfront'),
				'reset_everything' => __('Reset everything', 'upfront'),
				'current_mode' => __('Current mode: {{mode}}', 'upfront'),
				'choose_theme' => __('Choose theme', 'upfront'),
				'new_layout' => __('New Layout', 'upfront'),
				'layouts' => __('Layouts', 'upfront'),
				'edit_grid' => __('Edit Grid', 'upfront'),
				'edit_global_bg' => __('Edit Global Background', 'upfront'),
				'add_custom_css_rules' => __('add custom css rules', 'upfront'),
				'theme_font_manager' => __('Theme Font Manager', 'upfront'),
				'go_to_preview_page' => __('Go to Type Preview Page', 'upfront'),
				'export_str' => __('Export', 'upfront'),
				'create_responsive_layouts' => __('Create Responsive Layouts', 'upfront'),
				'responsive_mode' => __('Responsive Mode', 'upfront'),
				'exit_responsive' => __('Exit Responsive', 'upfront'),
				'activate_breakpoints' => __('Activate Breakpoints', 'upfront'),
				'new_breakpoint' => __('New Custom Breakpoint', 'upfront'),
				'browse_layouts' => __('Browse Layouts', 'upfront'),
				'no_title' => __('No title', 'upfront'),
				'draggable_elements' => __('Draggable Elements', 'upfront'),
				'post_components' => __('Post components', 'upfront'),
				'no_defined_fonts' => __('You have not defined any theme fonts yet. Please begin by adding fonts you want to use to the theme.', 'upfront'),
				'select_fonts_to_use' => __('Save', 'upfront'),
				'type_element' => __('Type Element:', 'upfront'),
				'h1' => __('Main Heading (H1)', 'upfront'),
				'h2' => __('Sub Heading (H2)', 'upfront'),
				'h3' => __('Sub Heading (H3)', 'upfront'),
				'h4' => __('Sub Heading (H4)', 'upfront'),
				'h5' => __('Sub Heading (H5)', 'upfront'),
				'h6' => __('Sub Heading (H6)', 'upfront'),
				'p' => __('Paragraph (P)', 'upfront'),
				'a' => __('Anchor Link (A)', 'upfront'),
				'ahover' => __('Anchor Link Hover (A:HOVER)', 'upfront'),
				'ul' => __('Unordered List (UL)', 'upfront'),
				'ol' => __('Ordered List (OL)', 'upfront'),
				'bq' => __('Blockquote (BLOCKQUOTE)', 'upfront'),
				'typeface' => __('Typeface', 'upfront'),
				'color' => __('Color', 'upfront'),
				'size' => __('Size', 'upfront'),
				'line_height' => __('Line Height', 'upfront'),
				'weight_style' => __('Weight / Style', 'upfront'),
				'typography' => __('Typography', 'upfront'),
				'typography_and_colors' => __('Typography and Colors', 'upfront'),
				'theme_colors_save_fail' => __('Theme colors could not be saved.', 'upfront'),
				'theme_color_style_save_fail' => __('Theme color styles could not be saved.', 'upfront'),
				'edit_profile' => __('edit profile', 'upfront'),
				'anonymous' => __('anonymous', 'upfront'),
				'not_available_in_text_edit' => __('Not available when<br>editing text.', 'upfront'),
				'not_available_in_media_upload' => __('Not available when<br>uploading media.', 'upfront'),
				'publish_first_nag' => __('Please publish your content<br>before modifying the layout.', 'upfront'),
				'posts_pages_comments' => __('Posts / Pages / Comments', 'upfront'),
				'posts_pages' => __('Posts / Pages', 'upfront'),
				'popup_preloader' => __('No such thing as <q>too many drinks</q>.', 'upfront'),
				'posts' => __('Posts', 'upfront'),
				'pages' => __('Pages', 'upfront'),
				'comments' => __('Comments', 'upfront'),
				'media' => __('Media', 'upfront'),
				'no_image' => __('No Image', 'upfront'),
				'add' => __('Add', 'upfront'),
				'back_to_posts' => __('&laquo; Back to posts', 'upfront'),
				'add_new' => __('Add New', 'upfront'),
				'css_and_anchor' => __('CSS Styles &amp; Anchor Settings', 'upfront'),
				'css_styles' => __('CSS Styles', 'upfront'),
				'element_css_styles' => __('Element CSS Styles', 'upfront'),
				'settings' => __('Settings', 'upfront'),
				'anchor_nag' => __('Please, use ID that contains letters only, eg. <b>myProductSlider</b><br />No spaces or special characters.', 'upfront'),
				'default_str' => __('Default', 'upfront'),
				'add_new_style' => __('add new style', 'upfront'),
				'button_presets_save_fail' => __('Button presets could not be saved.', 'upfront'),
				'choose_font' => __('Save', 'upfront'),
				'save' => __('Save', 'upfront'),
			),
		);
		return !empty($key)
			? (!empty($l10n[$key]) ? $l10n[$key] : $key)
			: $l10n
		;
	}
}
Upfront_EditorL10n_Server::serve();