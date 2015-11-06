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

		if (empty($presets)) {
			return '';
		}

		$styles = '';
		foreach ($presets as $preset) {
			if (isset($preset['breakpoint']) && isset($preset['breakpoint']['tablet'])) {
				$preset['tablet'] = [];
				foreach($preset['breakpoint']['tablet'] as $name=>$property) {
					$preset['tablet'][$name] = $property;
				};
			}
			if (isset($preset['breakpoint']) && isset($preset['breakpoint']['mobile'])) {
				$preset['mobile'] = [];
				foreach($preset['breakpoint']['mobile'] as $name=>$property) {
					$preset['mobile'][$name] = $property;
				};
			}

			// Handle specific case for button where button has both preset classes and element class
			if (isset($preset['id']) && isset($preset['preset_style']) && preg_match('#upfront\-button#', $preset['preset_style']) === 1) {
				$preset['preset_style'] = preg_replace('#' . $preset['id'] . ' \.upfront-button#', $preset['id'] . '.upfront-button', $preset['preset_style']);
				$preset['preset_style'] = str_replace('\"', '"', $preset['preset_style']);
				$preset['preset_style'] = str_replace("\'", "'", $preset['preset_style']);
			}

			$args = array('properties' => $preset);
			extract($args);
			ob_start();
			include $this->get_style_template_path();
			$styles .= ob_get_clean();
		}

		return $styles;
	}

	public function get_theme_presets() {

		//Get presets distributed with the theme
		$theme_presets = json_decode(Upfront_ChildTheme::get_settings()->get($this->elementName . '_presets'), true);

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
			return json_encode($presets);
		}

		//Check if preset is distributed with the theme
		foreach($presets as $preset) {
			if(in_array($preset['id'], $theme_presets)) {
				$preset['theme_preset'] = true;
			} else {
				$preset['theme_preset'] = false;
			}
			$updatedPresets[] = $preset;
		}

		$updatedPresets = $this->replace_new_lines($updatedPresets);

		$updatedPresets = json_encode($updatedPresets);

		if(empty($updatedPresets)) $updatedPresets = json_encode(array());

		return $updatedPresets;
	}

	public static function add_l10n_strings ($strings) {
		if (!empty($strings['preset_manager'])) return $strings;
		$strings['preset_manager'] = self::_get_l10n();
		return $strings;
	}

	private static function _get_l10n ($key=false) {
		$l10n = array(
			'select_preset' => __('Select Preset', 'upfront'),
			'select_preset_label' => __('Choose or Create Preset:', 'upfront'),
			'delete_label' => __('Delete', 'upfront'),
			'add_label' => __('Add', 'upfront'),
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
			'edit_preset_label' => __('Custom CSS', 'upfront')
		);
		return !empty($key)
			? (!empty($l10n[$key]) ? $l10n[$key] : $key)
			: $l10n
		;
	}
}
