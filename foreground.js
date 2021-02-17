 

$('.user-label').hover(() => {
    var href = $(this).attr('href');
    var ele = $(`.user-label[href='${href}'] + .user-hover-card-anchor`).find('.user-info-card-header');
    var html = ele.html();
    if (!html.includes('</button>')) { // doesnt place multiple buttons
        ele.html(html + '<button class="dmBtn">Message</button>');
    };
})