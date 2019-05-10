size = 10;
beforeProbTdNum = 4;
problemNum = 0;
color = [
	'FF66CC',
	'FFD700',
	'32CD32',
	'0066FF',
	'FF8C00',
	];

function socket_init() {
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function () {
        socket.emit('init', '');
    });
    socket.on('init', function (result) {
        init(result);
    });
    socket.on('update', function (result) {
        update(result);
    });
}

function socket_init_2(rid) {
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function () {
        socket.emit('init', rid);
    });
    socket.on('init', function (result) {
        init(result);
    });
    socket.on('update', function (result) {
        update(result);
    });
}

function init(res) {
	problemNum = res[0]['statuses'].length;
	for(var i=0; i<problemNum; ++i) {
		$("thead tr:last").append('<th class="single-prob"><a href="" style="background: no-repeat center/36px url(&#39;data:image/svg+xml;utf8,&lt;svg class=&quot;icon&quot; width=&quot;200px&quot; height=&quot;200.00px&quot; viewBox=&quot;0 0 1024 1024&quot; version=&quot;1.1&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt;&lt;path fill=&quot;%23' + color[i] + '&quot; d=&quot;M512 935.724137C617.931034 741.517241 847.448276 556.021587 847.448276 370.758621 847.448276 185.495654 697.262966 35.310345 512 35.310345 326.737034 35.310345 176.551724 185.495654 176.551724 370.758621 176.551724 556.021587 423.724137 741.517241 512 935.724137Z&quot; /&gt;&lt;/svg&gt;&#39;);">' + String.fromCharCode(65+i) + '</a></th>');
	}
	for(var i=0; i<res.length; ++i) {
		$("tbody").append('<tr></tr>');
		$("tbody tr:last").append('<td class="single-rank">' + res[i]['rank'] + '</td>');
		$("tbody tr:last").append('<td class="single-name">' + res[i]['nickname'] + '</td>');
		$("tbody tr:last").append('<td class="single-solved">' + res[i]['solved'] + '</td>');
		$("tbody tr:last").append('<td class="single-time">' + parseInt(Math.floor(res[i]['time']/60)) + '</td>');
		for(var j=0; j<res[i]['statuses'].length; ++j) {
			var content = '';
			var resultClass = '';
			if(res[i]['statuses'][j]['result']=='AC' || res[i]['statuses'][j]['result']=='FB')
				content = res[i]['statuses'][j]['attempted'] + '/' + parseInt(Math.floor(res[i]['statuses'][j]['time']/60));
			else if(res[i]['statuses'][j]['result']=='F' || res[i]['statuses'][j]['result']=='?')
				content = res[i]['statuses'][j]['attempted'];
			if(res[i]['statuses'][j]['result'] == 'AC')
				resultClass = ' accepted';
			if(res[i]['statuses'][j]['result'] == 'FB')
				resultClass = ' fb';
			if(res[i]['statuses'][j]['result'] == 'F')
				resultClass = ' failed';
			if(res[i]['statuses'][j]['result'] == '?')
				resultClass = ' pending';
			$("tbody tr:last").append('<td class="single-prob' + resultClass + '">' + content + '</td>');
		}
	}
	usernameInitialize();
	$("#toggle-nick_name").click(function () {
		showNickname();
	});
	$("#toggle-class_name").click(function () {
		showClassName();
	});
	var atype = window.location.hash.substr(1);
	if(atype == 'class_name') showClassName();
	else showNickname();
}

nick_name = new Array();
class_name = new Array();

function usernameInitialize() {
	$("tbody tr").each(function (index, element) {
		var tmp = $(element).children("td").eq(1).html().split('<br>');
		nick_name[index] = tmp[0];
		if(tmp.length < 2) class_name[index] = '';
		else class_name[index] = tmp[1].substr(1, tmp[1].length-2);
	});
}

function showNickname() {
	$("#toggle-class_name").removeClass("active");
	$("#toggle-nick_name").addClass("active");
	$("tbody tr").each(function (index, element) {
		$(element).children("td").eq(1).text(nick_name[index]);
		$(element).children("td").eq(1).animate({opacity: "hide"}, 0);
		$(element).children("td").eq(1).animate({opacity: "show"}, 500);
	});
}

function showClassName() {
	$("#toggle-nick_name").removeClass("active");
	$("#toggle-class_name").addClass("active");
	$("tbody tr").each(function (index, element) {
		$(element).children("td").eq(1).text(class_name[index]);
		$(element).children("td").eq(1).animate({opacity: "hide"}, 0);
		$(element).children("td").eq(1).animate({opacity: "show"}, 500);
	});
}

// $(function() {
// 	$.ajax({
// 		// url: 'ranklist_api.php',
// 		url: 'ranklist.json',
// 		dataType: 'json',
// 		timeout: 1000,
// 		cache: false,
// 		success: function (res) {
// 			init(res);
// 		}, error: function () {}
// 	});
// });