<?php

class Upfront_Theme {

	protected static $instance;
	protected $supported_regions = array();
	protected $regions = array();
	protected $template_dir = 'templates';
	protected $layout_dir = 'templates';
	protected $region_default_args = array(
		'name' => "",
		'title' => "",
		'properties' => array(),
		'modules' => array(),
		'wrappers' => array(),
		'scope' => "local", // scope of region, accept local or global
		'container' => "",
		'default' => false, // default region can't deleted by user, accept true or false
		'position' => 10,
		'allow_sidebar' => true, // allow sidebar region? accept true or false
		'type' => 'wide', // type of region, accept full|wide|clip (either full screen | 100% wide | clipped)
	);

	public static function get_instance () {
		if ( ! is_a(self::$instance, __CLASS__) )
			self::$instance = new self;
		return self::$instance;
	}

	public function __construct () {

	}

	// @TODO deprecate this
	public function add_region_support ($region, $args = array()) {
		$this->supported_regions[$region] = $args;
	}
	// @TODO deprecate this
	public function has_region_support ($region) {
		if ( array_key_exists($region, $this->supported_regions) ) {
			if ( !empty($this->supported_regions[$region]) )
				return $this->supported_regions[$region];
			return true;
		}
		return false;
	}

	public function set_region_default_args ($args) {
		$this->region_default_args = wp_parse_args($args, $this->region_default_args);
		return true;
	}

	public function get_region_default_args () {
		return $this->region_default_args;
	}

	public function add_region ($args) {
		$args = wp_parse_args($args, $this->region_default_args);
		if ( ! empty($args['name']) && ! $this->has_region($args['name']) )
			$this->regions[] = $args;
	}

	public function add_regions ($regions) {
		foreach ( $regions as $region )
			$this->add_region($region);
	}

	public function get_regions () {
		// Required main region
		if ( !$this->has_region('main') )
			$this->add_region(array(
				'name' => "main",
				'title' => __("Main Area"),
				'scope' => "local",
				'container' => "main",
				'default' => true,
				'position' => 10
			));
		usort($this->regions, array(self, "_sort_region"));
		return $this->regions;
	}

	public function get_default_layout($cascade, $layout_slug = "", $add_global_regions = false) {
		$regions = new Upfront_Layout_Maker();

		$template_path = $this->find_default_layout($cascade, $layout_slug);
		$current_theme = Upfront_ChildTheme::get_instance();

		if ($add_global_regions && $current_theme && $current_theme->has_global_region('header')) {
			include(get_stylesheet_directory() . DIRECTORY_SEPARATOR . 'global-regions' . DIRECTORY_SEPARATOR . 'header.php');
		}

		require $template_path;

		if ($add_global_regions && $current_theme && $current_theme->has_global_region('footer')) {
			include(get_stylesheet_directory() . DIRECTORY_SEPARATOR . 'global-regions' . DIRECTORY_SEPARATOR . 'footer.php');
		}

		$layout = $regions->create_layout();

		return $layout;
	}

	protected function find_default_layout($cascade, $layout_slug = "") {
		$filenames = array();
		$order = array('theme_defined', 'specificity', 'item', 'type');
		foreach($order as $o){
			if(isset($cascade[$o])){
				if (!empty($layout_slug))
					$filenames[] =  'layouts/' . $cascade[$o] . '-' . $layout_slug . '.php';
				$filenames[] =  'layouts/' . $cascade[$o] . '.php';
			}
		}
		if (!empty($layout_slug)) {
			$filenames[] = 'layouts/index-' . $layout_slug . '.php';
			$filenames[] = 'layouts/' . $layout_slug . '.php'; // Allowing the layout slug to be used directly
		}
		$filenames[] = 'layouts/index.php';

		return function_exists('upfront_locate_template')
			? upfront_locate_template($filenames)
			: locate_template($filenames)
		;
	}

	public function has_region ($name) {
		foreach ( $this->regions as $region ){
			if ( $region['name'] == $name )
				return true;
		}
		return false;
	}

	public static function _sort_region ($a, $b) {
		return ( $a['position'] > $b['position'] ) ? 1 : ( $a['position'] == $b['position'] ? 0 : -1 );
	}

	public function set_template_dir ($dir) {
		$this->template_dir = $dir;
	}

	public function get_template($slugs, $args = array(), $default_file = '') {
		$template_file = $this->get_template_path($slugs, $default_file);

		extract($args);
		ob_start();
		include $template_file;
		return ob_get_clean();
	}

	public function get_template_uri($slugs, $default, $url = false){
		$template_files = array();
		foreach ( (array)$slugs as $file ) {
			$template_files[] = array('stylesheet', get_stylesheet_directory(), $this->template_dir . '/' . $file . '.php');
			$template_files[] = array('stylesheet', get_stylesheet_directory(), $this->template_dir . '/' . $file . '.html');
			$template_files[] = array('template', get_template_directory(), $this->template_dir . '/' . $file . '.php');
			$template_files[] = array('template', get_template_directory(), $this->template_dir . '/' . $file . '.html');
			if (defined('UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF') && UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF) {
				$template_files[] = array('upfront_parent', UPFRONT_GRANDCHILD_THEME_PARENT_PATH, $this->template_dir . '/' . $file . '.php');
				$template_files[] = array('upfront_parent', UPFRONT_GRANDCHILD_THEME_PARENT_PATH, $this->template_dir . '/' . $file . '.html');
			}
		}
		foreach ( $template_files as $template ) {
			if ( file_exists($template[1] . '/' .  $template[2]) ){
				if($url){
					if ($template[0] == 'stylesheet') return get_stylesheet_directory_uri() . '/' . $template[2];
					else if ('upfront_parent' == $template[0]) return UPFRONT_GRANDCHILD_THEME_PARENT_URL . '/' . $template[2];
					return get_template_directory_uri() . '/' . $template[2] ;
				}
				return $template[1] . '/' .  $template[2];
			}
		}
		return $default;
	}

