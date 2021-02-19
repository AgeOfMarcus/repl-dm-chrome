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
        newMessageTo(username);
    })
});

chrome.storage.sync.set({test: true}, () => { console.log("hell yea buddy") })

function setup() {
    // add message button to profile page
    setTimeout(() => {
        if ($('.profile-username-label').length !== 0 && $('.message-btn').length == 0) {
            $('<div class="message-btn">message</div>').insertAfter('.profile-username-label');

            document.querySelector('.message-btn').addEventListener('click', (event) => {
                newMessageTo(event.target.previousElementSibling.innerText.split(" ")[0]);
            })
        }
    }, 200)

    // add repldm button 
    if ($('.repldmBtn').length == 0) {
        var dark; // fix dark theme check
        //if (__REPLIT_REDUX_STORE__.getState().user.userInfo.editorPreferences.theme == 'replitDark') {
            //dark = 'darktheme';
        //}
        //else {
            dark = '';
        //}
        var html = `
        <div class='repldmBtn ${dark}'>
            <i class="fas fa-paper-plane" style='display: none;'></i>
            <i class="far fa-paper-plane"></i>
            <div class='label'>repl DM</div>
        </div>`;
        $(html).insertAfter('.scroll-container .new-repl-cta');

        $('.repldmBtn').click(() => {
            var open = $('.cont').is(':visible');
            $('.repldmBtn .fa-paper-plane').toggle();
            $('.repldmBtn').toggleClass('open');
            if (!open) { // open
                $('body').css('overflow', 'hidden'); // stops page scrolling
                $('.cont').show();
                $('.dmWrapper').css({
                    marginTop: '-400px',
                    opacity: '0.2'
                });
                $('.dmWrapper').animate({
                    marginTop: '0',
                    opacity: '1'
                }, 100);
            }
            else { // close
            $('body').css('overflow', 'scroll');
                $('.new-msg-cont').hide();
                $('.dmWrapper').animate({
                    marginTop: '-400px',
                    opacity: '0.1'
                }, 100, () => {
                    $('.cont').hide();
                });
            }
        })
    }

    // add repldm page
    if ($('.cont').length == 0) {
        var pageHtml = `<div class='cont' style='display: none;'>
                    <div class='dmWrapper'>
                        <!-- left -->
                        <div class='left'>
                            <div class='left-top'>
                                <div class='settings-btn'> 
                                    <i class="fas fa-cog"></i>
                                </div>
                                <div class='title'>
                                    Direct
                                </div>
                                <div class='write-msg-btn'>
                                    <i class="far fa-edit"></i>
                                </div>
                            </div>

                            <!-- messages -->
                            <div class='left-msgs'> 
                                <input type='radio' class='node-radio' id='msg-0' name='msg' />
                                <label class='node' for='msg-0'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>rafrafraf</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </label>
                                
                                <input type='radio' class='node-radio' id='msg-1' name='msg' />
                                <label class='node seen' for='msg-1'>
                                    <div class='pfp'>
                                        <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    </div>
                                    <div class='mid'> 
                                        <div class='name'>someone else</div>
                                        <div class='description'>Sent you a message <span class='date'>1h ago</span></div>
                                    </div>
                                    <div class='circle'></div>
                                </label>
                            </div>

                            <!-- settings -->
                            <div class='settings'>
                                <div class='left-top'>
                                    <div class='settings-btn' style='color: #eb4634;'> 
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
                                        <div class='change-color' style='background-color: white; border: 1px solid rgb(219,219,219);'></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- right -->
                        <div class='right white-bg'> 
                            <div class='no-msg'>
                                <img style='width: 100px; height: auto; margin-top: -30px;' src='https://chrome-extension.rafrafraf.repl.co/dupl.png' />
                                <span style='color: rgba(255,255,255,0.9); font-size: 30px; font-weight: 100; margin: 10px 0;'>Direct messaging</span>
                                <span style='color: rgba(255,255,255,0.95); font-size: 14px;'>Talk to anyone on replit directly, here on repl.it</span>
                            </div>

                            <!-- chat -->
                            <div class='chat'> 
                                <div class='top'>
                                    <img src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                    <span>Name</span>
                                </div>
                                <div class='wrapper'>
                                    <div class='box'>
                                        <div class='msg-node recieved'>
                                            ayo wys B ;)
                                        </div>
                                        <div class='msg-node sent'>
                                            wagwan piffting send me your bbn pin
                                        </div>
                                        <div class='msg-node sent'>
                                            ewgSDGSEG WEWEG WEGWE AG GEZZGEG 
                                        </div>
                                        <div class='msg-node sent'>
                                            \ ESGS GE\G EG SEGEG\EDXG\DHD\ 
                                        </div>
                                        <div class='msg-node recieved'>
                                            E\SGGSE\ 
                                        </div>
                                        <div class='msg-node sent'>
                                            \ ESGG\ 
                                        </div>
                                        <div class='msg-node sent'>
                                            \ ESGS GE\G EG SEGEG\EDXG\DHD\ 
                                        </div>
                                        <div class='msg-node recieved'>
                                            E\SGGSE\ 
                                        </div>
                                        <div class='msg-node sent'>
                                            \ ESGG\ 
                                        </div>
                                        <div class='msg-node sent'>
                                            \ ESGS GE\G EG SEGEG\EDXG\DHD\ 
                                        </div>
                                        <div class='msg-node recieved'>
                                            E\SGGSE\ 
                                        </div>
                                        <div class='msg-node sent'>
                                            \ ESGG\ 
                                        </div>
                                    </div>
                                    <div class='msg-wrapper'>
                                        <input class='msg' placeholder='message...' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class='new-msg-cont' style='display: none;'>
                    <div class='new-msg'>
                        <div class='top'>
                            <div class='close-new-msg'><i class="fas fa-times"></i></div>
                            New Message
                            <div class='send-new-msg'>send</div>
                        </div>
                        <div class='to'>To: <input type='text' placeholder='Search' /></div>
                        <div class='message'><input type='text' placeholder="Message body" /></div>
                    </div>
                </div>`;

        $('body').append($(pageHtml));
    }
}

