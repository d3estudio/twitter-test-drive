// Field adding logic
$(function() {
    var validCPF = false;

    var validateCPF = function(input) {
        input.cpfcnpj({
            mask: true,
            validate: 'cpf',
            ifValid: function(_input) {
                validCPF = true;
                input.parent('.field').removeClass("error");
            },
            ifInvalid: function(_input) {
                validCPF = false;
                input.parent('.field').addClass("error");
            }
        });
    }

    var applyCustomFieldRules = function(input, type) {
        switch (type) {
            case 'cpf':
                validateCPF( $(input) );
                break;
            case 'date':
                $(input).mask('99/99/9999');
                $(input).attr('type', 'text');
                break;
            default:
                $(input).attr('type', type);
                break;
        }
    }

    $('input').each(function(){
        applyCustomFieldRules(this, $(this).attr('type').toLowerCase());

        $(this).on('blur', function() {
            if ($(this).val().length == 0) {
                $(this).parent('.field').removeClass('active');
                $(this).parent('.field').addClass('error');
            } else if( $(this).attr("data-selected-type") == "cpf" && !validCPF ) {
                $(this).parent('.field').removeClass('active');
                $(this).parent('.field').addClass('error');
            } else {
                $(this).parent('.field').removeClass('error');
            }
        });
    })

    $('.validate').submit(function() {
        var valid = true;
        $(this).find('input').each(function() {
            if ($(this).val() == '' && !$(this).is('[novalidate]')) {
                valid = false;
                $(this).parent().addClass('error');
            } else if( $(this).attr("data-selected-type") == "cpf" && !validCPF ){
                valid = false;
                $(this).parent().addClass('error');
            } else {
                $(this).parent().removeClass('error');
            }
        });
        if (valid) {
            $('.preload').fadeIn();
        }
        return valid;
    });
});
