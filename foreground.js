console.log('foreground baby');

$('body').on('DOMSubtreeModified', 'mydiv', function(){
    console.log('changed');
    $('.user-hover-card .user-info-card-header span.jsx-1369737386:not(.user-info-card-full-name)').after().click(() => {
        console.log('hell fuckin yeah');
    })
});
