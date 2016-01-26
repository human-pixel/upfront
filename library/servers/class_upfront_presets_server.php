<?php

abstract class Upfront_Presets_Server extends Upfront_Server {

	protected function __construct() {
		parent::__construct();

		add_filter('upfront_l10n', array('Upfront_Presets_Server', 'add_l10n_strings'));

		$this->elementName = $this->get_element_name();
		$this->db_key = 'upfront_' . get_stylesheet() . '_' . $this->elementName . '_presets';

		$registry = Upfront_PresetServer_Registry::get_instance();
		$registry->set($this->elementName, $this);
	}

	public abstract function get_element_name();

	protected function _add_hooks () {
		if (Upfront_Permissions::current(Upfront_Permissions::BOOT)) {
			upfront_add_ajax('upfront_get_' . $this->elementName . '_presets', array($this, 'get'));
		}
		if (Upfront_Permissions::current(Upfront_Permissions::SAVE)) {
			upfront_add_ajax('upfront_save_' . $this->elementName . '_preset', array($this, 'save'));
			upfront_add_ajax('upfront_delete_' . $this->elementName . '_preset', array($this, 'delete'));
			upfront_add_ajax('upfront_reset_' . $this->elementName . '_preset', array($this, 'reset'));
		}
	}

	public function get() {
		$this->_out(new Upfront_JsonResponse_Success($this->get_presets()));
	}

	public function delete() {
		if (!isset($_POST['data'])) {
			return;
		}

		$properties = stripslashes_deep($_POST['data']);
		do_action('upfront_delete_' . $this->elementName . '_preset', $properties, $this->elementName);

		if (!has_action('upfront_delete_' . $this->elementName . '_preset')) {
			$presets = $this->get_presets();

			$result = array();

			foreach ($presets as $preset) {
				if ($preset['id'] === $properties['id']) {
					continue;
				}
				$result[] = $preset;
			}

			$this->update_presets($result);
		}

		$this->_out(new Upfront_JsonResponse_Success('Deleted ' . $this->elementName . ' preset.'));
	}

	public function reset() {
		if (!isset($_POST['data'])) {
			return;
		}

		$properties = stripslashes_deep($_POST['data']);

		//If automatically generated default preset return false
		if(empty($properties['id'])) {
			return $this->_out(new Upfront_JsonResponse_Error("Invalid preset"));
		}

		do_action('upfront_reset_' . $this->elementName . '_preset', $properties, $this->elementName);

		if (!has_action('upfront_reset_' . $this->elementName . '_preset')) {
			$presets = $this->get_presets();
			$result = array();
			$resetpreset = array();

			foreach ($presets as $preset) {
				if ($preset['id'] === $properties['id']) {
					//Update preset properties
					$preset = $this->get_theme_preset_by_id($properties['id']);
					$resetpreset = $preset;
				}
				$result[] = $preset;
			}

			$this->update_presets($result);
		}


		$this->_out(new Upfront_JsonResponse_Success($resetpreset));
	}

	public function replace_new_lines($presets) {
		$new_presets = array();

		if(!empty($presets)) {
			foreach($presets as $preset) {
				if(isset($preset['preset_style']) && !empty($preset['preset_style'])) {
					$preset['preset_style'] = str_replace("@n", "\n", $preset['preset_style']);
				}

				$new_presets[] = $preset;
			}
		}

		return $new_presets;
	}

	/**
	 * Expand the URLs in preset style
	 *
	 * @param array $presets Presets to expand
	 *
	 * @return array Processed presets
	 */
	private function _expand_passive_relative_url ($presets) {
		if (empty($presets) || !is_array($presets)) return $presets;
		$contextless_uri = preg_replace('/^https?:/', '', get_stylesheet_directory_uri());
		foreach ($presets as $idx => $preset) {
			if (empty($preset['preset_style'])) continue;

			$preset['preset_style'] = preg_replace('/' . preg_quote(Upfront_ChildTheme::THEME_BASE_URL_MACRO, '/') . '/', $contextless_uri, $preset['preset_style']);
			$presets[$idx] = $preset;
		}

		return $presets;
	}

	/**
	 * @return array saved presets
	 */
	public function get_presets() {
		$presets = json_decode(get_option($this->db_key, '[]'), true);

		$presets = apply_filters(
			'upfront_get_' . $this->elementName . '_presets',
			$presets,
			array(
				'json' => false,
				'as_array' => true
			)
		);

		$presets = $this->replace_new_lines($presets);
		$presets = $this->_expand_passive_relative_url($presets);

		// Fail-safe
		if (is_array($presets) === false) {
			$presets = array();
		}

		return $presets;
	}