	public function get_template_path($slugs, $default){
		$template_files = array();
		foreach ( (array)$slugs as $file ) {
			$template_files[] = get_stylesheet_directory() . '/' . $this->template_dir . '/' . $file . '.php';
			$template_files[] = get_stylesheet_directory() . '/' . $this->template_dir . '/' . $file . '.html';
			$template_files[] = get_template_directory() . '/' . $this->template_dir . '/' . $file . '.php';
			$template_files[] = get_template_directory() . '/' . $this->template_dir . '/' . $file . '.html';
			if (defined('UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF') && UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF) {
				$template_files[] = UPFRONT_GRANDCHILD_THEME_PARENT_PATH . '/' . $this->template_dir . '/' . $file . '.php';
				$template_files[] = UPFRONT_GRANDCHILD_THEME_PARENT_PATH . '/' . $this->template_dir . '/' . $file . '.html';
			}
		}
		foreach ( $template_files as $template_file ) {
			if ( file_exists($template_file) )
				return $template_file;
		}
		return $default;
	}
}

class Upfront_Virtual_Region {

	protected $data = array();
	protected $wrappers = array();
	protected $modules = array();
	protected $current_wrapper;
	protected $current_wrapper_col = array();
	protected $current_group_wrapper;
	protected $current_group_wrapper_col = array();
	protected $current_module;
	protected $current_group;
	protected $current_group_col = array();
	protected $grid;
	public $side_regions = array();

	public $errors = array();

	public function __construct ($args, $properties = array()) {
		$this->data = array_merge(
			array(
				'properties' => array(),
				'modules' => array(),
				'wrappers' => array(),
				'name' => '',
				'title' => '',
				'scope' => 'local',
				'container' => '',
				'default' => false,
				'position' => 11,
				'allow_sidebar' => true,
				'type' => 'wide'
			), $args);

		foreach ( $properties as $prop => $value ){
			$this->set_property($prop, $value);
		}
		$this->grid = Upfront_Grid::get_grid();
	}

	public function get_data () {
		foreach ( $this->modules as $id => $module ){
			if ( isset($module['modules']) ){
				$this->modules[$id]['modules'] = array_values($module['modules']);
				$this->modules[$id]['wrappers'] = array_values($module['wrappers']);
			}
		}
		return array_merge(
			$this->data,
			array(
				'wrappers' => array_values($this->wrappers),
				'modules' => array_values($this->modules)
			)
		);
	}

	public function set_property ($property, $value) {
		$arr = array( 'name' => $property, 'value' => $value );
		$this->_set_property($property, $value, $this->data);
	}

	protected function _set_property ($property, $value, &$data) {
		$arr = array( 'name' => $property, 'value' => $value );
		$found = false;
		foreach ( $data['properties'] as $i => $prop ){
			if ( $prop['name'] == $property ){
				$data['properties'][$i] = $arr;
				$found = true;
				break;
			}
		}
		if ( ! $found )
			$data['properties'][] = $arr;
	}

	public function get_property ($property, $data = null) {
		return upfront_get_property_value($property, (is_null($data) ? $this->data : $data));
	}

	public function start_wrapper ($wrapper_id = false, $newline = true, $group = '') {
		$wrapper_id = $wrapper_id ? $wrapper_id : upfront_get_unique_id('wrapper');
		$wrapper_data = array('name' => '', 'properties' => array());
		if ( $newline )
			$this->_set_property('class', 'clr', $wrapper_data);
		$this->_set_property('wrapper_id', $wrapper_id, $wrapper_data);
		if ( $group && $this->modules[$group] ){
			$this->modules[$group]['wrappers'][$wrapper_id] = $wrapper_data;
			$this->current_group_wrapper = $wrapper_id;
		}
		else {
			$this->wrappers[$wrapper_id] = $wrapper_data;
			$this->current_wrapper = $wrapper_id;
		}
		$breakpoints = $this->grid->get_breakpoints(true);
		foreach ( $breakpoints as $breakpoint ){
			if ( $group && $this->modules[$group] )
				$this->current_group_wrapper_col[$breakpoint->get_id()] = 0;
			else
				$this->current_wrapper_col[$breakpoint->get_id()] = 0;
		}
	}

	public function end_wrapper ($group = '') {
		$breakpoints = $this->grid->get_breakpoints(true);
		$breakpoint_data = array();
		foreach ( $breakpoints as $breakpoint ){
			if ( $group && $this->modules[$group] ){
				$wrapper_col = $this->current_group_wrapper_col[$breakpoint->get_id()];
				$group_col = $this->current_group_col[$breakpoint->get_id()];
				$col = $group_col > $wrapper_col ? $wrapper_col : $group_col;
				if ( $breakpoint->is_default() ) {
					$default_wrapper_class = $breakpoint->get_prefix('width') . $col;
				}
				else {
					$breakpoint_data[$breakpoint->get_id()] = array();
					$breakpoint_data[$breakpoint->get_id()]['col'] = $col;
				}
			}
			else {
				$wrapper_col = $this->current_wrapper_col[$breakpoint->get_id()];
				if ( $breakpoint->is_default() ) {
					$default_wrapper_class = $breakpoint->get_prefix('width') . $wrapper_col;
				}
				else {
					$breakpoint_data[$breakpoint->get_id()] = array();
					$breakpoint_data[$breakpoint->get_id()]['col'] = $wrapper_col;
				}
			}

		}
		if ( $group && $this->modules[$group] ){
			$class = $this->get_property('class', $this->modules[$group]['wrappers'][$this->current_group_wrapper]);
			$this->_set_property('class', $class . ' ' . $default_wrapper_class, $this->modules[$group]['wrappers'][$this->current_group_wrapper]);
			$this->_set_property('breakpoint', $breakpoint_data, $this->modules[$group]['wrappers'][$this->current_group_wrapper]);
			$this->current_group_wrapper = null;
		}
		else {
			$class = $this->get_property('class', $this->wrappers[$this->current_wrapper]);
			$this->_set_property('class', $class . ' ' . $default_wrapper_class, $this->wrappers[$this->current_wrapper]);
			$this->_set_property('breakpoint', $breakpoint_data, $this->wrappers[$this->current_wrapper]);
			$this->current_wrapper = null;
		}
	}

