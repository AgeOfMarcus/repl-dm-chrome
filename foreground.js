console.log('foreground baby');

$('html').on('DOMSubtreeModified', 'body', function(){
    $('.user-hover-card .user-info-card-header span.jsx-1369737386:not(.user-info-card-full-name)').after().click(() => {
        console.log('hell fuckin yeah');
        console.log($('.user-hover-card-anchor span.jsx-801033477').text());
    })
});
