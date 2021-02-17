console.log('foreground baby');

$('html').on('DOMSubtreeModified', 'body', function(){
    $('.user-hover-card .user-info-card-header span.jsx-1369737386:not(.user-info-card-full-name)').after().click(() => {
        console.log('hell fuckin yeah');
        console.log($(this).parents('.jsx-1369737386:not(.user-info-card-header)').find('.user-label').attr('href'));
    })
});
