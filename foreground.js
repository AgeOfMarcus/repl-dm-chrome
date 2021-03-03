var _first_load = true;

const socket = io("https://repldm.dupl.repl.co");

var version = chrome.runtime.getManifest().version;

// READ ME or ur gay lol

// to set notification badge all u gotta do is $('repldmBtn').attr('notifications', "[insert number here]")
// if the notifications attribute doesnt exist, or has no value or the value of 0, the badge auto hides so dw about hiding it, and the attribute value auto sets the badge value too so its super easy.
// also, i think the number it shows should be the number of unread chats, not the number of unread messages. so if you and some other guy sent me a few msgs, it would show 2 for 2 unread chats.

// showing users online: just add class "online" to the node lol


// new messages icons: to set status, give the .mid (child of .node) the attr called status - values are sent, received, read & opened

socket.on('new message', (res) => {
    let msg = res.message;
    socket.emit('recv', {auth: authToken, token: res.token});

    if (msg.from in _msg_cache) {
        _msg_cache[msg.from].push(msg);
        _msg_cache[msg.from] = _msg_cache[msg.from].slice().sort((a, b) => { (a.time < b.time) ? 1 : -1 });
    } else {
        _msg_cache[msg.from] = [msg];
    }

    if ($('.chat .top span').text() == msg.from) {
        if (document.getElementById(`msg-${msg.id}`)) {
            return; 
        }

        $('.chat .box').append($(`
            <div id="msg-${msg.id}" class='msg-node received'>
                    ${renderText(msg.body)}
                    <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(msg))}'/>
            </div>
        `))

        var box = $('.chat .box'); // scroll to bottom of chat
        box.scrollTop(box.prop('scrollHeight'));
    } else {
        if (_notify_perm && _settings.notifications) {
            getProfilePicture(msg.from, (src) => {
                var notif = new Notification(`${msg.from} sent you a message`, {
                    body: msg.body,
                    icon: src,
                    silent: true
                });

                if (_settings.sound) {
                    // sound effect
                    chrome.runtime.sendMessage(
                        "play sound"
                    );
                }
            })            
        }
    }
})

socket.on('show mark read', (res) => {
    let msg = res.message;
    socket.emit('recv', {auth: authToken, token: res.token});
    $('.read').removeClass('read');
    $(`#msg-${msg.id}`).addClass('read');

    var box = $('.chat .box'); // scroll to bottom of chat
    box.scrollTop(box.prop('scrollHeight'));
})

var _msg_node_increment = 0;
var _msg_cache = {};

function getMessages(user, callback, older_than=null, newer_than=null, limit=null) {
    // returns a list of messages
    data = {
        auth: authToken,
        user: user
    }
    if (older_than) data['older_than'] = older_than;
    if (limit) data['limit'] = limit;
    if (newer_than) data['newer_than'] = newer_than;

    socket.emit('get messages', data, (r) => { callback(r.result) })
}

function sendMessage(to, body, callback) {
    /*
    socket returns a message object, which by default is passed to the 
    parseMessage function and added to the html
    */
    socket.emit('send message', {
        auth: authToken, // global object set on auth
        to: to,
        body: body
    }, (r) => { callback(r.result) })
}

function getProfilePicture(user, callback) {
    // returns URL or default pfp if user not found
    socket.emit('pfp', {
        auth: authToken,
        username: user
    }, (r) => { callback(r.result) })
}

function listUnread(callback) {
    // returns dict {username: unreadMessages[int]}
    socket.emit('get unread', {
        auth: authToken
    }, (r) => { callback(r.result) })
}

function markRead(ids, callback, read=true) {
    // returns list of ids which the operation was successful
    socket.emit('mark read', {
        auth: authToken,
        ids: ids,
        read: read
    }, (r) => { callback(r.result) })
}

function getConvos(callback) {
    socket.emit('get conversations', {auth: authToken}, (r) => { callback(r.result) })
}


