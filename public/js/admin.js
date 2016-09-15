$('.logout').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $.ajax({
        url: '/session/delete/',
        type: 'POST',
        success: function() {
            window.location = "https://www.twitter.com"
        }
    })
});

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

function saveMoment(element) {
    $.post({
        url: '/admin/users/moment',
        data: {
            url: element.val(),
            campaign: element.data('campaign')
        }
    }).then(function(data) {
        console.log(data);
        if (data.success) {
            element.parent().find('.moment').removeClass('editing').attr('src', '/img/saved.png');
            setTimeout(function() {
                element.parent().find('.moment').attr('src', '/img/edit.png');
            }, 2000);
        }
    });
}

$('.moment').click(function() {
    if ($(this).hasClass('editing')) {
        saveMoment($(this).parent().find('.momentURL'));
    } else {
        $(this).addClass('editing').attr('src', '/img/save.png');
        $(this).parent().find('.momentURL').focus();
    }
});

$('.momentURL').keydown(function() {
    $(this).parent().find('.moment').addClass('editing').attr('src', '/img/save.png');
});

$('.logout').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $.post('/logout')
        .then(function() { window.location.href = 'https://twitter.com'; })
        .catch(function() { window.location.href = 'https://twitter.com'; });
});

$('#addCampaign').click(function(e) {
    e.preventDefault();
    e.stopPropagation();

    $.post('/admin/' + $(this).data('handle') + '/create', function(data) {
        console.log(data);
    })
})

$('.extra_fields').change(function() {
    var val = $(this).prop('checked');
    var campaign = $(this).data('campaign');
    var handle = $(this).data('handle');
    $.post({
        url: '/admin/campaign/extra',
        data: {
            extra_fields: val,
            handle: handle,
            campaign: campaign
        }
    }).then(function(data) {
        console.log(data);
        if (data.success) {

        }
    });
});
