var server_name = document.location.origin;
var nickname = "";
var server;

$(document).ready(function() {
  $("#nickname").focus();
  $("#nickname").focusout(function() {
    nickname = $("#nickname").val();
  });
  $("#enter").click(function() {
  	if (nickname != "") {
  	  server = io.connect(server_name);
      console.log('Client: Connecting to chatroom server');
      server.on('ss-confirmation', function(data) {
        console.log('Connected to chatroom server');
	      server.emit('nickname', {text: nickname})
	      server.on('connect-request', function(data) {
	        if(data.text == "Accepted") {
	  	      console.log("Connected to chatrrom server");
	  	      $("#enter").prop("disabled", true);
	  	      $("#nickname").prop("disabled", true);
            $("#nickname").removeClass("selected");
	  	      $("#chatbox").prop("disabled", false);
	  	      $("#send").prop("disabled", false);
            $("#chatbox").addClass("selected");
            $("#chatbox").focus();
	  	      server.on('message', function(data) {
	  	    	  printMessage(data);
	  	      });
          }
      	  else {
      		  alert("Connection refused : Duplicate username");
      		  location.reload();
      	  }	
	      });
      });
  	}
  	else {
  	  alert("Enter valid nickname");
  	}
  });
  $("#send").click(function() {
    var msg = $("#chatbox").val();
    if(msg != "") {
      var wrap = {user: nickname, message: msg};
      console.log(wrap);
    	server.emit("message",wrap);
    }
    $("#chatbox").val('');
    $("#chatbox").focus();
  });
});

$(document).keypress( function(e) {
  if(e.which == 13) {
    if($("#enter").prop("disabled")) {
      $("#send").click();
    }
    else {
      nickname = $("#nickname").val();
      $("#enter").click();
    }
  }
});

function printMessage(data) {
	var newchat = document.createElement('div');
	var chatcontent = document.createTextNode(data.user + ": " + data.message + "\n");
	newchat.appendChild(chatcontent);
	document.getElementsByClassName("chatwindow")[0].appendChild(newchat);
	//console.log("Printing Message " + data.user + " ::: " + data.message);
	$('.chatwindow').scrollTop($('.chatwindow')[0].scrollHeight);
}