	public function start_module ($position = array(), $properties = array(), $other_data = array(), $group = '') {
		$module_id = !empty($properties['element_id']) ? $properties['element_id'] : upfront_get_unique_id('module');
		$module_data = array_merge(array('name' => '', 'properties' => array(), 'objects' => array()), $other_data);
		$pos_class = '';
		$breakpoints = $this->grid->get_breakpoints(true);
		foreach ( $breakpoints as $breakpoint ){
			$total_col = 0;
			if ( !$breakpoint->is_default() ) {
				$data = is_array($properties['breakpoint'][$breakpoint->get_id()]) ? $properties['breakpoint'][$breakpoint->get_id()] : array();
				if ( isset($data['col']) )
					$position['width'] = $data['col'];
				if ( isset($data['left']) )
					$position['margin-left'] = $data['left'];
			}
			$position = array_merge(array(
				'width' => 1,
				'margin-left' => 0,
				'margin-right' => 0,
				'margin-top' => 0,
				'margin-bottom' => 0
			), $position);
			foreach ( $position as $pfx => $value ) {
				if ( $breakpoint->is_default() )
					$pos_class .= $breakpoint->get_prefix($pfx) . $value . ' ';
				if ( in_array($pfx, array('width', 'margin-left', 'margin-right')) )
					$total_col += $value;
			}
			if ( $group && $this->modules[$group] ){
				$wrapper_col = $this->current_group_wrapper_col[$breakpoint->get_id()];
				$this->current_group_wrapper_col[$breakpoint->get_id()] = ( $total_col > $wrapper_col ) ? $total_col : $wrapper_col;
			}
			else {
				$wrapper_col = $this->current_wrapper_col[$breakpoint->get_id()];
				$this->current_wrapper_col[$breakpoint->get_id()] = ( $total_col > $wrapper_col ) ? $total_col : $wrapper_col;
			}
		}
		$properties['class'] = rtrim($pos_class) . ( isset($properties['class']) ? ' ' . $properties['class'] : '' );
		foreach ( $properties as $prop => $value ) {
			$this->_set_property($prop, $value, $module_data);
		}
		$this->_set_property('element_id', $module_id, $module_data);
		if ( $group && $this->modules[$group] ){
			$this->_set_property('wrapper_id', $this->current_group_wrapper, $module_data);
			$this->modules[$group]['modules'][$module_id] = $module_data;
		}
		else {
			$this->_set_property('wrapper_id', $this->current_wrapper, $module_data);
			$this->modules[$module_id] = $module_data;
		}
		$this->current_module = $module_id;
	}

	public function end_module () {
		$this->current_module = null;
	}

	public function start_module_group($position = array(), $properties = array(), $other_data = array()){
		$group_id = !empty($properties['element_id']) ? $properties['element_id'] : upfront_get_unique_id('group');
		$group_data = array_merge(array('name' => '', 'properties' => array(), 'modules' => array(), 'wrappers' => array()), $other_data);
		$pos_class = '';
		$breakpoints = $this->grid->get_breakpoints(true);
		$this->current_group_col = array();
		foreach ( $breakpoints as $breakpoint ) {
			$total_col = 0;
			if ( !$breakpoint->is_default() ) {
				$data = is_array($properties['breakpoint'][$breakpoint->get_id()]) ? $properties['breakpoint'][$breakpoint->get_id()] : array();
				if ( isset($data['col']) )
					$position['width'] = $data['col'];
				if ( isset($data['left']) )
					$position['margin-left'] = $data['left'];
			}
			$position = array_merge(array(
				'width' => 1,
				'margin-left' => 0,
				'margin-right' => 0,
				'margin-top' => 0,
				'margin-bottom' => 0
			), $position);
			foreach ( $position as $pfx => $value ) {
				if ( $breakpoint->is_default() )
					$pos_class .= $breakpoint->get_prefix($pfx) . $value . ' ';
				if ( in_array($pfx, array('width', 'margin-left', 'margin-right')) )
					$total_col += $value;
			}
			$wrapper_col = $this->current_wrapper_col[$breakpoint->get_id()];
			$this->current_wrapper_col[$breakpoint->get_id()] = ( $total_col > $wrapper_col ) ? $total_col : $wrapper_col;
			$this->current_group_col[$breakpoint->get_id()] = $position['width'];
		}
		$properties['class'] = rtrim($pos_class) . ( isset($properties['class']) ? ' ' . $properties['class'] : '' );
		foreach ( $properties as $prop => $value ) {
			$this->_set_property($prop, $value, $group_data);
		}
		$this->_set_property('element_id', $group_id, $group_data);
		$this->_set_property('wrapper_id', $this->current_wrapper, $group_data);
		$this->modules[$group_id] = $group_data;
		$this->current_group = $group_id;
	}

	public function end_module_group() {
		$this->current_group = null;
	}

	public function add_object ($id = 'object', $properties = array(), $other_data = array(), $group = '') {
		$object_id = !empty($properties['element_id']) ? $properties['element_id'] : upfront_get_unique_id($id);
		$object_data = array_merge(array('name' => '', 'properties' => array()), $other_data);
		$breakpoint = $this->grid->get_default_breakpoint();
		$col_class = $breakpoint->get_prefix('width') . $breakpoint->get_columns();
		$temp_class = isset($properties['class']) ? $properties['class'] : '';
		$properties['class'] = strpos($temp_class, rtrim($col_class)) === false ?
		 	rtrim($col_class) . ' ' . $temp_class : $temp_class;
		foreach ( $properties as $prop => $value ) {
			$this->_set_property($prop, $value, $object_data);
		}
		$this->_set_property('element_id', $object_id, $object_data);
		if ( $group && $this->modules[$group] )
			$this->modules[$group]['modules'][$this->current_module]['objects'][] = $object_data;
		else
			$this->modules[$this->current_module]['objects'][] = $object_data;
	}

	/**
	 * Shorthand to add a complete element to the region.
	 *
	 * @param String $type The type of the element to add.
	 * @param array $options Options to add the element, they are
	 *           id: 			'An id to generate wrapper, module and object ids',
	 *           columns: 		(22) 'Number of columns for the element width',
	 *           rows: 			(5) 'Number of rows for th element height',
	 *           margin_left: 	(0) 'Number of columns for the left margin',
	 *           margin_top: 	(0) 'Number of rows for the top margin',
	 *           new_line: 		(true) 'Whether to add the element to a new line or continue a previous line',
	 *           close_wrapper: (true) 'Close the wrapper or leave it open for the next element',
	 * 			 group:			'The group id',
	 *           options: 		Array with the object options.
	 */
	public function add_element($type = false, $options = array()){

		if(!$type){
			echo 'Bad configuration';
			return;
		}
		$options['type'] = $type;

		if(!isset($options['close_wrapper']))
			$options['close_wrapper'] = true;

		if(!isset($options['group']))
			$options['group'] = $this->current_group ? $this->current_group : '';
		else if (!$this->modules[$options['group']])
			$options['group'] = '';

		$opts = $this->parse_options($options);

		if(!is_array($opts)){
			echo $opts;
			return;
		}

		if((!$this->current_wrapper && !$options['group']) || (!$this->current_group_wrapper && $options['group']))
			$this->start_wrapper($opts['wrapper_id'], $opts['new_line'], $options['group']);

		$this->start_module($opts['position'], $opts['module'], array(), $options['group']);
		$this->add_object($opts['object_id'], $opts['object'], array(), $options['group']);
		$this->end_module();

		if($options['close_wrapper'])
			$this->end_wrapper($options['group']);
	}

