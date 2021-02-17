

$('.user-label').hover(() => {
    var href = $(this).attr('href');
    var ele = $(`.user-label[href='${href}'] + .user-hover-card-anchor`).querySelector('.user-info-card-header');
    var html = ele.innerHTML;
    if (!html.includes('</button>')) { // doesnt place multiple buttons
        ele.innerHTML = html + '<button class="dmBtn">Message</button>';
    };
}) 