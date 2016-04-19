<?php

class Upfront_PageTemplate {

	const PAGE_TEMPLATE_TYPE = 'upfront_page_template';

	public function __construct () {}

	public static function to_string ($array) {
		if (!is_array($array)) return '';
		return join('::', $array);
	}

	public static function to_hash ($what) {
		return md5(serialize($what));
	}
	
	/**
	 * Saves the layout and returns the layout ID key.
	 * Layout ID key is *not* the same as layout ID,
	 * it's a hash used to resolve this particular layout.
	 * @param Upfront_Layout $layout layout to store
	 * @return mixed (bool)false on failure, (string)layout ID key on success
	 */
	public function save_page_template ($ID, $layout) {
		$cascade = $layout->get_cascade();
		$store = $layout->to_php();
		$layout_id_key = self::to_hash($store);

		$existing_page_template = $this->get_page_template($ID);
		
		// print_r('existing page template');
		// print_r($existing_page_template);
		// print_r('layout id key');
		// print_r($layout_id_key);
		// return;
		
		if ( !empty($ID) && !empty($existing_page_template) ) {
			// update page template
			// print_r('updating page template');
			$post_id = wp_update_post(array(
				"ID" => (int) $ID,
				"post_content" => base64_encode(serialize($store)),
				"post_title" => self::to_string($cascade),
				"post_name" => $layout_id_key,
				"post_author" => get_current_user_id(),
			));
		} else {
			// insert page template
			// print_r('inserting page template');
			$post_id = wp_insert_post(array(
				"post_content" => base64_encode(serialize($store)),
				"post_title" => self::to_string($cascade),
				"post_name" => $layout_id_key,
				"post_type" => self::PAGE_TEMPLATE_TYPE,
				"post_author" => get_current_user_id(),
			));
		}
		
		
		print_r($post_id);
		return;
		
		return !empty($post_id) && !is_wp_error($post_id)
			? $layout_id_key
			: false
		;
	}
	
	/**
	 * Fetches a single page template, as determined by supplied post ID.
	 * @param string $ID Requested page template post ID
	 * @return mixed (Upfront_Layout)revision on success, (bool)false on failure
	 */
	public function get_page_template ($ID) {
	
		if ( empty($ID) ) return false;
	
		$query = new WP_Query(array(
			"p" => $ID,
			"post_type" => self::PAGE_TEMPLATE_TYPE,
			'suppress_filters' => true,

		));
		return !empty($query->posts[0]) && !empty($query->posts[0]->post_content)
			? unserialize(base64_decode($query->posts[0]->post_content))
			: false
		;
	}
	
	/**
	 * Fetches all page templates
	 */
	public function get_all_page_templates () {
		$query = new WP_Query(array(
			'posts_per_page' => -1,
			'post_type' => self::PAGE_TEMPLATE_TYPE,
		));
		$query = new WP_Query($args);
		return $query->posts;
	}
	
}