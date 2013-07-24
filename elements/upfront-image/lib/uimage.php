<?php
/**
 * Image element for Upfront
 */
class Upfront_UimageView extends Upfront_Object {
	public function get_markup () {
		$data = $this->properties_to_array();
		
		$url = false;
		if($data['when_clicked'] == 'open_link')
			$url = $data['image_link'];
		else if($data['when_clicked'] == 'show_larger_image')
			$url = $data['srcFull'];
		$data['url'] = $url;

		$data['background'] = $this->hex_to_rgba($data['background'], $data['background_transparency']);

		return $this->get_template_content($data);
	}

	private function get_template_content($data){
		extract($data);
		ob_start();
		include dirname(dirname(__FILE__)) . '/tpl/image.html';
		$output = ob_get_contents();
		ob_end_clean();
		return $output;
	}

	private function hex_to_rgba($hex, $transparency){
		if(!$transparency)
			return $hex;
		$opacity = (100 - $transparency) / 100;
		$r = hexdec(substr($hex, 1,2));
		$g = hexdec(substr($hex, 3,2));
		$b = hexdec(substr($hex, 5,2));
		return 'rgba(' . $r . ', ' . $g . ', ' . $b . ', ' . $opacity . ')';
	}

	private function properties_to_array(){
		$out = array();
		foreach($this->_data['properties'] as $prop)
			$out[$prop['name']] = $prop['value'];
		return $out;
	}

	public static function set_jquery_form () {
		wp_deregister_script('jquery-form');
		wp_register_script('jquery-form', upfront_element_url('js/jquery.form.min.js', dirname(__FILE__)), array('jquery'), '3.36.0');

	}

	public static function add_styles_scripts () {
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_style('uimage-style', upfront_element_url('css/uimage.css', dirname(__FILE__)));
		wp_enqueue_script('jquery-form');
		wp_enqueue_script('wp-color-picker');
	}
}

class Upfront_Uimage_Server extends Upfront_Server {
	public static function serve () {
		$me = new self;
		$me->_add_hooks();
	}
	private function _add_hooks() {
		add_action('wp_ajax_upfront-media-image_sizes', array($this, "get_image_sizes"));
	}

	function get_image_sizes() {
        $data = stripslashes_deep($_POST);
        
        $item_id = !empty($data['item_id']) ? $data['item_id'] : false;
        if (!$item_id) 
        	$this->_out(new Upfront_JsonResponse_Error("Invalid image ID"));

        $ids = json_decode($item_id);

        if(is_null($ids) || !is_array($ids))
        	$this->_out(new Upfront_JsonResponse_Error("Invalid image ID"));

    	$images = array();
    	$intermediate_sizes = get_intermediate_image_sizes();
    	$intermediate_sizes[] = 'full';
    	foreach($ids as $id){
    		$sizes = array();
    		foreach ( $intermediate_sizes as $size ) {
				$image = wp_get_attachment_image_src( $id, $size);
				if($image)
					$sizes[$size] = $image;
			}
			if(sizeof($sizes) != 0)
				$images[$id] = $sizes;
    	}

        if(sizeof($images) == 0)
        	$this->_out(new Upfront_JsonResponse_Error("No images ids given"));

        $result = array(
        	'given' => sizeof($ids),
        	'returned' => sizeof($ids),
        	'images' => $images
    	);

        return $this->_out(new Upfront_JsonResponse_Success($result));
	}
}
Upfront_Uimage_Server::serve();