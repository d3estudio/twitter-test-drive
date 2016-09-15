$(window).load(function() {
    $('.preload').fadeOut();
});

$('input, textarea').each(function() {
    $(this).on('focus', function() {
        $(this).parent('.field').addClass('active');
        $(this).parent('.field').removeClass('error');
    });
    $(this).on('blur', function() {
        if ($(this).val().length == 0) {
            $(this).parent('.field').removeClass('active');
            $(this).parent('.field').addClass('error');
        } else {
            $(this).parent('.field').removeClass('error');
        }
    });
    if ($(this).val() != '') {
        $(this).parent('.field').addClass('active');
    }
});

$('.validate').submit(function() {
    var valid = true;
    $(this).find('input, textarea').each(function() {
        if ($(this).val() == '' && !$(this).is('[novalidate]')) {
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
