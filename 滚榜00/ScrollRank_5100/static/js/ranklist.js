size = 10;
beforeProbTdNum = 5;
problemNum = 0;
balloon = [
	'FF99CC',
	'FFFF00',
	'32CD32',
	'3399FF',
	'FF8C00',
	'9900CC',
	'FF0000',
	'FFCC00',
	'CC0066',
	'FFFAFA',

	];
color = [
	'FFFFFF',
	'999999',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'999999',
	];
medalNum = [
	[17, 51, 107, 150],
	[11, 31, 64, 90],
	[7, 21, 44, 61]
	];
// 164:114
// 0.5899

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

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]); return null;
}

function init(res) {
	// Group
	var group = 0;
	if(getUrlParam('group') == 'p') {
		group = 1;
		$("#group-p").addClass('active');
	}
	else if(getUrlParam('group') == 'n') {
		group = 2;
		$("#group-n").addClass('active');
	}
	else $("#group-all").addClass('active');
	// Name
	var nameType = 0;
	if(getUrlParam('name') == 'classname') {
		nameType = 1;
		$("#name-classname").addClass('active');
	}
	else $("#name-nickname").addClass('active');
	problemNum = res[0]['statuses'].length;
	for(var i=0; i<problemNum; ++i) {
		$("thead tr:last").append('<th class="single-prob"><a style="color: #' + color[i] + '; background: no-repeat center/36px url(&#39;data:image/svg+xml;utf8,&lt;svg class=&quot;icon&quot; width=&quot;200px&quot; height=&quot;200.00px&quot; viewBox=&quot;0 0 1024 1024&quot; version=&quot;1.1&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt;&lt;path fill=&quot;%23' + balloon[i] + '&quot; d=&quot;M512 935.724137C617.931034 741.517241 847.448276 556.021587 847.448276 370.758621 847.448276 185.495654 697.262966 35.310345 512 35.310345 326.737034 35.310345 176.551724 185.495654 176.551724 370.758621 176.551724 556.021587 423.724137 741.517241 512 935.724137Z&quot; /&gt;&lt;/svg&gt;&#39;);">' + String.fromCharCode(65+i) + '</a></th>');
	}
	var rank = 0;
	for(var i=0; i<res.length; ++i) {
		if(group==1 && !res[i]['ispro']) continue;
		if(group==2 && res[i]['ispro']) continue;
		rank++;
		var medal = 0;
		if(group != 0) {
			for(var j=0; j<medalNum[group].length; ++j) {
				if(rank <= medalNum[group][j]) {
					medal = j+1;
					break;
				}
			}
		}
		$("tbody").append('<tr></tr>');
		$("tbody tr:last").append('<td class="single-rank medal-' + medal + '">' + rank + '</td>');
		$("tbody tr:last").append('<td class="single-group">' + (res[i]['ispro'] ? '专' : '非') + '</td>');
		$("tbody tr:last").append('<td class="single-name">' + res[i]['nickname'] + '</td>');
		$("tbody tr:last td:last").text($("tbody tr:last td:last").html().split('<br>')[nameType]);
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
}

$(function() {
	$.ajax({
		// url: 'ranklist_api.php',
		url: 'ranklist.json',
		dataType: 'json',
		timeout: 1000,
		cache: false,
		success: function (res) {
			init(res);
		}, error: function () {}
	});
	$("#group a").click(function() {
		window.location.href = '?' + $(this).attr("data-url") + '&' + $("#name .active").attr("data-url");
	});
	$("#name a").click(function() {
		window.location.href = '?' + $("#group .active").attr("data-url") + '&' + $(this).attr("data-url");
	});
});
