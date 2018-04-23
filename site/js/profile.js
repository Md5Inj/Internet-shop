user = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'getUserRecord', false);
    xhr.send();
    return xhr.responseText; 
}

$(document).ready(function() {
	$("#editForm").fadeOut(0);

    $("#closeEdit").click(function() {
        $("#editForm").fadeOut(200);
    });


	var userObj = JSON.parse(user());
	$('#eInfo').text(userObj.login);
	$('#pwdInfo').text(userObj.password);
	$('#fioInfo').text(userObj.fio);
	$('#addrInfo').text(userObj.address);
	$('#phoneInfo').text(userObj.phone);

	$('#emailEF').val(userObj.login);
	$('#passwordEF').val(userObj.password);
	$('#fioEF').val(userObj.fio);
	$('#addrEF').val(userObj.address);
	$('#phoneEF').val(userObj.phone);

	$('#editInfo').click(function() {
		$('#editForm').fadeIn(200);
	});

	$('#save').click(function() {
		$.post("/updateUserInfo", { 
			"login": $('#emailEF').val(), 
            "password": $('#passwordEF').val(),
            "fio": $('#fioEF').val(),
            "address": $('#addrEF').val(),
            "phone": $('#phoneEF').val()
            }, function(data) {
            	console.log(data);
            });
		$('#editForm').fadeOut(200);
	})
});