	protected function update_presets($presets = array()) {
		update_option($this->db_key, json_encode($presets));
	}

	public function save() {
		if (!isset($_POST['data'])) {
			return;
		}

		$properties = $_POST['data'];

		do_action('upfront_save_' . $this->elementName . '_preset', $properties, $this->elementName);

		if (!has_action('upfront_save_' . $this->elementName . '_preset')) {
			$presets = $this->get_presets();

			$result = array();

			foreach ($presets as $preset) {
				if ($preset['id'] === $properties['id']) {
					continue;
				}
				$result[] = $preset;
			}

			$result[] = $properties;

			$this->update_presets($result);
		}

		$this->_out(new Upfront_JsonResponse_Success('Saved ' . $this->elementName . ' preset, yay.'));
	}

	public function get_presets_styles() {
		$presets = $this->get_presets();
		$presets = $this->_expand_passive_relative_url($presets);

		if (empty($presets)) {
			return '';
		}

		$styles = '';
		foreach ($presets as $preset) {
			if (isset($preset['breakpoint']) && isset($preset['breakpoint']['tablet'])) {
				$preset['tablet'] = array();
				foreach($preset['breakpoint']['tablet'] as $name=>$property) {
					$preset['tablet'][$name] = $property;
				};
			}
			if (isset($preset['breakpoint']) && isset($preset['breakpoint']['mobile'])) {
				$preset['mobile'] = array();
				foreach($preset['breakpoint']['mobile'] as $name=>$property) {
					$preset['mobile'][$name] = $property;
				};
			}

			// Handle specific case for button where button has both preset classes and element class
			if (isset($preset['id']) && isset($preset['preset_style']) && preg_match('#upfront\-button#', $preset['preset_style']) === 1) {
				$preset['preset_style'] = preg_replace('#' . $preset['id'] . ' \.upfront-button#', $preset['id'] . '.upfront-button', $preset['preset_style']);
			}
			if (isset($preset['preset_style'])) {
				$preset['preset_style'] = str_replace('\"', '"', $preset['preset_style']);
				$preset['preset_style'] = str_replace('\"', '"', $preset['preset_style']);
				$preset['preset_style'] = str_replace('\"', '"', $preset['preset_style']);
				$preset['preset_style'] = str_replace("\'", "'", $preset['preset_style']);
				$preset['preset_style'] = str_replace("\'", "'", $preset['preset_style']);
				$preset['preset_style'] = str_replace("\'", "'", $preset['preset_style']);
				
				$preset['preset_style'] = str_replace('#page', 'div#page .upfront-output-region-container .upfront-output-module', $preset['preset_style']);
			}

			$args = array('properties' => $preset);
			extract($args);
			ob_start();
			include $this->get_style_template_path();
			$styles .= ob_get_clean();
		}

		$styles = stripslashes($styles);

		return $styles;
	}

	public function get_theme_presets() {
		$settings = Upfront_ChildTheme::get_settings();
		//Get presets distributed with the theme
		$theme_presets = is_object($settings) && $settings instanceof Upfront_Theme_Settings
			? json_decode($settings->get($this->elementName . '_presets'), true)
			: false
		;

		return $theme_presets;
	}

	public function get_theme_presets_names() {

		//Get presets distributed with the theme
		$theme_presets = $this->get_theme_presets();

		if(empty($theme_presets)) return false;

		$theme_preset_names = array();

		foreach($theme_presets as $preset) {
			$theme_preset_names[] = $preset['id'];
		}

		return $theme_preset_names;
	}

	public function get_theme_preset_by_id($preset) {
		$theme_presets = $this->get_theme_presets();

		if(empty($theme_preset)) {
			return false;
		}

		foreach($theme_presets as $tpreset) {
			if($tpreset['id'] == $preset) {
				return $tpreset;
			}
		}

		return false;
	}

	public function get_preset_by_id($preset_id) {
		$presets = $this->get_presets();

		foreach($presets as $preset) {
			if($preset['id'] == $preset_id) {
				return $preset;
			}
		}
	}

	/**
	 * Allow child classes to update presets if needed.
	 */
	protected function migrate_presets($presets) {
		return $presets;
	}