	public function add_group($options){
		$properties = array();
		if(isset($options['id']) && !empty($options['id']))
			$properties['element_id'] = $options['id'];
		if(isset($options['breakpoint']) && !empty($options['breakpoint']))
			$properties['breakpoint'] = $options['breakpoint'];
		if(!isset($options['close_wrapper']))
			$options['close_wrapper'] = true;
		if(!isset($options['new_line']))
			$options['new_line'] = false;
		if(!isset($options['wrapper_id']))
			$options['wrapper_id'] = false;
		$pos = array_merge(array(
			'columns' => 24,
			'margin_left' => 0,
			'margin_top' => 0
		), $options);
		$position = array(
			'width' => $pos['columns'],
			'margin-left' => $pos['margin_left'],
			'margin-top' => $pos['margin_top']
		);
		if(!$this->current_wrapper)
			$this->start_wrapper($options['wrapper_id'], $options['new_line']);

		$this->start_module_group($position, $properties);
		$group_id = $this->current_group;
		$this->end_module_group();

		if($options['close_wrapper'])
			$this->end_wrapper();
		return $group_id;
	}

	public function add_side_region(Upfront_Virtual_Region $r, $sub = 'left') {
		$r->container = $this;
		$sub = is_string($sub) && preg_match('/^(left|top|bottom|right|fixed|lightbox)$/', $sub) ? $sub : 'left';
		$r->data['sub'] = $sub;
		$r->data['container'] = $this->data['name'];
		$r->data['position'] = $sub == 'left' ? -1 : ( $sub == 'top' ? -2 : ( $sub == 'right' ? 1 : 2 ) );
		$this->side_regions[] = $r;
	}

	private function parse_options($options){
		$type = $options['type'];

		$view_class = 'Upfront_' . $type . 'View';
		$object_defaults = array();

		if($type == 'PlainTxt')
			$object_defaults = array('view_class' => 'PlainTxtView', 'id_slug' => 'plaintxt');
		else if(class_exists($view_class))
			$object_defaults =  call_user_func($view_class . '::default_properties');
		else
			return 'Unknown element type: ' . $type;

		$slug = isset($options['id']) ? $options['id'] : (isset($object_defaults['id_slug']) ? $object_defaults['id_slug'] : '');

		$opts = array(
			'wrapper_id' => isset($options['wrapper_id']) ? $options['wrapper_id'] : $slug . '-wrapper',
			'new_line' => isset($options['new_line']) ? $options['new_line'] : false
		);

		$position = array(
			'columns' => 24,
			'margin_top' => 0,
			'margin_left' => 0
		);
		$position = array_merge($position, $options);
		$opts['position'] = array(
			'width' => $position['columns'],
			'margin-top' => $position['margin_top'],
			'margin-left' => $position['margin_left']
		);


		$module = array(
			'rows' => 6,
			'module_class' => $slug,
			'module_id' => $slug,
			'sticky' => false
		);
		$module = array_merge($module, $options);
		$opts['module'] = array(
			'row' => $module['rows'],
			'class' => $module['module_class'],
			'element_id' => $module['module_id'],
			'sticky' => $module['sticky']
		);
		$breakpoint = !empty($options['breakpoint']) ? $options['breakpoint'] : false;
		if (!empty($breakpoint)) $opts['module']['breakpoint'] = $breakpoint;

		$opts['object_id'] = isset($options['object_id']) ? $options['object_id'] : $slug . '-object';

		if(!isset($options['options']))
			$options['options'] = array();

		$opts['object'] = array_merge($object_defaults, $options['options']);
		if(!isset($opts['object']['element_id']))
			$opts['object']['element_id'] = $opts['object_id'];

		return $opts;
	}
}

class Upfront_Layout_Maker {
	var $regions = array();

	function add(Upfront_Virtual_Region $r){
		$this->regions[] = $r;
	}

	function create_layout(){
		$post_main = false;
		// Track added regions cause lightboxes might be included multiple times
		$added_regions = array();
		foreach($this->regions as $r){
			$region = $r->get_data();

			if (in_array($region['name'], $added_regions)) continue;
			$added_regions[] = $region['name'];

			if($region['name'] == 'main'){
				$region['position'] = 10;
				$region['default'] = true;
				$region['container'] = 'main';
				$post_main = true;
			}
			else
				$region['position'] = $post_main ? 20 : 1;

			$side_regions_before = array();
			$side_regions_after = array();

			foreach($r->side_regions as $sr){
				$sidedata = $sr->get_data();
				$sidedata['position'] += $region['position'];
				//$regions[] = $sidedata;
				if ( $sidedata['position'] < $region['position'] )
					$side_regions_before[] = $sidedata;
				else
					$side_regions_after[] = $sidedata;
			}
			usort($side_regions_before, array(Upfront_Theme, '_sort_region'));
			usort($side_regions_after, array(Upfront_Theme, '_sort_region'));

			foreach($side_regions_before as $side){
				$regions[] = $side;
			}

			$regions[] = $region;

			foreach($side_regions_after as $side){
				$regions[] = $side;
			}
		}
		return $regions;
	}
}

abstract class Upfront_ChildTheme implements IUpfront_Server {


	private $_version = false;
	private $_required_pages = array();
	protected static $instance;

	public static function get_instance () {
		return self::$instance;
	}

	protected function __construct () {
		$this->version = wp_get_theme()->version;
		$this->themeSettings = new Upfront_Theme_Settings(get_stylesheet_directory() . DIRECTORY_SEPARATOR . 'settings.php');
		self::$instance = $this;
		//add_filter('upfront_create_default_layout', array($this, 'load_page_regions'), 10, 3); // Soooo... this no longer works, yay
		add_filter('upfront_override_layout_data', array($this, 'load_page_regions'), 10, 2); // This goes in instead of the above ^
		add_filter('upfront_get_layout_properties', array($this, 'getLayoutProperties'));
		add_filter('upfront_get_theme_fonts', array($this, 'getThemeFonts'), 10, 2);
		add_filter('upfront_get_theme_colors', array($this, 'getThemeColors'), 10, 2);
		add_filter('upfront_get_button_presets', array($this, 'getButtonPresets'), 10, 2);
		add_filter('upfront_get_theme_styles', array($this, 'getThemeStyles'));
		add_filter('upfront_get_global_regions', array($this, 'getGlobalRegions'));
		add_filter('upfront_get_responsive_settings', array($this, 'getResponsiveSettings'));
		add_filter('upfront_prepare_theme_styles', array($this, 'prepareThemeStyles'));

		add_filter('upfront-storage-key', array($this, 'theme_storage_key'));

		$this->_set_up_required_pages_from_settings();

		$this->checkMenusExist();
		$this->initialize();
	}

