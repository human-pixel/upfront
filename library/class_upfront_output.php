<?php

class Upfront_Output {

	private $_layout;
	private $_debugger;

	private static $_instance;

	public static $current_object;
	public static $current_module;
	public static $grid;

	public function __construct ($layout, $post) {
		$this->_layout = $layout;
		$this->_debugger = Upfront_Debug::get_debugger();

		self::$grid = Upfront_Grid::get_grid();
	}

	public static function get_post_id () {
		return is_singular() ? get_the_ID() : false;
	}

	public static function get_layout ($layout_ids, $apply = false) {
		$post_id = self::get_post_id();
		$is_dev = Upfront_Debug::get_debugger()->is_dev();
		$load_from_options = true;
		
		if ( $post_id ) {
			
			$template_meta_name = ( $is_dev ) 
				? 'template_dev_post_id'
				: 'template_post_id'
			;
			$template_post_id = get_post_meta($post_id, $template_meta_name, true);
			
		} else {
			// if special archive pages like homepage, use slug to get template post id
			$layout_id = '';
			if ( isset($layout_ids['specificity']) ) {
				$layout_id = $layout_ids['specificity'];
			} else if ( isset($layout_ids['item']) ) {
				$layout_id = $layout_ids['item'];
			}
			$store_key = Upfront_Layout::get_storage_key() . '-' . $layout_id;
			$template_post_id = Upfront_Server_PageTemplate::get_instance()->get_template_id_by_slug($store_key, $is_dev);
		}
		
		if ( $template_post_id ) {
			$page_template = Upfront_Server_PageTemplate::get_instance()->get_template($template_post_id, $is_dev);
			if ( $page_template ) {
				$layout = Upfront_Layout::from_php($page_template, Upfront_Layout::STORAGE_KEY);
				$load_from_options = false;
			}
		}
		
		// load layouts not yet saved on custom post type
		if ( $load_from_options ) {
			$layout = Upfront_Layout::from_entity_ids($layout_ids);
		
			if ($layout->is_empty()) {
				$layout = Upfront_Layout::create_layout($layout_ids);
			}
		}
		
		$post = get_post($post_id);
		self::$_instance = new self($layout, $post);

		// Add actions
		add_action('wp_enqueue_scripts', array(self::$_instance, 'add_styles'));
		add_action('wp_enqueue_scripts', array(self::$_instance, 'add_scripts'), 2);

		// Do the template...
		if ( $apply )
			return self::$_instance->apply_layout();
		return self::$_instance;
	}

	public static function get_layout_data () {
		if ( self::$_instance )
			return self::$_instance->_layout->to_php();
		return false;
	}

	public static function get_layout_object () {
		if ( self::$_instance )
			return self::$_instance->_layout;
		return false;
	}

	public static function get_current_object () {
		if ( self::$current_object )
			return self::$current_object;
		return false;
	}

	public static function get_current_module () {
		if ( self::$current_module )
			return self::$current_module;
		return false;
	}

	public function apply_layout () {
		$layout = $this->_layout->to_php();
		$html = '';
		$html_layout = '';

		if ($this->_debugger->is_active(Upfront_Debug::MARKUP)) {
			$html =  "<!-- Code generated by Upfront core -->\n";
			$name = !empty($layout['name']) ? $layout['name'] : '';
			$html .= "<!-- Layout Name: {$name} -->\n";
		}
		$layout_view = new Upfront_Layout_View($layout);
		$region_markups = array();
		$region_markups_before = array();
		$region_markups_after = array();
		$container_views = array();
        // Construct container views first
        foreach ($layout['regions'] as $region) {
            $container = empty($region['container']) ? $region['name'] : $region['container'];
            if ( $container == $region['name'] ) {
                $container_views[$container] = new Upfront_Region_Container($region);
            }
        }
        // Iterate through regions
		foreach ($layout['regions'] as $region) {
			$region_view = new Upfront_Region($region);
			$region_sub = $region_view->get_sub();
			$markup = $region_view->get_markup();
			$container = $region_view->get_container();
			if ( ! isset($region_markups[$container]) )
				$region_markups[$container] = '';
			if ( ! isset($region_markups_before[$container]) )
				$region_markups_before[$container] = '';
			if ( ! isset($region_markups_after[$container]) )
				$region_markups_after[$container] = '';
			if ( $region_sub == 'top' || $region_sub == 'bottom' ){
			    if ( isset($container_views[$container]) ) {
			        $type = $container_views[$container]->get_entity_type();
			        if ( $type != 'full' )
                        continue; // Don't add top/bottom sub container if it's not full
			    }
				$sub_container = new Upfront_Region_Sub_Container($region);
				$markup = $sub_container->wrap( $markup );
				if ( $region_sub == 'top' )
					$region_markups_before[$container] .= $markup;
				else
					$region_markups_after[$container] .= $markup;
			}
			else if ( $region_sub == 'fixed' ){
				$region_markups_after[$container] .= $markup;
			}
			else if ( $region_sub == 'left' ){
				if( is_rtl() )
					$region_markups[$container] .= $markup;
				else
					$region_markups[$container] =  $markup . $region_markups[$container];
			}
			else{
				if( is_rtl() )
					$region_markups[$container] =  $markup . $region_markups[$container];
				else
					$region_markups[$container] .= $markup;
			}
		}
		foreach ($container_views as $container => $container_view) {
			$type = $container_view->get_entity_type();
			$html_layout .= $container_view->wrap( $region_markups[$container], $region_markups_before[$container], $region_markups_after[$container] );
		}
		$html .= $layout_view->wrap($html_layout);
		if ($this->_debugger->is_active(Upfront_Debug::MARKUP)) {
			$html .= "<!-- Upfront layout end -->\n";
		}

		do_action('upfront-layout-applied', $layout);

		return $html;
	}