function init() {
    var first = true;
    listUnread((unread) => {
        $('repldmBtn').attr('notifications', `${Object.keys(unread).length}`);
        getConvos((users) => {
            for (const [user, recent] of Object.entries(users)) {
                getProfilePicture(user, (pfp) => {
                    msgsDiv = $('.left-msgs');
                    if (recent.from == authToken.username) { // from me
                        if (recent.read) { // they opened it
                            status = "read"
                        } else { // sent successfully to them
                            status = "sent"
                        }
                    } else { // to me
                        if (recent.read) { // i've read it
                            status = "opened"
                        } else { // i havent - aka unread
                            status = "received"
                        }
                    } 

                    // because css is stupid as hell we need to have the read class on the last message that has been read ONLY so cant just add read to every message thats been read smh... ive already added the code to remove the class read when you get pinged for a new msg being read

                    msgsDiv.append($(`
                        <input type='radio' class='node-radio' id='msg-${_msg_node_increment}' name='msg' />
                        <label class='node' for='msg-${_msg_node_increment}'>
                            <div class='pfp'>
                                <img src='${pfp}' />
                            </div>
                            <div class='mid' status='${status}' id="status-${user}"> 
                                <div class='name'>${user}${['rafrafraf', 'MarcusWeinberger'].includes(user) ? "<div class='badge' style='position: absolute; right: -2px; transform: translate(100%, -10%);'><img src='https://i.imgur.com/6D1IhQM.png' /></div>" : ''}</div>
                                <div class='icons' date='${time_ago(new Date(recent.time))}'>  
                                    <i class="far fa-paper-plane read-icon"></i>
                                    <i class="fas fa-paper-plane sent-icon"></i>
                                    <i class="far fa-comment-alt opened-icon"></i>
                                    <i class="fas fa-comment-alt received-icon"></i>
                                </div>
                            </div>
                        </label>
                    `));

                    $('.node-radio').bind('click', (event) => {
                        document.querySelector('.right .no-msg').style.display = 'none';
                        $(`label[for=${event.target.id}]`).addClass('seen');
                        loadConvo($(`label[for=${event.target.id}`).find('div .name').text()); // loadConvo(username)
                    })
                    
                    if (first) {
                        $('.loading-msgs').hide();
                        first = false;
                    }

                    _msg_node_increment++;
                })
            }
        })
    })
}

function renderText(text) {
    const userRe = /(?<![\w@])@([\w@]+(?:[.!][\w@]+)*)/g;
    return sanitizeHtml(marked(text.replace(userRe, '<a href="https://repl.it/$&">$&</a>')), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    });
}

function displaySentMessage(message) {
    if (message.to in _msg_cache) {
        _msg_cache[message.to].push(message)
    } else {
        _msg_cache[message.to] = [message];
    }

    _msg_cache[message.to] = _msg_cache[message.to].slice().sort((a, b) => { (a.time < b.time) ? 1 : -1 });

    if ($('.chat .top span').text() == message.to) {
        if (document.getElementById(`msg-${message.id}`)) {
            return; 
        }

        $('.chat .box').append($(`
            <div id="msg-${message.id}" class='msg-node sent'>
                    ${renderText(message.body)}
                    <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(message))}'/>
            </div>
        `))
    }

    var box = $('.chat .box'); // scroll to bottom of chat
    box.scrollTop(box.prop('scrollHeight'));
}

function checkReadStatus(user) {
    var ids = [];
    var elms = Array.from(document.getElementsByClassName('msg-node'));
    elms.forEach((el) => {
        //TODO: check if element is in viewport
        try {
            var msg = JSON.parse(atob(el.getElementsByClassName('hidden-input')[0].value));
            if (!(msg.read) && !(msg.from == authToken.username)) {
                ids.push(msg.id);
            }
        } catch(err) {
            console.log('error checking read status. err:', err, 'elm:', el);
        }
    })
    if (ids.length > 0) {
        markRead(ids, (res) => {
            console.log("Marked as read:", res, 'from:', ids);
        })
    }

    recent = elms[elms.length - 1]
    if (recent.from == authToken.username) { // from me
        if (recent.read) { // they opened it
            status = "read"
        } else { // sent successfully to them
            status = "sent"
        }
    } else { // to me
        if (recent.read) { // i've read it
            status = "opened"
        } else { // i havent - aka unread
            status = "received"
        }
    }

    $(`#status-${user}`).attr('status', status);
}

