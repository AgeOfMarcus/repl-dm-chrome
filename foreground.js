console.log('foreground baby');

var path = window.location.pathname;
$('html').on('DOMSubtreeModified', 'body', () => {
    if (window.location.pathname !== path) {
        $('.cont').hide();
        setTimeout(() => {
            setup();
            path = window.location.pathname;
        }, 100)
    }
    $('.user-hover-card .user-info-card-header span.jsx-1369737386:not(.user-info-card-full-name)').after().click(() => {
        var username = $('.user-hover-card-anchor span.jsx-801033477').text().split(" ")[0];
        console.log(username);
    }) 
});

function setup() {
    if ($('.repldmBtn').length == 0) {
        function check(codePage=false) {
            setTimeout(() => {
                console.log($('header .left'))
                if ($('header .left').length == 0) {
                    if ($('.repldmBtn').length == 0) {
                        check(true);
                    }
                }
                else if ($('.repldmBtn').length == 0) {
                    var maybe;
                    console.log(codePage)
                    if (codePage || $('.ws-header-cta-label').length == 1) {
                        maybe = 'transform: translateX(-300%)';
                    }
                    else {
                        maybe = '';
                    }
                    var html = `
                    <div class='repldmBtn' style='${maybe}'>
                        <i class="fas fa-paper-plane" style='display: none;'></i>
                        <i class="far fa-paper-plane"></i>
                    </div>`;
                    $(html).insertAfter('header .left');

                    $('.repldmBtn').click(() => {
                        var open = $('.cont').is(':visible');
                        $('.cont').toggle();
                        $('.repldmBtn .fa-paper-plane').toggle();
                    })
                }
            }, 100)
        }
        check();
    }

    if ($('.cont').length == 0) {
        var pageHtml = `<div class='cont' style='display: none;'>
                    <div class='dmWrapper'>
                        <!-- left -->
                        <div class='left'>
                            <div class='left-top'>
                                <div class='settings-btn'> 
                                    <i class="fas fa-cog fa-lg"></i>
                                </div>
                                <div class='title'>
                                    Direct
                                </div>
                                <div class='write-msg-btn'>
                                    <i class="far fa-edit fa-lg"></i>
                                </div>
                            </div>

                            <!-- messages -->
                            <div class='left-msgs'> 
                                <div class='node'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>rafrafraf</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>

                                <div class='node seen'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>

                                <div class='node seen'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>

                                <div class='node seen'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>

                                <div class='node seen'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>

                                <div class='node seen'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>

                                <div class='node seen'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </div>
                            </div>

                            <!-- settings -->
                            <div class='settings'>
                                <div class='left-top'>
                                    <div class='settings-btn' style='color: #eb4634;' onclick="$('.dmWrapper .settings').toggleClass('open');"> 
                                        <i class="fas fa-cog fa-lg"></i>
                                    </div>
                                    <div class='title'>
                                        Settings
                                    </div>
                                </div>
                                <div class='settings-body'> 
                                    <div class='option'> 
                                        Chat color
                                        <div class='change-color' style='background-color: #25D;'></div>
                                        <div class='change-color' style='background-color: #25D366;'></div>
                                        <div class='change-color' style='background-color: #de6052;'></div>
                                        <div class='change-color' style='background-color: #f2ec3a;'></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- right -->
                        <div class='right'> 
                            <div class='no-msg'>
                                <img style='width: 100px; height: auto; margin-top: -30px;' src='https://chrome-extension.rafrafraf.repl.co/dupl.png' />
                                <span style='color: rgba(255,255,255,0.9); font-size: 30px; font-weight: 100; margin: 10px 0;'>Direct messaging</span>
                                <span style='color: rgba(255,255,255,0.95); font-size: 14px;'>Talk to anyone on replit directly, here on repl.it</span>
                            </div>

                            <!-- chat -->
                            <div class='chat'> 
                            
                            </div>
                        </div>
                    </div>
                </div>`;

        $('body').append($(pageHtml));

        $('.settings-btn').click(() => {
            $('.dmWrapper .settings').toggleClass('open');
        })
        $('.change-color').bind('click', () => {
            $('.dmWrapper .right').css('background-color', $(this).css('background-color'));
        })
    }
}

window.onload = setup();
