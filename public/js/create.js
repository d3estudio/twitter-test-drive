$('.addField a').click(function(e) {
    e.preventDefault();
    e.stopPropagation();

    var name = $('.newField input').val();
    var type = $('.newField select option:selected').val();
    var html = $('.toClone').clone();

    if(name !== '' && type !== 'Type') {
        customFieldRules(html.find('input'), type);

        html.removeClass('toClone');
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

function customFieldRules(input, type) {
    switch (type) {
        case 'cpf':
            input.mask('999.999.999-99');
            break;
        default:
            input.attr('type', type);
            break;
    }
}
