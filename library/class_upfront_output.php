<?php

class Upfront_Output {

	private $_layout;
	private $_debugger;

	public function __construct ($layout, $post) {
		$this->_layout = $layout;
		$this->_debugger = Upfront_Debug::get_debugger();
	}

	public static function get_layout ($post_id) {
		// ... some magic to map $post_id to $layout_id...
		// ...
		$layout_id = Upfront_Layout::STORAGE_KEY . '-layout-1'; // @TODO: destubify
		$layout = Upfront_Layout::from_id($layout_id);

if ($layout->is_empty()) {
	$layout = Upfront_Layout::create_layout();
}

		$post = get_post($post_id);
		$me = new self($layout, $post);

		// Add actions
		add_action('wp_footer', array($me, 'add_styles'));

		// Do the template...
		return $me->apply_layout();
	}

	public function apply_layout () {
		$layout = $this->_layout->to_php();

		if ($this->_debugger->is_active(Upfront_Debug::MARKUP)) {
			$html =  "<!-- Code generated by Upfront core -->\n";
			$html .= "<!-- Layout Name: {$layout['name']} -->\n";
		}
		foreach ($layout['regions'] as $region) {
			$region_view = new Upfront_Region($region);
			$html .= $region_view->get_markup();
		}
		if ($this->_debugger->is_active(Upfront_Debug::MARKUP)) {
			$html .= "<!-- Upfront layout end -->\n";
		}
		return $html;
	}

	function add_styles () {
		wp_enqueue_style('upfront-main', admin_url('admin-ajax.php?action=upfront_load_styles'), array(), 0.1, 'all');
	}
}



abstract class Upfront_Entity {

	protected $_data;
	protected $_tag = 'div';
	protected $_debugger;

	public function __construct ($data) {
		$this->_data = $data;
		$this->_debugger = Upfront_Debug::get_debugger();
	}

	abstract public function get_markup ();


	public function get_style_for ($breakpoint, $context) {

		return '';

		$post = $pre = '';
		$post = $this->_debugger->is_active(Upfront_Debug::STYLE)
			? "/* General styles for {$this->get_name()} */"
			: ""
		;
		return trim("{$pre} .{$context} .{$this->get_css_class()} {" .
			'width: 100%;' .
		"} {$post}") . "\n";
	}

	public function get_front_context () {
		return 'default';
	}

	public function get_css_class () {
		return join(' ', array(
			"upfront-output-" . strtolower($this->_type),
			$this->get_front_context(),
		));
	}

	protected function _get_property ($prop) {
		return upfront_get_property_value($prop, $this->_data);
	}

	public function get_name () {
		if (!empty($this->_data['name'])) return $this->_data['name'];
		return 'anonymous';
	}
}


abstract class Upfront_Container extends Upfront_Entity {
	
	protected $_type;
	protected $_children;
	protected $_child_view_class;

	public function get_markup () {
		if (!empty($this->_data[$this->_children])) foreach ($this->_data[$this->_children] as $idx => $child) {
			$child_view = $this->instantiate_child($child, $idx);
			$html .= $child_view->get_markup();
		}
		return $this->wrap($html);
	}

	// Overriden from Upfront_Entity
	public function get_style_for ($breakpoint, $context) {
		$style = parent::get_style_for($breakpoint, $context);
		if (!empty($this->_data[$this->_children])) foreach ($this->_data[$this->_children] as $idx => $child) {
			$child_view = $this->instantiate_child($child, $idx);
			$style .= $child_view->get_style_for($breakpoint, $context);
		}
		return $style;
	}

	public function instantiate_child ($child_data, $idx) {
		$view_class = upfront_get_property_value("view_class", $child_data);
		$view = $view_class
			? "Upfront_{$view_class}"
			: $this->_child_view_class
		;
		if (!class_exists($view)) $view = $this->_child_view_class;
		return new $view($child_data);
	}

	public function wrap ($out) {
		$class = $this->get_css_class();
		$element_id = $this->_get_property('element_id');
		
		if ($this->_debugger->is_active(Upfront_Debug::MARKUP)) {
			$name = $this->get_name();
			$pre = "\n\t<!-- Upfront {$this->_type} [{$name} - #{$element_id}] -->\n";
			$post = "\n<!-- End {$this->_type} [{$name} - #{$element_id}] --> \n";
		}
		
		$element_id = $element_id ? "id='{$element_id}'" : '';
		return "{$pre}<{$this->_tag} class='{$class}' {$element_id}>{$out}</{$this->_tag}>{$post}";
	}
}


class Upfront_Region extends Upfront_Container {
	protected $_type = 'Region';
	protected $_children = 'modules';
	protected $_child_view_class = 'Upfront_Module';
}
class Upfront_Module extends Upfront_Container {
	protected $_type = 'Module';
	protected $_children = 'objects';
	protected $_child_view_class = 'Upfront_Object';
}
class Upfront_Object extends Upfront_Entity {
	protected $_type = 'Object';

	public function get_markup () {
		$view_class = 'Upfront_' . $this->_get_property("view_class");
		$view = new $view_class($this->_data);

		if ($this->_debugger->is_active(Upfront_Debug::MARKUP)) {
			$name = $view->get_name();
			$pre = "\n\t<!-- Upfront {$view_class} [{$name}] -->\n";
			$post = "\n<!-- End {$view_class} [{$name}] --> \n";
		}

		return $pre . $view->get_markup() . $post;
	}
}

class Upfront_PlainTxtView extends Upfront_Object {

	public function get_markup () {
		$element_id = $this->_get_property('element_id');
		$element_id = $element_id ? "id='{$element_id}'" : '';
		return "<div class='upfront-output-object upfront-output-plain_txt' {$element_id}><pre>" . $this->_get_property('content') . '</pre></div>';
	}
}

class Upfront_ImageView extends Upfront_Object {

	public function get_markup () {
		$element_id = $this->_get_property('element_id');
		$element_id = $element_id ? "id='{$element_id}'" : '';
		return "<div class='upfront-output-object upfront-output-image' {$element_id}><img src='" . esc_attr($this->_get_property('content')) . "' /></div>";
	}
}