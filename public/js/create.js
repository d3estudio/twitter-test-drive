$('.addField button').click(function() {
    var name = $('.newField input').val();
    var type = $('.newField select option:selected').val();
    var html = $('.toClone').clone();

    html.removeClass('toClone');
    html.find('input').attr('type', type);
    html.find('input').attr('placeholder', name);

    $('.customFields').append(html);

})

$('body').on('click', '.close', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(this).parent().remove();
})
