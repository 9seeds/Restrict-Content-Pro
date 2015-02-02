jQuery(document).ready(function($) {

	// Initial validation of subscription level and gateway options
	rcp_validate_subscription_level();
	rcp_validate_gateways();

	// Trigger gateway change event when gateway option changes
	$('#rcp_payment_gateways select, #rcp_payment_gateways radio').change( function() {

		$('body').trigger( 'rcp_gateway_change' );

	});

	// Trigger subscription level change event when level selection changes
	$('.rcp_level').change(function() {

		var data = [];

		data.price = parseInt( $(this).attr('rel') );
		data.id    = $(this).val();

		$('body').trigger( 'rcp_level_change' );

	});

	$('body').on( 'rcp_gateway_change', function() {

		rcp_validate_subscription_level();
		rcp_validate_gateways();

	});

	$('body').on( 'rcp_level_change', function() {

		rcp_validate_subscription_level();
		rcp_validate_gateways();

	});

	$('body').on( 'rcp_discount_applied', function() {

		rcp_validate_subscription_level();
		rcp_validate_gateways();

	});

	// Validate discount code
	$('#rcp_discount_code').keyup( function( key ) {
		
		if( key.which != 13 ) {

			if( $(this).val() == '' ) {
				return false;
			}

			var data = {
				action: 'validate_discount',
				code: $(this).val(),
				subscription_id: $('#rcp_subscription_levels input:checked').val()
			};

			$.post(rcp_script_options.ajaxurl, data, function(response) {

				$('.rcp_discount_amount').remove();
				$('.rcp_discount_valid, .rcp_discount_invalid').hide();

				if( ! response.valid ) {

					// code is invalid
					$('.rcp_discount_invalid').show();
					$('.rcp_gateway_fields').removeClass('rcp_discounted_100');
					$('.rcp_gateway_fields,#rcp_auto_renew_wrap').show();

				} else if( response.valid ) {
	
					// code is valid
					$('.rcp_discount_valid').show();
					$('#rcp_discount_code_wrap label').append( '<span class="rcp_discount_amount"> - ' + response.amount + '</span>' );

					if( response.full ) {

						$('.rcp_gateway_fields,#rcp_auto_renew_wrap').hide();
						$('.rcp_gateway_fields').addClass('rcp_discounted_100');
	
					} else {
						
						$('.rcp_gateway_fields,#rcp_auto_renew_wrap').show();
						$('.rcp_gateway_fields').removeClass('rcp_discounted_100');
					
					}

				}

				$('body').trigger('rcp_discount_applied', [ response ] );

			});

		}

	});

	$(document).on('click', '#rcp_registration_form #rcp_submit', function(e) {

		var submission_form = document.getElementById('rcp_registration_form');

		if( typeof submission_form.checkValidity === "function" && false === submission_form.checkValidity() ) {
			return;
		}

		e.preventDefault();

		var submit_register_text = $(this).val();

		$('#rcp_submit').val( rcp_script_options.pleasewait );
		$(this).after('<span class="rcp-submit-ajax"><i class="rcp-icon-spinner rcp-icon-spin"></i></span>');

		$.post( rcp_script_options.ajaxurl, $('#rcp_registration_form').serialize() + '&action=rcp_process_register_form&rcp_ajax=true', function(response) {

			$('.rcp-submit-ajax').remove();
			$('.rcp_message.error').remove();
			if ( response.success ) {
				$(submission_form).submit();
			} else {
				$('#rcp_submit').val( submit_register_text );
				$('#rcp_submit').before( response.data.errors );
				$('#rcp_register_nonce').val( response.data.nonce );
			}
		});

	});

});


function rcp_validate_gateways() {

	var $       = jQuery;
	var is_free = false;
	var options = [];
	var level   = jQuery( '#rcp_subscription_levels input:checked' );
	var full    = $('.rcp_gateway_fields').hasClass( 'rcp_discounted_100' );
	var gateway;

	if( level.attr('rel') == 0 ) {
		is_free = true;
	}

	if( $('#rcp_payment_gateways').length > 0 ) {

		gateway = $( '#rcp_payment_gateways select option:selected' );

	} else {

		gateway = $( 'input[name="rcp_gateway"' );

	}

	if( is_free ) {

 		$('.rcp_gateway_fields').hide();
 		$('#rcp_auto_renew_wrap').hide();
		$('#rcp_auto_renew_wrap input').attr('checked', false);

 	} else {

 		if( ! full ) {
	 		$('.rcp_gateway_fields').show();
	 	}

 		if( 'yes' == gateway.data( 'supports-recurring' ) && ! full ) {

 			$('#rcp_auto_renew_wrap').show();
 		
 		} else {
 		
 			$('#rcp_auto_renew_wrap').hide();
			$('#rcp_auto_renew_wrap input').attr('checked', false);
 		
 		}
		
		$('#rcp_discount_code_wrap').show();

 	}

 	var data = { action: 'rcp_load_gateway_fields', rcp_gateway: gateway.val() };

	$.post( rcp_script_options.ajaxurl, data, function(response) {
		console.log( response );
		if( response.data.fields ) {
			$( response.data.fields ).insertAfter('.rcp_gateway_fields');
		}
	});

}

function rcp_validate_subscription_level() {

	var $       = jQuery;
	var is_free = false;
	var options = [];
	var level   = jQuery( '#rcp_subscription_levels input:checked' );
	var full    = $('.rcp_gateway_fields').hasClass( 'rcp_discounted_100' );

	if( level.attr('rel') == 0 ) {
		is_free = true;
	}

	if( is_free ) {

		$('.rcp_gateway_fields,#rcp_auto_renew_wrap,#rcp_discount_code_wrap').hide();
		$('.rcp_gateway_fields').removeClass( 'rcp_discounted_100' );
		$('#rcp_discount_code_wrap input').val('');
		$('.rcp_discount_amount').remove();
		$('.rcp_discount_valid, .rcp_discount_invalid').hide();
		$('#rcp_auto_renew_wrap input').attr('checked', false);

 	} else {

 		if( ! full ) {
			$('.rcp_gateway_fields,#rcp_auto_renew_wrap').show();
		}

 		$('#rcp_discount_code_wrap').show();

 	}

}