window.onload = setup();

// toggle settings
//$('.settings-btn').bind('click', () => {
    //$('.dmWrapper .settings').toggleClass('open');
//})
var els = document.getElementsByClassName('settings-btn');
for (i=0; i<els.length; i++) {
    els[i].addEventListener('click', () => {
        var ele = document.querySelector('.dmWrapper .settings');
        if (ele.classList.contains('open')) {
            ele.classList.remove('open');
        }
        else {
            ele.classList.add('open');
        }
    })
}


// change bg color
//$('.change-color').bind('click', (event) => {
    //$('.dmWrapper .right').css('background-color', $(event.target).css('background-color'));
//})
var els = document.getElementsByClassName('change-color');
for (i=0; i<els.length; i++) {
    els[i].addEventListener('click', (event) => {
        document.querySelector('.dmWrapper .right').style.backgroundColor = event.target.style.backgroundColor;
        console.log(event.target.style.backgroundColor)
        if (event.target.style.backgroundColor == 'white') {
            document.querySelector('.dmWrapper .right').classList.add('white-bg');
        }
        else {
            document.querySelector('.dmWrapper .right').classList.remove('white-bg');
        }
    })
}

// close new message
//$('.close-new-msg').bind('click', () => {
    //$('.new-msg-cont').hide();
//})
document.querySelector('.close-new-msg').addEventListener('click', () => {
    document.querySelector('.new-msg-cont').style.display = 'none';
})

// open new message 
//$('.write-msg-btn').bind('click', () => {
    //$('.new-msg-cont').show();
//})
document.querySelector('.write-msg-btn').addEventListener('click', () => {
    document.querySelector('.new-msg-cont').style.display = '';
})

// open message
$('.node-radio').bind('click', () => {
    document.querySelector('.right .no-msg').style.display = 'none';
})

function newMessageTo(name) {
    $('.cont').show();
    console.log(name)

    $('.dmWrapper').animate({
        marginTop: '0',
        opacity: '1'
    }, 100, () => {
        $('.new-msg-cont').show();
        $('.new-msg-cont .to input').val(name);
        $('.new-msg-cont .message input').focus();
    });

    $('.repldmBtn .fa-paper-plane').toggle();

    // delete the profile prompt thingy
    if ($('.user-hover-card-anchor').length !== 0) {
        $('.user-hover-card-anchor').hide();
    }
}