	function add_styles () {
		wp_enqueue_style('upfront-main', upfront_ajax_url('upfront_load_styles'), array(), Upfront_ChildTheme::get_version(), 'all');

		$deps = Upfront_CoreDependencies_Registry::get_instance();

		// Load theme fonts
		$theme_fonts = json_decode(get_option('upfront_' . get_stylesheet() . '_theme_fonts'));
		$theme_fonts = apply_filters('upfront_get_theme_fonts', $theme_fonts, array());
		if( $theme_fonts ) {
			foreach($theme_fonts as $theme_font) {
				/*
				wp_enqueue_style(
					strtolower(str_replace(' ', '-', $theme_font->font->family)) . '-' . $theme_font->variant,
					'//fonts.googleapis.com/css?family=' . str_replace(' ', '+', $theme_font->font->family) . ':' . $theme_font->variant,
					array(),
					Upfront_ChildTheme::get_version()
				);
				*/
				$deps->add_font($theme_font->font->family, $theme_font->variant);
			}
		}
		// The dependencies server will manage the fonts.
	}

	function add_scripts () {
		upfront_add_element_script('upfront-layout', array('scripts/layout.js', dirname(__FILE__)));
		upfront_add_element_script('upfront-effect', array('scripts/effect.js', dirname(__FILE__)));
		upfront_add_element_script('upfront-default-map', array('scripts/default-map.js', dirname(__FILE__)));
		upfront_add_element_script('upfront-default-slider', array('scripts/default-slider.js', dirname(__FILE__)));
		upfront_add_element_style('upfront-default-slider', array('styles/default-slider.css', dirname(__FILE__)));

	}
}



require_once('output/class_upfront_entity.php');
require_once('output/class_upfront_container.php');
require_once('output/class_upfront_layout_view.php');
require_once('output/class_upfront_region_container.php');
require_once('output/class_upfront_region_subcontainer.php');
require_once('output/class_upfront_region.php');
require_once('output/class_upfront_wrapper.php');
require_once('output/class_upfront_module_group.php');
require_once('output/class_upfront_module.php');
require_once('output/class_upfront_object_group.php');
require_once('output/class_upfront_object.php');

/*
class Upfront_PlainTxtView extends Upfront_Object {

	public function get_markup () {

		$element_id = $this->_get_property('element_id');
		$element_id = $element_id ? "id='{$element_id}'" : '';

		$content = $this->_get_property('content');

		$matches = array();
		$regex = '/<div class="plaintxt_padding([^>]*)>(.+?)<\/div>/s';
		preg_match($regex, $content, $matches);

		if(sizeof($matches) > 1)
			$content = $matches[2];

		$style = array();
		if($this->_get_property('background_color') && $this->_get_property('background_color')!='')
			$style[] = 'background-color: '.$this->_get_property('background_color');

		if($this->_get_property('border') && $this->_get_property('border')!='')
			$style[] = 'border: '.$this->_get_property('border');

		return "<div {$element_id}>".(sizeof($style)>0 ? "<div class='plaintxt_padding' style='".implode(';', $style)."'>": ''). $content .(sizeof($style)>0 ? "</div>": ''). '</div>';
	}
}



class Upfront_ImageView extends Upfront_Object {

	public function get_markup () {
		$element_id = $this->_get_property('element_id');
		$element_id = $element_id ? "id='{$element_id}'" : '';
		return "<div class='upfront-output-object upfront-output-image' {$element_id}><img src='" . esc_attr($this->_get_property('content')) . "' /></div>";
	}
}
class Upfront_SettingExampleView extends Upfront_Object {

	public function get_markup () {
		$element_id = $this->_get_property('element_id');
		$element_id = $element_id ? "id='{$element_id}'" : '';
		return "<div class='upfront-output-object upfront-settingexample' {$element_id}></div>";
	}
}

class Upfront_TestResizeView extends Upfront_Object {

	public function get_markup () {
		return "";
	}
}
*/