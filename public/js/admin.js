$('.save').click(function() {
    var handle = $('.handle').val();
    if (handle !== "") {
        var found = false;
        $('.handles').each(function() {
            console.log($(this).find('.username').text(), "@" + handle);
            if ($(this).find('.username').text() === "@" + handle) {
                found = true;
            }
        });

        if (found) {
            window.alert('Este usuário já é um administrador');
        } else {
            $.post({
                url: '/admin/users',
                data: {
                    handle: handle
                }
            }).then(function(handle) {
                if (handle.success) {
                    $('.card.admin').eq(1).append(
                        '<div class="handles"><img src="/img/remove.png" class="remove" data-handle="' + handle.handle + '" /><span class="username">@' + handle.handle + '</span><hr /></div>'
                    );
                }
            });
        }

    }
});

$('body').on('click', '.remove', function() {
    var _this = $(this);
    if (window.confirm('Tem certeza?')) {
        $.post({
            url: '/admin/users/delete',
            data: {
                handle: _this.data('handle')
            }
        }).then(function(handle) {
            if (handle.success) {
                _this.parent().remove();
            }
        });
    }
});

$('.logout').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $.post('/session/delete')
        .done(function( data ) { window.location.href = 'https://twitter.com'; });
});
