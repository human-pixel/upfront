<?php
/**
 * Abstract class for post markup generation
 * Takes care of the post parts template expansion.
 */
abstract class Upfront_PostPart_View {
	
	protected $_data;
	protected $_post;

	/**
	 * Main public method.
	 * Expands each part of the post parts and constructs markup string,
	 * then wraps it in post wrapper.
	 * @param object WP_Post object instance
	 * @return string Rendered post markup
	 */
	abstract public function get_markup ($post);


	/**
	 * Loads post part template from a file.
	 * @param string $slug Post part template slug
	 * @return string Loaded template
	 */
	abstract protected function _get_template ($slug);


	public function expand_date_posted_template () {
		if (empty($this->_post->post_date)) return '';

		$time = strtotime($this->_post->post_date);
		if (empty($time)) return '';

		$date_format = !empty($this->_data['date_posted_format'])
			? $this->_data['date_posted_format']
			: Upfront_Posts_PostsData::get_default('date_posted_format')
		;
		$format = explode(' ', $date_format);

		$out = $this->_get_template('date_posted');

		$part = 1;
		foreach ($format as $fmt) {
			$out = Upfront_Codec::get()->expand($out, "date_{$part}", date($fmt, $time));
			$part++;
		}
		$out = Upfront_Codec::get()->expand($out, "datetime", date($date_format, $time));
		$out = Upfront_Codec::get()->expand($out, "timestamp", $time);

		$out = Upfront_Codec::get()->expand($out, "date", date(get_option('date_format'), $time));
		$out = Upfront_Codec::get()->expand($out, "time", date(get_option('time_format'), $time));

		return $out;
	}

	public function expand_author_template () {
		if (empty($this->_post->post_author)) return '';

		$author = $this->_post->post_author;
		$name = get_the_author_meta('display_name', $author);
		$url = get_author_posts_url($author);

		$out = $this->_get_template('author');

		$out = Upfront_Codec::get()->expand($out, "name", esc_html($name));
		$out = Upfront_Codec::get()->expand($out, "url", esc_url($url));

		return $out;
	}

	public function expand_gravatar_template () {
		if (empty($this->_post->post_author)) return '';

		$gravatar_size = !empty($this->_data['gravatar_size'])
			? $this->_data['gravatar_size']
			: Upfront_Posts_PostsData::get_default('gravatar_size')
		;

		$author = $this->_post->post_author;
		$name = get_the_author_meta('display_name', $author);
		$gravatar = get_avatar($author, $gravatar_size, null, $name);

		$out = $this->_get_template('gravatar');

		$out = Upfront_Codec::get()->expand($out, "name", esc_html($name));
		$out = Upfront_Codec::get()->expand($out, "gravatar", $gravatar);

		return $out;
	}

	public function expand_comment_count_template () {
		$hide_empty = isset($this->_data['comment_count_hide'])
			? (int)$this->_data['comment_count_hide']
			: (int)Upfront_Posts_PostsData::get_default('comment_count_hide')
		;

		if ($hide_empty && empty($this->_post->comment_count)) return '';

		$out = $this->_get_template('comment_count');

		$out = Upfront_Codec::get()->expand($out, "comment_count", (int)($this->_post->comment_count));

		return $out;
	}

	public function expand_featured_image_template () {
		if (empty($this->_post->ID)) return '';

		$resize_featured = isset($this->_data['resize_featured'])
			? (int)$this->_data['resize_featured']
			: (int)Upfront_Posts_PostsData::get_default('resize_featured')
		;
		$full_featured = isset($this->_data['full_featured_image'])
			? (int)$this->_data['full_featured_image']
			: (int)Upfront_Posts_PostsData::get_default('full_featured_image')
		;
		$hide_featured = isset($this->_data['hide_featured_image'])
			? (int)$this->_data['hide_featured_image']
			: (int)Upfront_Posts_PostsData::get_default('hide_featured_image')
		;

		$thumbnail = false;
		if ( $full_featured == 1 ) {
			$thumbnail = get_the_post_thumbnail($this->_post->ID);
		} else {
			$thumbnail = upfront_get_edited_post_thumbnail($this->_post->ID);
		}

		// Let's deal with the fallback options
		$fallback = false;
		if (empty($thumbnail)) {
			$fallback_option = !empty($this->_data['fallback_option'])
				? $this->_data['fallback_option']
				: Upfront_Posts_PostsData::get_default('fallback_option')
			;

			// Hide fallback
			if (empty($fallback_option) || 'hide' === $fallback_option) return ''; // Drop this

			// Solid color fallback
			if ('color' === $fallback_option) {
				$color = !empty($this->_data['fallback_color'])
					? $this->_data['fallback_color']
					: Upfront_Posts_PostsData::get_default('fallback_color')
				;
				if (!empty($color) && preg_match('/^(#|rgba?)/', $color)) {
					$fallback = sprintf('style="background-color: %s;"', $color);
				}
			}

			// Image fallback
			if ('image' === $fallback_option) {
				$image = !empty($this->_data['fallback_image'])
					? $this->_data['fallback_image']
					: Upfront_Posts_PostsData::get_default('fallback_image')
				;
				if (!empty($image)) $thumbnail = '<img class="featured-image fallback-image" src="' . esc_url($image) . '" />';
			}
		}

		$out = $this->_get_template('featured_image');

		$out = Upfront_Codec::get()->expand($out, "thumbnail", $thumbnail);
		$out = Upfront_Codec::get()->expand($out, "resize", $resize_featured);
		$out = Upfront_Codec::get()->expand($out, "fallback", $fallback);
		$out = Upfront_Codec::get()->expand($out, "permalink", get_permalink($this->_post->ID));

		return $out;
	}

