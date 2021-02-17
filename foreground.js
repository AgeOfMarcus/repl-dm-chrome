 

$('.user-label').hover(() => {
    var href = $(this).attr('href');
    console.log(href)
    setTimeout(() => {
        console.log($(`.user-label[href='${href}']`)
        var ele = $(`.user-label[href='${href}'] + .user-hover-card-anchor`).find('.user-info-card-header');
        var html = ele.html();
        if (!html.includes('</button>')) { // doesnt place multiple buttons
            ele.html(html + '<button class="dmBtn">Message</button>');
        };
    }, 100);
})