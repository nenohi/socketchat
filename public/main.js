$(function() {
	var FADE_TIME = 150; // ms
	var TYPING_TIMER_LENGTH = 400; // ms
	var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];
	var noname = ['admin','system','システム','通知'];
	// Initialize variables
	var $window = $(window);
	var $usernameInput = $('.usernameInput'); // Input for username
	var $userroomInput = $('.userroomInput');
	var $messages = $('.messages'); // Messages area
	var $messagecolor = $('.msgcolor');
	var $titlelogin = $(".loginbtn");
	var $inputMessage = $('.inputMessage'); // Input message input box

	var $loginPage = $('.login.page'); // The login page
	var $chatPage = $('.chat.page'); // The chatroom page
	var colorcheck = new RegExp(/^#([\da-fA-F]{6}|[\da-fA-F]{3})$/)
	// Prompt for setting a username
	var username;
	var userroom;
	var socket = io();

	$userroomInput.val(getParam('room'));
	const setUsername = () => {
		username = cleanInput($usernameInput.val().trim());
		userroom = cleanInput($userroomInput.val().trim());
		// If the username is valid
		if (username) {
			$loginPage.fadeOut();
			$chatPage.show();
			$loginPage.off('click');
			// Tell the server your username
			(userroom) ? userroom = String(userroom) : userroom = String('1');
			checkname = socket.emit('login user', {username:username,userroom:userroom});
			console.log(username);
		}
	}
	const addChatMessage = (data, options) => {
		console.log(data)
		// Don't fade the message in if there is an 'X was typing'

	
		var $usernameDiv = $('<span class="username" title="ID:'+data.id+'"/>')
		.text(data.username)
		.css('color', getUsernameColor(data.username));
		var $messageBodyDiv = $('<span class="messageBody">')
		.text(data.message)
		.css('color',data.messagecolor)
		var $messageTime = $('<span class="time" title="'+data.day+'"/>')
		.text(data.time)
		var $messageDiv = $('<li class="message"/>')
		.data('username', data.username)
		.append($usernameDiv, $messageBodyDiv,$messageTime);
		addMessageElement($messageDiv);
	}
	const addMessageElement = (el) => {
		var $el = $(el);
		$messages.append($el);
		$messages[0].scrollTop = $messages[0].scrollHeight;
	}
	const cleanInput = (input) => {
		return $('<div/>').text(input).html();
	}
	// Gets the color of a username through our hash function
	const getUsernameColor = (username) => {
		// Compute hash code
		var hash =7;
		for (var i = 0; i < username.length; i++) {
		 hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
		// Calculate color
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	}
	
	// Keyboard events
	
	$window.keydown(event => {
		// Auto-focus the current input when a key is typed
		if (!(event.ctrlKey || event.metaKey || event.altKey)) {
		}
		// When the client hits ENTER on their keyboard
		if (event.which === 13) {
			inputtext = $inputMessage.val()
			inputtext = inputtext.replace(/\s+/g)
			if (username && inputtext !='') {
				sendMessage();
			} else if($userroomInput.val()==''){
				$userroomInput.focus();
			}else if(!username){
				setUsername();
			}
		}
	})
	$titlelogin.click(function(){
		inputtext = $('.inputMessage').val()
		inputtext = inputtext.replace(/\s+/g)
		if (username && inputtext !='') {
			sendMessage();
		} else if($usernameInput.val()==''){
			$usernameInput.focus();
		}else if($userroomInput.val()==''){
			$userroomInput.focus();
		}else if(!username){
			setUsername();
		}
	})
	$(".sendmsg").click(function(){
		if (username && inputtext !='') {
			sendMessage();
		}
	})

    const sendMessage = ()=>{
		msgcolorcheck = $messagecolor.val()
		if(colorcheck.test(msgcolorcheck)){
			msgcolor = $messagecolor.val().trim();
		}else if(colorcheck.test("#"+$messagecolor.val())){
			msgcolor = "#"+$messagecolor.val()
		}else{
			msgcolor = "#000"
		}
		
        data={
			message:cleanInput($inputMessage.val().trim()),
			messagecolor:msgcolor,
			messagesize:$('.msgsize').val(),
			messagearea:$('.msgarea').val(),
			messagespeed:$('.msgspeed').val(),
			username:username
		}
		//$inputMessage.val() = "";
		socket.emit('msgcreat',data)
		$inputMessage.val("");
    }
    socket.on('createdmsg',(data)=>{
        console.log(data);
        addChatMessage(data);
    })
    socket.on('disconnect',()=>{
		console.log('disconnected')
	})
	socket.on('reconnect' , ()=>{
		socket.emit('login user', {username:username,userroom:userroom});
		console.log('reconnected')
	})
})

function getParam(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}