	/**
	 * This will check the required pages settings content
	 * and spawn some required pages based on whatever is in there.
	 */
	private function _set_up_required_pages_from_settings () {
		$pages = $this->themeSettings->get('required_pages');
		if (empty($pages)) return false;

		$pages = json_decode($pages, true);
		if (empty($pages)) return false;

		$data = array(
			'post_content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus id risus felis. Proin elit nulla, elementum sit amet diam rutrum, mollis venenatis felis. Nullam dapibus lacus justo, eget ullamcorper justo cursus ac. Aliquam lorem nulla, blandit id erat id, eleifend fermentum lorem. Suspendisse vitae nulla in dolor ultricies commodo eu congue arcu. Pellentesque et tincidunt tellus. Fusce commodo feugiat dictum. In hac habitasse platea dictumst. Morbi dignissim pellentesque ipsum, sed sollicitudin nulla ultricies in. Praesent eu mi sed massa sollicitudin bibendum in nec orci.',
		);

		foreach ($pages as $page) {
			$data['post_title'] = $page['name'];
			$this->add_required_page($page['slug'], $page['layout'], $data, false);
		}
	}

	abstract public function get_prefix ();
	abstract public function initialize ();

	public function theme_storage_key ($key) {
		$theme_key = $this->get_prefix();
		return preg_replace('/' . preg_quote(Upfront_Model::STORAGE_KEY, '/') . '/', $theme_key, $key);
	}

	protected function checkMenusExist() {
		$menus = json_decode($this->themeSettings->get('menus'), true);
		if (empty($menus)) return;

		$existing_menus = $this->getExistingMenus();

		foreach($menus as $menu) {
			if (in_array($menu['slug'], $existing_menus)) continue;

			// Create menu if it does not exists
			$new_menu_id = wp_create_nav_menu($menu['name']);
			wp_update_nav_menu_object($new_menu_id, array('description' => $menu['description']));

			if (empty($menu['items'])) continue;
			$menu_items = array();
			foreach($menu['items'] as $menu_item) {
				$menu_item['url'] = str_replace('%siteurl%', site_url(), $menu_item['url']);
				$menu_items[$menu_item['menu_item_parent']][] = $menu_item;
			}
			foreach($menu_items[0] as $menu_item) {
				$this->up_update_nav_menu_item( $new_menu_id, 0, $menu_item, $menu_items);
			}

			/*
			foreach($menu['items'] as $menu_item) {
				wp_update_nav_menu_item(
					$new_menu_id,
					0,
					array(
						'menu-item-url' => $menu_item['url'],
						'menu-item-title' => $menu_item['title'],
						'menu-item-position' => $menu_item['menu_order'],
						'menu-item-status' => 'publish'
					)
				);
			}*/
		}
	}

	protected function up_update_nav_menu_item($menu_id, $db_id, $args = array(), $menu_items, $parent_id = 0) {

		$id = wp_update_nav_menu_item($menu_id, $db_id, array(
						'menu-item-parent-id' => $parent_id,
						'menu-item-url' => $args['url'],
						'menu-item-title' => $args['title'],
						'menu-item-position' => $args['menu_order'],
						'menu-item-status' => 'publish'
					));
		//add child items

		if(isset($menu_items[$args['db_id']])) {

			foreach($menu_items[$args['db_id']] as $menu_item) {
				$this->up_update_nav_menu_item( $menu_id, 0, $menu_item, $menu_items, $id);
			}
		}
	}

	protected function getExistingMenus() {
		return array_map(array($this, 'extractSlug'), get_terms('nav_menu'));
	}

	protected function extractSlug($menu) {
		return $menu->slug;
	}

	/**
	 * Get theme styles as css output for stylesheet.
	 */
	public function prepareThemeStyles($styles) {
		// If styles are empty than there is no overrides in db, load from theme
		if(empty($styles) === false) return $styles;

		$out = '';
		// See if there are styles in theme files
		$styles_root = get_stylesheet_directory() . DIRECTORY_SEPARATOR . 'element-styles';
		// List subdirectories as element types
		$element_types = is_dir($styles_root)
			? array_diff(scandir($styles_root), array('.', '..'))
			: array()
			;
		foreach($element_types as $type) {
			$style_files = array_diff(scandir($styles_root . DIRECTORY_SEPARATOR . $type), array('.', '..'));
			foreach ($style_files as $style) {
				$style_content = file_get_contents($styles_root . DIRECTORY_SEPARATOR . $type . DIRECTORY_SEPARATOR . $style);
				$out .= $style_content;
			}
		}

		// ALSO!!! Do the theme global styles >.<
		$global_layout_styles = $this->themeSettings->get('layout_style');
		if (!empty($global_layout_styles)) {
			$out .= $global_layout_styles;
		}

		return $out;

	}

	public function getThemeStyles($styles) {
		if (empty($styles) === false) return $styles;

		$theme_styles  = array();
		$styles_root = get_stylesheet_directory() . DIRECTORY_SEPARATOR . 'element-styles';
		if (file_exists($styles_root) === false) return $theme_styles;

		// List subdirectories as element types
		$element_types = array_diff(scandir($styles_root), array('.', '..'));
		foreach($element_types as $type) {
			$theme_styles[$type] = array();
			$styles = array_diff(scandir($styles_root . DIRECTORY_SEPARATOR . $type), array('.', '..'));
			foreach ($styles as $style) {
				$style_content = file_get_contents($styles_root . DIRECTORY_SEPARATOR . $type . DIRECTORY_SEPARATOR . $style);
				$theme_styles[$type][str_replace('.css', '', $style)] = $style_content;
			}
		}
		return $theme_styles;
	}

	public function getGlobalRegions($global_regions)  {
		if (empty($global_regions) === false) return $global_regions;

		$global_regions = $this->themeSettings->get('global_regions');
		if (!empty($global_regions)) {
			return json_decode($global_regions, true);
		}

		return array();
	}