function loadPrevious() { // dis no work ------------------------------------------------------------------ 
    user = $('.chat .top span').text();
    var html = '';
    if (user in _msg_cache) {
        getMessages(user, (messages) => {
            _msg_cache[user].unshift(...messages) // *messages
            _msg_cache[user] = _msg_cache[user].slice().sort((a, b) => { (a.time < b.time) ? 1 : -1 });
            //$('.chat .box').clear();

            _msg_cache[user].forEach((item, index) => {
                if ((item.from == authToken.username) && (item.read)) {
                    msgClass = 'sent read'
                } else if (item.from == authToken.username) {
                    msgClass = 'sent';
                } else {
                    msgClass = 'received'
                }

                if (document.getElementById(`msg-${item.id}`)) {
                    return; 
                }
                var html = html + `
                    <div id="msg-${item.id}" class='msg-node ${msgClass}'>
                        ${renderText(item.body)}
                        <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(item))}'/>
                    </div>
                `;

                /*
                $('.chat .box').append($(`
                    <div id="msg-${item.id}" class='msg-node ${msgClass}'>
                        ${renderText(item.body)}
                        <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(item))}'/>
                    </div>
                `)) //TODO: markdown and filter xss, add time to message

                var box = $('.chat .box');
                box.scrollTop(box.prop('scrollHeight'));
                */
            })
            $('.chat .box').html(html + $('.chat .box').html());
            console.log(html)
        }, older_than=_msg_cache[user][0].time)
    }
}

function loadConvo(user) {
    if ($('.chat .top span').text() == user) {
        return;
    }

    $('.chat .top span').text(user);
    $('.chat .top span').off('click');
    $('.chat .top span').click(() => {
        window.open(`/@${user}`, '_blank');
    })
    getProfilePicture(user, (src) => {
        $('.chat .top .chat-img').attr('src', src);
    });

    // showdupl badge
    if (['rafrafraf', 'MarcusWeinberger'].includes(user)) {
        $('.chat .top .badge').show();
    }
    else {
        $('.chat .top .badge').hide();
    }
    

    $('.chat .box').empty() // we gotta clear g

    if (user in _msg_cache) {
        _msg_cache[user] = _msg_cache[user].slice().sort((a, b) => { (a.time < b.time) ? 1 : -1 });
        _msg_cache[user].forEach((item, index) => {
            if ((item.from == authToken.username) && (item.read)) {
                msgClass = 'sent read'
            } else if (item.from == authToken.username) {
                msgClass = 'sent';
            } else {
                msgClass = 'received'
            }

            if (document.getElementById(`msg-${item.id}`)) {
                return; 
            }

            $('.chat .box').append($(`
                <div id="msg-${item.id}" class='msg-node ${msgClass}'>
                    ${renderText(item.body)}
                    <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(item))}'/>
                </div>
            `)) //TODO: markdown and filter xss, add time to message

            var box = $('.chat .box'); // scroll to bottom of chat
            box.scrollTop(box.prop('scrollHeight'));
        })

        getMessages(user, (messages) => {
            _msg_cache[user].push(...messages) // *messages

            _msg_cache[user] = _msg_cache[user].slice().sort((a, b) => { (a.time < b.time) ? 1 : -1 });

            if ($('.chat .top span').text() != user) return;
            $('.chat .box').empty();
           _msg_cache[user].forEach((item, index) => {
                if ((item.from == authToken.username) && (item.read)) {
                    msgClass = 'sent read'
                } else if (item.from == authToken.username) {
                    msgClass = 'sent';
                } else {
                    msgClass = 'received'
                }

                if (document.getElementById(`msg-${item.id}`)) {
                    return; 
                }

                $('.chat .box').append($(`
                    <div id="msg-${item.id}" class='msg-node ${msgClass}'>
                        ${renderText(item.body)}
                        <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(item))}'/>
                    </div>
                `)) //TODO: markdown and filter xss, add time to message

                var box = $('.chat .box'); // scroll to bottom of chat
                box.scrollTop(box.prop('scrollHeight'));
            })
        }, newer_than=_msg_cache[user][_msg_cache[user].length - 1].time)
    } else { // fuck you rafi this is the better way of formatting if/else
        getMessages(user, (messages) => {
            _msg_cache[user] = messages.sort((a, b) => { (a.time < b.time) ? 1 : -1 });
            if ($('.chat .top span').text() != user) return;
            $('.chat .box').empty();
            _msg_cache[user].forEach((item, index) => {
                if ((item.from == authToken.username) && (item.read)) {
                    msgClass = 'sent read'
                } else if (item.from == authToken.username) {
                    msgClass = 'sent';
                } else {
                    msgClass = 'received'
                }

                if (document.getElementById(`msg-${item.id}`)) {
                    return; 
                }

                $('.chat .box').append($(`
                    <div id="msg-${item.id}" class='msg-node ${msgClass}'>
                        ${renderText(item.body)}
                        <input class='hidden-input' type="hidden" value='${btoa(JSON.stringify(item))}'/>
                    </div>
                `)) //TODO: markdown and filter xss, add time to message

                var box = $('.chat .box'); // scroll to bottom of chat
                box.scrollTop(box.prop('scrollHeight'));
            })
        })
    }
    setTimeout(() => { checkReadStatus(user) }, 1500);
}