	public function expand_title_template () {
		if (empty($this->_post->post_title)) return '';

		$title = esc_html(apply_filters('the_title', $this->_post->post_title));
		$permalink = get_permalink($this->_post->ID);

		$out = $this->_get_template('title');

		$out = Upfront_Codec::get()->expand($out, "permalink", $permalink);
		$out = Upfront_Codec::get()->expand($out, "title", $title);

		return $out;
	}

	public function expand_content_template () {
		$length = isset($this->_data['content_length'])
        	? (int)$this->_data['content_length']
        	: (int)Upfront_Posts_PostsData::get_default('content_length')
        ;
		$content = $this->_get_content_value($length);

		$out = $this->_get_template('content');

		$out = Upfront_Codec::get()->expand($out, "content", $content);

		return $out;
	}

	public function expand_tags_template () {
		if (empty($this->_post->ID)) return '';

		$tags = get_the_tag_list('', ', ', '', $this->_post->ID);
		if (empty($tags)) return '';

		$length = isset($this->_data['tags_limit'])
        	? (int)$this->_data['tags_limit']
        	: (int)Upfront_Posts_PostsData::get_default('tags_limit')
        ;

        if ($length) {
			$list = array_map('trim', explode(',', $tags));
			$tags = join(', ', array_slice($list, 0, $length));
		}


		$out = $this->_get_template('tags');

		$out = Upfront_Codec::get()->expand($out, "tags", $tags);

		return $out;
	}

	public function expand_categories_template () {
		if (empty($this->_post->ID)) return '';

		$categories = get_the_category_list(', ', '', $this->_post->ID);
		if (empty($categories)) return '';

		$length = isset($this->_data['categories_limit'])
        	? (int)$this->_data['categories_limit']
        	: (int)Upfront_Posts_PostsData::get_default('categories_limit')
        ;

        if ($length) {
			$list = array_map('trim', explode(',', $categories));
			$categories = join(', ', array_slice($list, 0, $length));
		}

		$out = $this->_get_template('categories');

		$out = Upfront_Codec::get()->expand($out, "categories", $categories);

		return $out;
	}

	public function expand_read_more_template () {
		if (empty($this->_post->ID)) return '';
		if (!empty($this->_data['content']) && 'content' === $this->_data['content']) return ''; // Only for excerpts

		$permalink = get_permalink($this->_post->ID);

		$out = $this->_get_template('read_more');

		$out = Upfront_Codec::get()->expand($out, "permalink", $permalink);

		return $out;
	}

	/**
	 * Expands post meta values.
	 *
	 * @return string Compiled expression
	 */
	public function expand_meta_template () {
		if (empty($this->_post->ID)) return '';

		$out = $this->_get_template('meta');
		if (empty($out)) return $out;

		return Upfront_Codec::get('postmeta')->expand_all($out, $this->_post);
	}

	/**
	 * Return either full content or excerpt, based on data state.
	 * @return string Content or excerpt
	 */
	protected function _get_content_value ($length) {
		return !empty($this->_data['content']) && 'content' === $this->_data['content']
			? $this->_get_content()
			: $this->_get_excerpt($length)
		;
	}

	/**
	 * Returns post full content, with filters applied.
	 * @return string Final post full content.
	 */
	protected function _get_content () {
		return apply_filters('the_content', $this->_post->post_content);
	}

	/**
	 * Returns post excerpt.
	 * If a post doesn't have one, generates it with preset limit.
	 * @param int $length Length in words
	 * @return string Post excerpt
	 */
	protected function _get_excerpt ($length) {
		if (!empty($this->_post->post_excerpt)) return wpautop($this->_post->post_excerpt);

		$content = $this->_post->post_content;

		// Detect `more` tag and act on it
		if (preg_match('/(<!--more(.*?)?-->)/', $content, $matches)) {
			$content = reset(explode($matches[0], $content, 2));
		}

		$excerpt = preg_replace('/\s+/', ' ', // Collapse potential multiple consecutive whitespaces
			str_replace(array("\n", "\r"), ' ',  // Normalize linebreaks to spaces - no block-level stuff in excerpts
				strip_shortcodes( // No shortcodes in excerpts
					wp_strip_all_tags($content) // Also no HTML tags - allowing that together with limit parsing might end up with broken HTML
				)
			)
		);

		$length = (int)$length;
		if (!empty($length)) {
			$words = explode(' ', $excerpt, $length+1);
			$excerpt = join(' ', array_slice($words, 0, $length));
		}

		return wpautop($excerpt);
	}
}