	public function has_global_region($name) {
		$global_regions = $this->themeSettings->get('global_regions');
		if (empty($global_regions)) return false;

		$has_region = false;

		foreach (json_decode($global_regions) as $region) {
			if ($region->name !== $name) continue;
			$has_region = true;
			break;
		}

		return $has_region;
	}


	public function getResponsiveSettings($settings) {
		if (empty($settings) === false) return $settings;

		$properties = $this->themeSettings->get('responsive_settings');
		if (!empty($properties)) {
			$properties = json_decode($properties, true);
		}
		return !empty($properties)
			? $properties
			: array()
		;
	}

	protected function parseElementStyles() {
		$elementTypes = array();
		$styles_root = get_stylesheet_directory() . DIRECTORY_SEPARATOR . 'element-styles';

		if (file_exists($styles_root) === false) return $elementTypes;

		// List subdirectories as element types
		$element_types = array_diff(scandir($styles_root), array('.', '..'));
		foreach($element_types as $type) {
			$elementTypes[$type] = array();
			$styles = array_diff(scandir($styles_root . DIRECTORY_SEPARATOR . $type), array('.', '..'));
			foreach ($styles as $style) {
				$elementTypes[$type][] = str_replace('.css', '', $style);
			}
		}

		return $elementTypes;
	}

	/**
	 * Try to populate element style only if styles are empty. This will
	 * provide that styles loaded from database don't get overwritten.
	 */
	public function getElementStylesList($styles) {
		if (empty($styles) === false) return $styles;
		return $this->parseElementStyles();
	}

	public function getLayoutProperties($properties) {
		if (empty($properties) === false) return $properties;

		if ($this->themeSettings->get('layout_properties')) {
			$properties = json_decode(stripslashes($this->themeSettings->get('layout_properties')), true);
		}
		if ($this->themeSettings->get('typography')) {
			$properties[] = array(
				'name' => 'typography',
				'value' => json_decode(stripslashes($this->themeSettings->get('typography')))
			);
		}
		if ($this->themeSettings->get('layout_style')) {
			$properties[] = array(
				'name' => 'layout_style',
				'value' => $this->themeSettings->get('layout_style'),
			);
		}
		if ($this->themeSettings->get('global_regions')) {
			$properties[] = array(
				'name' => 'global_regions',
				'value' => json_decode($this->themeSettings->get('global_regions'))
			);
		}

		return $properties;
	}

	public function getThemeFonts($theme_fonts, $args) {
		if (empty($theme_fonts) === false) return $theme_fonts;

		$theme_fonts = $this->themeSettings->get('theme_fonts');
		if (isset($args['json']) && $args['json']) return $theme_fonts;

		return is_array( $theme_fonts ) ? $theme_fonts : json_decode($theme_fonts);
	}

	public function getThemeColors($theme_colors, $args) {
		if (empty($theme_colors) === false) return $theme_colors;

		$theme_colors = $this->themeSettings->get('theme_colors');
		if (isset($args['json']) && $args['json']) return $theme_colors;

		return json_decode($theme_colors);
	}
	
	public function getButtonPresets($button_presets, $args) {
		if (empty($button_presets) === false) return $button_presets;

		$button_presets = $this->themeSettings->get('button_presets');
		if (isset($args['json']) && $args['json']) return $button_presets;

		return json_decode($button_presets);
	}

	/**
	 * Resolves the layout cascade to a layout name.
	 * @param array $cascade Upfront layout cascade to resolve
	 * @return string Layout name on successful resolution, empty string otherwise
	 */
	protected function _get_page_default_layout ($cascade) {
		$id = false;
		if (!(defined('DOING_AJAX') && DOING_AJAX)) {
			$id = get_post() // A bug in WP API - get_the_ID() is implemented *quite* poorly
				? get_the_ID()
				: false
			;
		} else if (!empty($cascade['specificity'])) {
			$id = intval(preg_replace('/^.*?(\d+)$/is', '\\1', $cascade['specificity']));
		}
		if($id){
			foreach ($this->get_required_pages() as $page) {
				if ($page->get_id() == $id) return $page->get_layout_name();
			}
		}
		return '';
		/*
		if (!$id) {
			return !empty($cascade['item']) && 'single-404_page' == $cascade['item']
				? 'single-404_page'
				: ''
			;
		}
		if (!empty($cascade['item']) && 'single-page' == $cascade['item']) {
			foreach ($this->get_required_pages() as $page) {
				if ($page->get_id() == $id) return $page->get_layout_name();
			}
		} else if (!empty($cascade['item']) && 'single-post' == $cascade['item']) {
			return 'single-post';
		}
		return '';
		*/
	}

	public function load_page_regions($data, $ids/*, $cascade*/){
		$layoutId = $this->_get_page_default_layout($ids);
		if($layoutId){
			$theme = Upfront_Theme::get_instance();
			$ids['theme_defined'] = $layoutId;
			$data['regions'] = $theme->get_default_layout($ids, $layoutId);
			//$data['regions'] = $theme->get_default_layout(array(), $layoutId);
		}
		//return apply_filters('upfront_augment_theme_layout', $data); // So, this doesn't work anymore either. Yay.
		return $data;
	}

	protected function _import_images ($path) {
		$key = $this->get_prefix() . '-imported_images';
		$imported_attachments = get_option($key);
		if (!empty($imported_attachments)) return $imported_attachments;

		$imported_attachments = array();
		$images = glob(get_stylesheet_directory() . trailingslashit($path) . '*');
		$wp_upload_dir = wp_upload_dir();
		$pfx = !empty($wp_upload_dir['path']) ? trailingslashit($wp_upload_dir['path']) : '';
		if (!function_exists('wp_generate_attachment_metadata')) require_once(ABSPATH . 'wp-admin/includes/image.php');

		foreach ($images as $filepath) {
			$filename =  $this->get_prefix() . '-' . basename($filepath);
			while (file_exists("{$pfx}{$filename}")) {
	            $filename = rand() . $filename;
	        }
	        if (!copy($filepath, "{$pfx}{$filename}")) continue;

			$wp_filetype = wp_check_filetype(basename($filename), null);
	        $attachment = array(
	            'guid' => $wp_upload_dir['url'] . '/' . basename($filename),
	            'post_mime_type' => $wp_filetype['type'],
	            'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
	            'post_content' => '',
	            'post_status' => 'inherit'
	        );
	        $attach_id = wp_insert_attachment($attachment, "{$pfx}{$filename}");
	        $attach_data = wp_generate_attachment_metadata( $attach_id, "{$pfx}{$filename}" );
	        wp_update_attachment_metadata( $attach_id, $attach_data );

	        $imported_attachments[] = $attach_id;
	    }
	    if (!empty($imported_attachments)) {
	    	update_option($key, $imported_attachments);
	    }
	    return $imported_attachments;
	}

