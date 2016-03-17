$(window).load(function() {
    $('.preload').fadeOut();
});

$('input').each(function() {
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

$('#document').mask('000.000.000-00');
