$('.addField a').click(function(e) {
    e.preventDefault();
    e.stopPropagation();

    var name = $('.newField input').val();
    var type = $('.newField select option:selected').val();
    var html = $('.toClone').clone();

    if(name !== '' && type !== 'Type') {
        html.removeClass('toClone');
        html.find('input').attr('type', type);
        html.find('input').attr('placeholder', name);
        $('.customFields').append(html);

        $('.newField input').val('');
        $('.newField select').val('Type');
    }
})

$('body').on('click', '.close', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).parent().remove();
})

$('.newField select').each(function() {
    $(this).on('focus', function() {
        $(this).parent('.field').addClass('active');
        $(this).parent('.field').removeClass('error');
    });
    $(this).on('blur', function() {
        if ($(this).find('option:selected') == 'Type') {
            $(this).parent('.field').removeClass('active');
            $(this).parent('.field').addClass('error');
        } else {
            $(this).parent('.field').removeClass('error');
        }
    });
    if ($(this).find('option:selected') !== 'Type') {
        $(this).parent('.field').addClass('active');
    }
});