	protected function _insert_posts ($limit, $thumbnail_images=array()) {
		$key = $this->get_prefix() . '-posts_created';
		$posts_created = get_option($key, array());
		if (!empty($posts_created)) return $posts_created;

		if (!is_array($thumbnail_images)) $thumbnail_images = array();

		$POSTS_LIMIT = (int)$limit ? (int)$limit : 3;
		$theme_posts = array();
		$lorem_ipsum = array(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus id risus felis. Proin elit nulla, elementum sit amet diam rutrum, mollis venenatis felis. Nullam dapibus lacus justo, eget ullamcorper justo cursus ac. Aliquam lorem nulla, blandit id erat id, eleifend fermentum lorem. Suspendisse vitae nulla in dolor ultricies commodo eu congue arcu. Pellentesque et tincidunt tellus. Fusce commodo feugiat dictum. In hac habitasse platea dictumst. Morbi dignissim pellentesque ipsum, sed sollicitudin nulla ultricies in. Praesent eu mi sed massa sollicitudin bibendum in nec orci.',
			'Morbi ornare consectetur mattis. Integer nibh mi, condimentum sit amet diam vitae, fermentum posuere elit. Ut vel ligula tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc tincidunt rhoncus viverra. Nullam facilisis iaculis nulla. Nam tincidunt adipiscing augue congue molestie. Cras mollis enim ut sagittis congue. Ut sed quam consequat, pellentesque urna sit amet, aliquet elit. Nullam euismod, nisl in sagittis fringilla, metus turpis ornare magna, vel porta sapien tellus at turpis. Nullam quis nisl accumsan, aliquam quam at, pulvinar nunc. Etiam elementum massa id dolor viverra, ut ultrices mi sodales. Donec sollicitudin tempus aliquet. Integer porttitor arcu ac tellus vehicula placerat at quis felis.',
		);
		$lorem_ipsum_title = array(
			'Lorem ipsum',
			'Lorem ipsum dolor',
			'Lorem ipsum dolor sit amet',
		);
		shuffle($lorem_ipsum_title);

		// Do the posts count
		$args = array(
			'post_type' => 'post',
			'post_status' => 'publish',
			'posts_per_page' => $POSTS_LIMIT
		);
		if (!empty($thumbnail_images)) {
			$args['meta_key'] = '_thumbnail_id'; // Limit to ones with featured images only if we have have thumbs to add
		}
		$posts = get_posts();
		$create_posts = $POSTS_LIMIT - count($posts);
		if ($create_posts) {
			for ($i=0; $i < $create_posts; $i++) {
				$post_id = wp_insert_post(array(
					'post_title' => $lorem_ipsum_title[$i],
					'post_status' => 'publish',
					'post_type' => 'post',
					'post_content' => '<p>' . join('</p><p>', $lorem_ipsum) . '</p>',
					'post_excerpt' => join(' ', preg_split("/[\n\r\t ]+/", $lorem_ipsum[0], 36, PREG_SPLIT_NO_EMPTY )),
				));
				if (!empty($thumbnail_images[$i])) set_post_thumbnail($post_id, $thumbnail_images[$i]);
				$theme_posts[] = $post_id;
			}
			update_option($key, $theme_posts);
		}
		return get_option($key, array());
	}

/* --- Public interface --- */

	/**
	 * Gets cached theme version.
	 * @return string theme version
	 */
	public function get_version () {
		return $this->_version;
	}

	/**
	 * Fetches an array of pages required by the theme.
	 * @return array List of required pages.
	 */
	public function get_required_pages () {
		return !empty($this->_required_pages) && is_array($this->_required_pages)
			? $this->_required_pages
			: array()
		;
	}

	/**
	 * Fetch a single required page object.
	 * @param string $key A key under which to look for
	 * @return mixed Upfront_Themes_RequiredPage instance on success, false on failure.
	 */
	public function get_required_page ($key) {
		return !empty($this->_required_pages) && !empty($this->_required_pages[$key])
			? $this->_required_pages[$key]
			: false
		;
	}

	/**
	 * Fetch the ID from a single required page object.
	 * @param string $key A key under which to look for
	 * @return mixed Page ID on success, false on failure.
	 */
	public function get_required_page_id ($key) {
		$page = $this->get_required_page($key);
		return $page
			? $page->get_id()
			: false
		;
	}

	/**
	 * Adds a page and a layout to a list of theme-required pages.
	 * @param string $key The key under which the page will be stored
	 * @param string $layout_name The layout name for the required page
	 * @param array $page_data Page data that'll eventualy be passed to `wp_insert_post`
	 * @param array $wp_template_file Optional WP template to assign to the page
	 */
	public function add_required_page ($key, $layout_name, $page_data, $wp_template_file) {
		$this->_required_pages[$key] = new Upfront_Themes_RequiredPage($this->get_prefix(), $page_data, $layout_name, $wp_template_file);
		return $this->_required_pages[$key]->get_post_id();
	}

	/**
	 * Imports images from the relative path fragment into WP Media.
	 * It only actually happens once, otherwise gets cached IDs.
	 * @param string $path_fragment Relative path fragment that contains the images to be imported.
	 * @return mixed Array of images if successful, false on failure
	 */
	public function add_required_images ($path_fragment) {
		return $this->_import_images($path_fragment);
	}

	/**
	 * Creates the padding posts, with thumbnail images optionally.
	 * Only happens once, otherwise gets cached IDs.
	 * @param int $limit An upper bound of how many posts to create.
	 * @param array $thumbnails Optional array of thumbnail images to assign to posts. Accepts self::add_required_images(...) output
	 * @return array Array of created post IDs (could be empty)
	 */
	public function add_required_posts ($limit, $thumbnails=array()) {
		return $this->_insert_posts($limit, $thumbnails);
	}