	public function get_presets_javascript_server() {
		$presets = get_option('upfront_' . get_stylesheet() . '_' . $this->elementName . '_presets');
		$presets = apply_filters(
			'upfront_get_' . $this->elementName . '_presets',
			$presets,
			array(
				'json' => false,
				'as_array' => true
			)
    );

		if(!is_array($presets)) {
			$presets = json_decode($presets, true);
		}

		$theme_presets = array();
		$updatedPresets = array();

		//Get presets distributed with the theme
		$theme_presets = $this->get_theme_presets_names();

		if(empty($theme_presets)) {
			return json_encode($this->migrate_presets($presets));
		}

		//Check if preset is distributed with the theme
		if (is_array($presets)) foreach($presets as $preset) {
			if(in_array($preset['id'], $theme_presets)) {
				$preset['theme_preset'] = true;
			} else {
				$preset['theme_preset'] = false;
			}
			$updatedPresets[] = $preset;
		}

		$updatedPresets = $this->replace_new_lines(
			$this->migrate_presets($updatedPresets)
		);
		$updatedPresets = $this->_expand_passive_relative_url($updatedPresets);

		$updatedPresets = json_encode($updatedPresets);

		if(empty($updatedPresets)) $updatedPresets = json_encode(array());

		return $updatedPresets;
	}

	public static function add_l10n_strings ($strings) {
		if (!empty($strings['preset_manager'])) return $strings;
		$strings['preset_manager'] = self::_get_l10n();
		return $strings;
	}
	
	public static function get_preset_defaults () {
		return array();
	}

	public static function get_l10n ($key) {
		return self::_get_l10n($key);
	}

	private static function _get_l10n ($key=false) {
		$l10n = array(
			'select_preset' => __('Select Preset', 'upfront'),
			'preset' => __('Preset', 'upfront'),
			'select_preset_label' => __('Choose or Create Preset:', 'upfront'),
			'delete_label' => __('Delete', 'upfront'),
			'add_label' => __('Add', 'upfront'),
			'ok_label' => __('OK', 'upfront'),
			'cancel_label' => __('Cancel', 'upfront'),
			'apply_label' => __('Apply', 'upfront'),
			'not_empty_label' => __('Preset name can not be empty.', 'upfront'),
			'special_character_label' => __('Preset name can contain only numbers, letters and spaces.', 'upfront'),
			'default_preset' => __('Default', 'upfront'),
			'add_preset_label' => __('Add Preset', 'upfront'),
			'border' => __('Border', 'upfront'),
			'none' => __('None', 'upfront'),
			'solid' => __('Solid', 'upfront'),
			'dashed' => __('Dashed', 'upfront'),
			'dotted' => __('Dotted', 'upfront'),
			'width' => __('Width', 'upfront'),
			'color' => __('Color', 'upfront'),
			'bg_color' => __('Background Color', 'upfront'),
			'edit_text' => __('Edit Text', 'upfront'),
			'default_preset' => __('Default', 'upfront'),
			'border' => __('Border', 'upfront'),
			'px' => __('px', 'upfront'),
			'type_element' => __('Type Element:', 'upfront'),
			'typeface' => __('Typeface:', 'upfront'),
			'weight_style' => __('Weight/Style:', 'upfront'),
			'size' => __('Size:', 'upfront'),
			'line_height' => __('Line Height: ', 'upfront'),
			'rounded_corners' => __('Round Corners', 'upfront'),
			'typography' => __('Typography', 'upfront'),
			'animate_hover_changes' => __('Animate State Changes', 'upfront'),
			'sec' => __('sec', 'upfront'),
			'ease' => __('ease', 'upfront'),
			'linear' => __('linear', 'upfront'),
			'ease_in' => __('ease-in', 'upfront'),
			'ease_out' => __('ease-out', 'upfront'),
			'ease_in_out' => __('ease-in-out', 'upfront'),
			'edit_preset_css' => __('Edit Preset CSS', 'upfront'),
			'edit_preset_label' => __('Custom CSS', 'upfront'),
			'convert_style_to_preset' => __('Convert Style to Preset', 'upfront'),
			'convert_preset_info' => __('In order to edit the Appearance of this Element, you need to convert it to a <strong>Preset</strong>. Presets allow you to save and re-use styling across any element.', 'upfront'),
			'select_preset_info' => __('Alternatively, pick from one of the existing presets below:', 'upfront'),
			'preset_changed' => __('Preset changed to %s', 'upfront'),
			'preset_already_exist' => __('Preset %s already exist, use another name!', 'upfront'),
			'preset_created' => __('Preset %s created succesfully!', 'upfront'),
			'preset_reset' => __('Preset %s was reset!', 'upfront'),
			'default_overlay_title' => __('Editing Default Preset', 'upfront'),
			'default_overlay_text' => __('<p>Please beware, this element is using <strong>Default Preset</strong>, Modifying Presets will affect every layout where that Preset is used.</p><p>To modify just this instance of Element, please create a New Preset.</p>', 'upfront'),
			'default_overlay_button' => __('Edit Default Preset', 'upfront')
		);
		return !empty($key)
			? (!empty($l10n[$key]) ? $l10n[$key] : $key)
			: $l10n
		;
	}
}