// https://stackoverflow.com/a/12475270/8291579
function time_ago(time) {

  switch (typeof time) {
    case 'number':
      break;
    case 'string':
      time = +new Date(time);
      break;
    case 'object':
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }
  var time_formats = [
    [60, 'seconds', 1], // 60
    [120, '1 minute ago', '1 minute from now'], // 60*2
    [3600, 'minutes', 60], // 60*60, 60
    [7200, '1 hour ago', '1 hour from now'], // 60*60*2
    [86400, 'hours', 3600], // 60*60*24, 60*60
    [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
    [604800, 'days', 86400], // 60*60*24*7, 60*60*24
    [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
    [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
    [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
    [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
    [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  var seconds = (+new Date() - time) / 1000,
    token = 'ago',
    list_choice = 1;

  if (seconds == 0) {
    return 'Just now'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  var i = 0,
    format;
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
}
 //test
function authed() {
    const url = chrome.runtime.getURL('.git/FETCH_HEAD');
    fetch(url).then((resp) => {
        resp.text().then((version) => {
            $.getJSON('https://api.github.com/repos/AgeOfMarcus/repl-dm-chrome/commits', (res) => {
                if (version.split('\t')[0] != res[0].sha) {
                    console.log(version, res[0].sha)
                    if (_notify_perm && _settings.notifications) {
                        var notif = new Notification(`An update is available`, {
                            body: `Click to download new version`,
                            silent: true
                        });
                        
                        notif.onclick = () => {
                            window.open(`https://github.com/AgeOfMarcus/repl-dm-chrome/archive/master.zip`);
                            new Notification(`Archive downloaded`, {
                                body: `Unzip the file and install it to continue`,
                                silent: true
                            });
                        };

                        if (_settings.sound) {
                            // sound effect
                            chrome.runtime.sendMessage(
                                "play sound"
                            );
                        }        
                    }
                }
            })
        })
    })
    console.log('authed')
    
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

    function setup() {
        // add message button to profile page
        setTimeout(() => {
            const profilePageUser = document.querySelector(".profile-username-label").childNodes[2].data; //get username
            
            if (authToken.username != profilePageUser && $('.profile-username-label').length !== 0 && $('.message-btn').length == 0) {
                $('<div class="message-btn">message</div>').insertAfter('.profile-username-label');

                document.querySelector('.message-btn').addEventListener('click', (event) => {
                    newMessageTo(event.target.previousElementSibling.innerText.split(" ")[0]);
                })
            }
        }, 200)

        // add repldm button 
        if ($('.repldmBtn').length == 0) {
            // dark theme check
            var dark;
            if ($('header').css('background-color') == "rgb(29, 35, 51)") {
                dark = 'darktheme';
            }
            else {
                dark = '';
            }
            var html = `
            <div class='repldmBtn ${dark}'>
                <i class="fas fa-paper-plane" style='display: none;'></i>
                <i class="far fa-paper-plane"></i>
                <div class='label'>repl DM</div>
            </div>`;
            $(html).insertAfter('.scroll-container .new-repl-cta');

            $('.repldmBtn').click(() => {
                if (_first_load) {
                    init();
                    globalThis._first_load = false;
                }
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
                                    <div class='loading-msgs'><img src='https://i.imgur.com/RlSKElx.png' /></div>
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
                                        <div class='option'>
                                            Font size
                                            <div class='change-size' style='font-size: 12px'>aA</div>
                                            <div class='change-size' style='font-size: 16px'>aA</div>
                                            <div class='change-size' style='font-size: 20px'>aA</div>
                                        </div>
                                        <div class='option'>
                                            Notifications
                                            <input type='checkbox' class='change-notifications' />
                                        </div>
                                        <div class='option'>
                                            Notification Sound
                                            <input type='checkbox' class='change-sound' />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- resizer -->
                            <div class='resizer'></div>

                            <!-- right -->
                            <div class='right white-bg'> 
                                <div class='no-msg'>
                                    <p class='now-with'>Now with markdown (and image) <br>support!</p>
                                    <img style='width: 100px; height: auto; margin-top: -30px;' src='https://chrome-extension.rafrafraf.repl.co/dupl.png' />
                                    <span style='margin-top: -15px; font-weight: 900; font-family: system-ui;'>V${version}</span>
                                    <span style='color: rgba(255,255,255,0.9); font-size: 30px; font-weight: 100; margin: 10px 0;'>Direct messaging</span>
                                    <span style='color: rgba(255,255,255,0.95); font-size: 14px;'>Talk to anyone on replit.</span>
                                </div>

                                <!-- chat -->
                                <div class='chat'> 
                                    <div class='top'>
                                        <img class='chat-img' src='https://storage.googleapis.com/replit/images/1601821666159_c0dcdf3d27cfe49d4ef1be6491fe5173.jpeg' />
                                        <span>Name</span>
                                        <div class='badge' style='display: none;'><img src='https://i.imgur.com/6D1IhQM.png' /></div>
                                    </div>
                                    <div class='wrapper'>
                                        <!-- image drop -->
                                        <div class='image-drop' style='margin-top: 200%;'>
                                            <div class='image-drop-preview'>drag file here</div>
                                        </div>

                                        <!-- load old msgs -->
                                        <div class='load-old-msgs'>
                                            <i class="fas fa-spinner"></i>
                                        </div>

                                        <!-- msgs -->
                                        <div class='box'>
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
                            <div class='message'><textarea type='text' placeholder="Message body" rows='15' cols='30' style='border: none'></textarea></div>
                        </div>
                    </div>`;

            $('body').append($(pageHtml));

            // scroll script
            $('.chat .box').on('scroll', () => {
                var scrollTop = $('.chat .box').scrollTop();
                if (scrollTop <= 0) {
                    loadPrevious();
                    $('.load-old-msgs').animate({
                        marginTop: 0
                    }, 200);
                    console.log('loading old messages')
                }
            });

            // resizer script
            var up = false;
            var leftW = 300;
            $('.dmWrapper .resizer').bind('mousedown', (ev) => {
                up = true;
                var startPos = ev.pageX;
                $('body').css({
                    cursor: 'grabbing',
                    userSelect: 'none'
                });
                var rightW = $('.dmWrapper .right').width();
                $('body').mousemove((e) => {
                    var tmp = (e.pageX - ev.pageX);
                    var newW = leftW + tmp;
                    if ((newW >= 150) && (rightW - tmp) >= 360) {
                        $('.dmWrapper .left').width(newW);
                    }
                })
            })
            $('body').bind('mouseup', () => {
                if (up) {
                    up = false;
                    $('body').off('mousemove');
                    leftW = $('.dmWrapper .left').width();
                    $('body').css({
                        cursor: '',
                        userSelect: ''
                    });
                }
            })

            window.addEventListener('paste', (event) => {
                var items = (event.clipboardData || event.originalEvent.clipboardData).items;
                for (index in items) {
                    var item = items[index];
                    if (item.kind === 'file') {
                        var file = item.getAsFile();
                        var filename = file.name;
                        /*Get File Extension*/
                        var ext = filename.split('.').reverse()[0].toLowerCase();
                        /*Check Image File Extensions*/
                        if (jQuery.inArray(ext, ['jpg', 'png', 'gif', 'jpeg']) > -1) {
                            /*Create FormData Instance*/
                            var data = new FormData();
                            data.append('image', file);
                            /*Request Ajax With File*/
                            $.ajax({
                                url: 'https://i.marcusj.tech/api/upload',
                                data: data,
                                type: 'POST',
                                processData: false,
                                contentType: false,
                                success: function (response) {
                                    var body = $('input.msg').val() + `![img](${response.url})`;
                                    $('input.msg').val(body);
                                }
                            })
                        } 
                    }
                }
            })

            // font size
            chrome.storage.local.get(['fontsize'], (res) => { 
                if (typeof res.fontsize === 'undefined') {
                    chrome.storage.local.set({'fontsize': '16px'});
                }
                else {
                    $('.dmWrapper .right .box').removeClass('small');
                    $('.dmWrapper .right .box').removeClass('large');

                    if (res.fontsize == '12px') { // small
                        $('.dmWrapper .right .box').addClass('small');
                    }
                    else if (res.fontsize == '20px'){ // large
                        $('.dmWrapper .right .box').addClass('large');
                    }
                }
            })
    
            // background color 
            chrome.storage.local.get(['background'], (res) => { 
                if (typeof res.background === 'undefined') {
                    chrome.storage.local.set({'background': 'white'});
                }
                else {
                    $('.dmWrapper .right').css('background-color', res.background);
                
                    if (res.background == 'white') {
                        document.querySelector('.dmWrapper .right').classList.add('white-bg');
                        $('.dmWrapper').attr('theme', 'white'); // white
                    }
                    else {
                        document.querySelector('.dmWrapper .right').classList.remove('white-bg');
                        if (res.background == 'rgb(34, 85, 221)') { // blue
                            $('.dmWrapper').attr('theme', 'blue');
                        }
                        else if (res.background == 'rgb(37, 211, 102)') { // green
                            $('.dmWrapper').attr('theme', 'green');
                        }
                        else if (res.background == 'rgb(222, 96, 82)') { // red
                            $('.dmWrapper').attr('theme', 'red');
                        }
                        else if (res.background == 'rgb(242, 236, 58)') { // yellow
                            $('.dmWrapper').attr('theme', 'yellow');
                        }
                    }
                }
            })
            chrome.storage.local.get(['settings'], (res) => {
                if (res.settings) {
                    // notifications
                    if (res.settings.notifications) {
                        document.getElementsByClassName('change-notifications')[0].checked = true;
                    }
                    // notifications sound
                    if (res.settings.sound) {
                        document.getElementsByClassName('change-sound')[0].checked = true;
                    }
                }
                else {
                    document.getElementsByClassName('change-notifications')[0].checked = true;
                    document.getElementsByClassName('change-sound')[0].checked = true;
                }
            })
        }
    }

    window.onload = setup();

    // toggle settings
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

    // change font size
    var els = document.getElementsByClassName('change-size');
    for (i=0; i<els.length; i++) {
        els[i].addEventListener('click', (event) => {
            $('.dmWrapper .right .box').removeClass('small');
            $('.dmWrapper .right .box').removeClass('large');

            if (event.target.style.fontSize == '12px') { // small
                $('.dmWrapper .right .box').addClass('small');
            }
            else if (event.target.style.fontSize == '20px'){ // large
                $('.dmWrapper .right .box').addClass('large');
            }
            // font size 
            chrome.storage.local.set({'fontsize': event.target.style.fontSize});

        })
    }

    // change bg color
    var els = document.getElementsByClassName('change-color');
    for (i=0; i<els.length; i++) {
        els[i].addEventListener('click', (event) => {
            document.querySelector('.dmWrapper .right').style.backgroundColor = event.target.style.backgroundColor;
            if (event.target.style.backgroundColor == 'white') {
                document.querySelector('.dmWrapper .right').classList.add('white-bg');
                $('.dmWrapper').attr('theme', 'white');
            }
            else {
                document.querySelector('.dmWrapper .right').classList.remove('white-bg');
            }

            if (event.target.style.backgroundColor == 'rgb(34, 85, 221)') { // blue
                $('.dmWrapper').attr('theme', 'blue');
            }
            else if (event.target.style.backgroundColor == 'rgb(37, 211, 102)') { // green
                $('.dmWrapper').attr('theme', 'green');
            }
            else if (event.target.style.backgroundColor == 'rgb(222, 96, 82)') { // red
                $('.dmWrapper').attr('theme', 'red');
            }
            else if (event.target.style.backgroundColor == 'rgb(242, 236, 58)') { // yellow
                $('.dmWrapper').attr('theme', 'yellow');
            }
            // background color 
            chrome.storage.local.set({'background': event.target.style.backgroundColor});
        })
    }

    // change notifications
    var chn = document.getElementsByClassName('change-notifications')[0];
    chn.addEventListener('change', () => {
        if ($(chn).is(':checked')) {
            _settings.notifications = true;
        }
        else {
            _settings.notifications = false;
        } 
        chrome.storage.local.set({'settings': _settings});
    })
    
    // change notif sound
    var chs = document.getElementsByClassName('change-sound')[0];
    chs.addEventListener('change', () => {
        if ($(chs).is(':checked')) {
            _settings.sound = true;
        }
        else {
            _settings.sound = false;
        } 
        chrome.storage.local.set({'settings': _settings});
    })

    // close new message
    document.querySelector('.close-new-msg').addEventListener('click', () => {
        document.querySelector('.new-msg-cont').style.display = 'none';
    })

    // open new message 
    document.querySelector('.write-msg-btn').addEventListener('click', () => {
        document.querySelector('.new-msg-cont').style.display = '';
    })

    // open message
    $('.node-radio').bind('click', (event) => {
        document.querySelector('.right .no-msg').style.display = 'none';
        loadConvo($(`label[for=${event.target.id}`).find('div .name').text()); // loadConvo(username)
    })
    
    // send msg to user
    document.querySelector('.send-new-msg').addEventListener('click', () => {
        document.querySelector('.new-msg-cont').style.display = '';
        loadConvo($('.new-msg .to input').val());
        sendMessage($('.new-msg .to input').val(), $('.new-msg .message textarea').val(), (msg) => {
            displaySentMessage(msg);
        })
        $('.new-msg .to input').val('');
        $('.new-msg .message textarea').val('');
        document.querySelector('.new-msg-cont').style.display = 'none';
        msgsDiv = $('.left-msgs').empty();
        init();
    })

    document.querySelector('.msg').addEventListener('keyup', (event) => {
        if (event.key == 'Enter') {
            sendMessage($('.chat .top span').text(), $(event.target).val(), displaySentMessage)
            $(event.target).val('');
        }
    })

    function newMessageTo(name) {
        $('.repldmBtn .fa-paper-plane').toggle();
        $('.repldmBtn').toggleClass('open');
        $('.cont').show();

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

}

function getAuth() {
    $('.auth-wrapper').hide();
    var auth = $('#authTkn').val().split(':');
    var authObj = {
        username: auth[0],
        token: auth[1]
    }
    chrome.storage.sync.set({'auth': authObj}, (r) => { console.log("auth object stored") })
    chrome.storage.sync.set({'settings': {
        'notifications': true,
        'sound': true,
        'color': 'white',
        'font-size': '16px'
    }}, (r) => { console.log("default settings stored") })
    socket.emit('hello', {auth: authObj}, (r) => { console.log(r) })
    authed();
    init();
}

chrome.storage.sync.get(['auth'], (res) => { 
    console.log(res)
    if (Object.keys(res).length === 0) { // no auth object
        var authHtml = `<div class='auth-wrapper' style='display: none;'> 
            <div class='auth-cont'>
                <div class='close-auth'><i class="fas fa-times"></i></div>
                Please login with your repl account in order to use repl DM.
                <div class='auth-btn'>Authorize</div>
                <div id='auth-form'></div>
            </div>
        </div>`;

        $('body').append($(authHtml));

        document.querySelector('.auth-btn').addEventListener('click', () => {
            window.open("https://repldm.dupl.repl.co/auth", "_blank");

            document.getElementById('auth-form').innerHTML = `<input id='authTkn'></input><button id='get-auth-btn'>Authorize</button>`;

            document.getElementById('get-auth-btn').addEventListener('click', getAuth);
        })

        $('.auth-wrapper').fadeIn();

        $('.close-auth').click(() => {
            $('.auth-wrapper').hide();
        })
    }
    else {
        globalThis.authToken = res.auth;
        socket.emit('hello', {auth: res.auth}, (r) => { console.log(r) })
        chrome.storage.local.get(['settings'], (res) => {
            if (res.settings) {
                globalThis._settings = res.settings;
            } else {
                globalThis._settings = {
                    'notifications': true,
                    'sound': true,
                    'color': 'white',
                    'font-size': '16px'
                }
                chrome.storage.local.set({'settings': _settings}, (r) => { console.log("applied default settings") })
            }
        }) 
        authed();
    }
})

Notification.requestPermission().then((res) => {
    globalThis._notify_perm = res;
})

const _NOTIF_AUDIO = "data:audio/mpeg;base64,SUQzAwAAAAAPdlRJVDIAAABfAAAB//5zAG4AYQBwAGMAaABhAHQAIABuAG8AdABpAGYAaQBjAGEAdABpAG8AbgAgAHQAbwBuAGUAIAA1ADAANQA0ADkAMwA2ADYANAAwADgAMgA0ADYANAA5ADkAMAA5AENPTU0AAACKAAABWFhY//4AAP/+WAAyAEMAbwBuAHYAZQByAHQALgBjAG8AbQAsACAAQgBlAHMAdAAgAGMAbwBuAHYAZQByAHQAZQByACAAZgBvAHIAIABhAGwAbAAgAGYAaQBsAGUAIAB0AHkAcABlADoAIABBAHUAZABpAG8ALAAgAFYAaQBkAGUAbwAuAC4ALgBUU1NFAAAAHwAAAf/+ZgByAGUAOgBhAGMAIAB2ADEALgAxAC4AMgBiAENUT0MAAAALAAB0b2MAAwFjaHAwAENIQVAAAAAVAABjaHAwAAAAAAAAAAQsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5BkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYaW5nAAAADwAAACoAABdiERERERERERERWVlZWVlZWVldXV1dXV1dXWFhYWFhYWFhYWZmZmZmZmZmampqampqampvb29vb29vb29zc3Nzc3Nzc3h4eHh4eHh4g4ODg4ODg4ODi4uLi4uLi4uSkpKSkpKSkgAAADJMQU1FMy4xMDAEqgAAAAAAAAAANSAkAsBNAAHCAAAXYqXKIfEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+6BkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk8w/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