	/**
	 * Called from the implementing theme,
	 * this method will actually import the background slider images.
	 */
	protected function _import_slider_image ($filepath) {
        $key = $this->get_prefix() . '-slider-images';
        $images = get_option($key, array());
        if (!empty($images[$filepath])) return $images[$filepath];

        // else import image
        $wp_upload_dir = wp_upload_dir();
        $pfx = !empty($wp_upload_dir['path']) ? trailingslashit($wp_upload_dir['path']) : '';
        if (!function_exists('wp_generate_attachment_metadata')) require_once(ABSPATH . 'wp-admin/includes/image.php');
        $filename = basename($filepath);
        while (file_exists("{$pfx}{$filename}")) {
            $filename = rand() . $filename;
        }
        $full_img_path = get_stylesheet_directory() . DIRECTORY_SEPARATOR . ltrim($filepath, '/');
        @copy($full_img_path, "{$pfx}{$filename}");
        $wp_filetype = wp_check_filetype(basename($filename), null);
        $attachment = array(
            'guid' => $wp_upload_dir['url'] . '/' . basename($filename),
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        $attach_id = wp_insert_attachment($attachment, "{$pfx}{$filename}");
        $attach_data = wp_generate_attachment_metadata( $attach_id, "{$pfx}{$filename}" );
        wp_update_attachment_metadata( $attach_id, $attach_data );

        $images[$filepath] = $attach_id;
        update_option($key, $images);

        return $attach_id;
    }
}


class Upfront_Themes_RequiredPage {

	private $_prefix;
	private $_page_data;
	private $_layout_name;
	private $_wp_template;
	private $_key;
	private $_post_id;

	public function __construct ($prefix, $page_data, $layout_name, $wp_template = false) {
		$this->_prefix = $prefix;
		$this->_page_data = $page_data;
		$this->_layout_name = $layout_name;
		$this->_wp_template = $wp_template;

		$slug = $layout_name;

		$this->_key = "{$this->_prefix}_page_{$slug}";

		if (!$this->exists()) $this->_create_page();
	}

	/**
	 * Is the page already there?
	 * @return mixed Page ID if it does, false otherwise
	 */
	public function exists () {
		if (empty($this->_key)) return false;
		return get_option($this->_key, false);
	}

	/**
	 * Get the page ID, if it exists.
	 * Thin wrapper around self::exists()
	 */
	public function get_id () { return $this->exists(); }

	/**
	 * Get the page layout name.
	 * @return mixed Layout name (string) if page exists and has layout name set, (bool)false otherwise.
	 */
	public function get_layout_name () {
		if (!$this->exists() || empty($this->_layout_name)) return false;
		return $this->_layout_name;
	}

	protected function _create_page () {
		$post_id = wp_insert_post(wp_parse_args($this->_page_data, array(
			'post_status' => 'publish',
			'post_type' => 'page'
		)));
		if (!empty($this->_wp_template)) update_post_meta($post_id, '_wp_page_template', $this->_wp_template);
		update_option($this->_key, $post_id);
		$this->_post_id = $post_id;
	}
	public function get_post_id() {
		if(isset($this->_post_id))
			return $this->_post_id;
		else
			return false;
	}
}


class Upfront_GrandchildTheme_Server implements IUpfront_Server {

	const RELATIONSHIP_FLAG = 'UpfrontParent';

	private function __clone () {}
	private function __construct () {}

	public static function serve () {
		$me = new self;
		$me->_add_hooks();
	}

	private function _add_hooks () {
		add_filter('extra_theme_headers', array($this, 'child_relationship_headers'));
		add_action('after_setup_theme', array($this, 'check_theme_relationship'), 0);
	}

	public function child_relationship_headers ($headers) {
		$headers = is_array($headers) ? $headers : array();
		$headers[] = self::RELATIONSHIP_FLAG;
		return $headers;
	}

	public function check_theme_relationship () {
		if (defined('UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF') && UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF) return false; // Already a grandchild theme!
		$data = wp_get_theme();
		$theme = !empty($data) ? $data->get(self::RELATIONSHIP_FLAG) : false;
		if (empty($theme)) return false;
		define('UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF', $theme);
		$this->_initialize_grandchild_relationship();
	}

	private function _initialize_grandchild_relationship () {
		if (!(defined('UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF') && UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF)) return $template; // Not a grandchild theme!

		define('UPFRONT_GRANDCHILD_THEME_PARENT_PATH', realpath(trailingslashit(dirname(get_stylesheet_directory())) . UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF));
		define('UPFRONT_GRANDCHILD_THEME_PARENT_URL', trailingslashit(dirname(get_stylesheet_directory_uri())) . UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF);

		include UPFRONT_GRANDCHILD_THEME_PARENT_PATH . '/functions.php';

		add_action('wp_enqueue_scripts', array($this, 'enqueue_parent_style'), 1);
	}

	public function enqueue_parent_style () {
		if (!(defined('UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF') && UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF)) return false; // Not a grandchild theme!
		wp_enqueue_style(UPFRONT_GRANDCHILD_THEME_IS_DESCENDANT_OF, UPFRONT_GRANDCHILD_THEME_PARENT_URL . '/style.css', array(), null);
	}

}
Upfront_GrandchildTheme_Server::serve();


/**
 * Keeps theme settings providing simple interface for getting
 * stored settings, updating and saving settings to file.
 */
class Upfront_Theme_Settings
{
	protected $filePath;
	protected $settings = array();

	public function __construct($filePath) {
		$this->filePath = $filePath;

		if (file_exists($this->filePath) === false) return;

		$this->settings = include $this->filePath;

		if ($this->settings === 1) $this->settings = array(); // happens with old format settings

		if (empty($this->settings)) {
			$this->tryOldSettingsFormat();
		}
	}

	public function get($name) {
		return isset($this->settings[$name]) ? stripslashes($this->settings[$name]) : null;
	}

	public function set($name, $value) {
		$this->settings[$name] = addslashes($value);
		$this->save();
	}

	protected function save() {
		$fileContents = "<?php\nreturn array(\n";
		foreach($this->settings as $setting=>$value) {
			$fileContents .= "\t'$setting' => '$value',\n";
		}
		$fileContents .= ");";

		file_put_contents($this->filePath, $fileContents);
	}

	/**
	 * Ensure backward compatibility.
	 */
	protected function tryOldSettingsFormat() {
		include $this->filePath;
		$settings = array('typography', 'layout_style', 'theme_fonts', 'theme_colors', 'layout_properties', 'menus');
		foreach($settings  as $setting) {
			if (isset($$setting)) $this->settings[$setting] = $$setting;
		}
	}
}
