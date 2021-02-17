console.log('foreground baby');

$('html').on('DOMSubtreeModified', 'body', function(){
    $('.user-hover-card .user-info-card-header span.jsx-1369737386:not(.user-info-card-full-name)').after().click(() => {
        var username = $('.user-hover-card-anchor span.jsx-801033477').text().split(" ")[0];
        console.log(username);
    })
});


var html = `
<div class='repldmBtn'>
    <i class="fas fa-paper-plane"></i>
    <i class="far fa-paper-plane"></i>
</div>`;
$(html).insertBefore('header .right');