<?php
class Upfront_UmapView extends Upfront_Object{

	public function get_markup(){
		$_id = $this->_get_property('element_id');
		$element_id = $_id ? "id='{$_id}'" : '';
		$raw_properties = !empty($this->_data['properties']) ? $this->_data['properties'] : array();
		$to_map = array('markers', 'map_center', 'zoom', 'style', 'controls', 'styles');

		$properties = array();
		foreach ($raw_properties as $prop) {
			if (in_array($prop['name'], $to_map)) $properties[$prop['name']] = $prop['value'];
		}
		if (!is_array($properties['controls'])) $properties['controls'] = array($properties['controls']);
		$map = 'data-map="' . esc_attr(json_encode($properties)) . '"';

		if (empty($properties)) return ''; // No info for this map, carry on.

		upfront_add_element_script('upfront_maps', array('js/upfront_maps-public.js', dirname(__FILE__)));
		upfront_add_element_style('upfront_maps', array('css/visitor.css', dirname(__FILE__)));

		return "<div class='upfront_map-public' {$element_id} {$map}>This is where the map comes in.</div>";
	}

	public static function add_js_defaults($data){
        $data['umaps'] = array(
            'defaults' => self::default_properties(),
         );
        return $data;
    }

    public static function default_properties(){
        return array(
            'type' => "MapModel",
            'view_class' => "UmapView",
            "class" => "c24 upfront-map_element-object",
            'has_settings' => 1,
            'id_slug' => 'upfront-map_element',

            'controls' => array(),
            'map_center' => array(10.72250, 106.730762),
            'zoom' => 10,
            'style' => 'ROADMAP',
            'styles' => false
        );
    }

}

function upfront_maps_add_context_menu ($paths) {
	$paths['maps_context_menu'] = upfront_relative_element_url('js/ContextMenu', dirname(__FILE__));
	return $paths;
}
add_filter('upfront-settings-requirement_paths', 'upfront_maps_add_context_menu');

function upfront_maps_add_maps_local_url ($data) {
	$data['upfront_maps'] = array(
		"root_url" => trailingslashit(upfront_element_url('/', dirname(__FILE__))),
		"markers" => trailingslashit(upfront_element_url('img/markers/', dirname(__FILE__))),
	);
	return $data;
}
add_filter('upfront_data', 'upfront_maps_add_maps_local_url');
