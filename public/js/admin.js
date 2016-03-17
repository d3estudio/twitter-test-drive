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
