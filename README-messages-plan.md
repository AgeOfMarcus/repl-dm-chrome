# **READ ME**. plan for handling messages:

## firstly, message caching
client requests messages first time and stores them all in local storage

new message recieved while client is offline, next time online:
requests server for the number of unread chats. (to display the number on the red notif icon thingy mabob)

when opening a chat:
1. first check if any chats are stored with this user whos chat client opened.
2. if so: if the username matches one of the ones that have an unread message with (which we requested from the server already),
then first display all messages stored in local storage, add a loading icon while requesting all the unread messages from this user.
3. when recieved, hide the loading anim, store the new messages in local storage.


**what we need**:
1. a server call that gets all the usernames from unread chats. (so if bob and sally sent me a few messages each, the server would just send the usernames "bob" and "sally"). this is important for the notification number and for my way of handling message caching

## next, handling message reads
each message stored in server should have a bool attribute "read".

if thats already in place then noice.

when requesting messages, add class read to all messages that have the attribute read (ez)

heres the tough part...
okay so when ur in chat with someone and you send a message...

my idea to solve this:
1. when client opens a chat and requests messages, the server should set the "read" attribute to True to all the messages requested.
2. the server checks if the username that sent the message is online (with session id's), if so send a socket thingy with the username of who they sent the message to saying read. lets call this socket emit "update_read" for now
3. when the client recieves the "update_read" socket emit, if he is in the chat with the user whos username was recieved, then add the class "read" to all messages in chat. **either way** update the local storage with all the messages sent attributes "read" to true.

that being said, its easier said than done but this shouldnt be too hard to implement
