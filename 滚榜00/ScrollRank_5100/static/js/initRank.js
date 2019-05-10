// Last Updated: 2017-11-19

size = 10;
scrollHeightSize = 57;
info = new Array();
extra = new Array();
cursor = -1;
focusIndex = -1;
eventID = 0;
beforeProbTdNum = 4;
problemNum = 0;
officialNum = 0;
balloon = [
	// '4B0082',
	// '32CD32',
	// 'FF99CC',
	// 'FF0000',
	// 'FFFAFA',
	// 'FFCC00',
	// '3399FF',
	// 'FFFF00',
	// '9900CC',
	// 'CC0066',
	'912CEE',
	'FF82AB',
	'8B8386',
	'79CDCD',
	'EE9A00',
	'CD0000',
	'EE7600',
	'C71585',
	'3A5FCD',
	'FFFACD',
	'66CD00',
	];
color = [
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'FFFFFF',
	'999999',
	'FFFFFF',
	];
medalRatio = [0.04, 0.14, 0.34];
// medalRatio = [0.1, 0.3, 0.6];
// medalRatio = [0.15, 0.45, 0.9];
medalNum = [];
medalText = ['一等奖', '二等奖', '三等奖'];

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

function setFocus() {
	$("#main-table").children("div").each(function(index, element) {
		if(index === cursor) {
			$(this).addClass("scroll-focus-row");
			var hasPending = false;
			var tr = $(element).children("table").children("tbody").children("tr").eq(0);
			tr.children("td").each(function(index, element) {
				if($(this).hasClass("pending")) {
					$(this).addClass("scroll-focus-prob");
					focusIndex = index-beforeProbTdNum;
					hasPending = true;
					return false;
				}
			});
			if(!hasPending) {
				var medal = 0;
				for(var j=0; j<medalNum.length; ++j) {
					if(info[index]['rank'] <= medalNum[j]) {
						medal = j+1;
						break;
					}
				}
				for(var j=0; j<medalNum.length; ++j) {
					$(element).children("table").children("tbody").children("tr").children("td").eq(0).removeClass("medal-tip-" + (j+1));
					// console.log('remove');
				}
				for(var j=0; j<beforeProbTdNum; ++j) {
					$(element).children("table").children("tbody").children("tr").children("td").eq(j).addClass("medal-" + medal);
					// console.log('setFocus');
				}
				// console.log('set here');
				if(medal >= 1) {
					// Show photo!
					// $("#fs-photo").oneTime('1000ms', function() {
					// 	setFullScreenPhoto(tr.attr("data-user-name"), tr.attr("data-nick-name"), tr.attr("data-member"), medal);
					// });
				}
				// $("#fs-photo").animate({
				// 		// "top": top+scrollHeightSize
				// 	},
				// 	3000,
				// 	function() {
				// 		closeFullScreenPhoto();
				// 	}
				// );
			}
			return false;
		}
	});
	// setMedalTip();
}

function init(res) {
	// console.log(res);
	$(".mgdiv h3").remove();
	problemNum = res[0]['statuses'].length;
	officialNum = res.length-1;
	for(var i=0; i<medalRatio.length; ++i) {
		medalNum[i] = Math.max(i+1, parseInt(Math.floor(officialNum*medalRatio[i])));
	}
	for(var i=0; i<problemNum; ++i) {
		$("thead tr:last").append('<th class="single-prob"><a style="color: #' + color[i] + '; background: no-repeat center/36px url(&#39;data:image/svg+xml;utf8,&lt;svg class=&quot;icon&quot; width=&quot;200px&quot; height=&quot;200.00px&quot; viewBox=&quot;0 0 1024 1024&quot; version=&quot;1.1&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt;&lt;path fill=&quot;%23' + balloon[i] + '&quot; d=&quot;M512 935.724137C617.931034 741.517241 847.448276 556.021587 847.448276 370.758621 847.448276 185.495654 697.262966 35.310345 512 35.310345 326.737034 35.310345 176.551724 185.495654 176.551724 370.758621 176.551724 556.021587 423.724137 741.517241 512 935.724137Z&quot; /&gt;&lt;/svg&gt;&#39;);">' + String.fromCharCode(65+i) + '</a></th>');
	}
	size = Math.min(size, res.length-1);
	cursor = res[res.length-1]['base']-1;
	// cursor = res[res.length-1]['cursor']-1;
	var endIndex = cursor+1 > res.length-2 ? cursor : cursor+1;
	var startIndex = endIndex-size+1;
	if(startIndex < 0) {
		startIndex = 0;
		endIndex = size-1;
	}
	cursor -= startIndex; // convert cursor from rank-index to index (0-size-1)
	for(var i=startIndex; i<=endIndex; ++i) {
		info[i-startIndex] = res[i];
		info[i-startIndex]['rank'] = i+1;
	}
	for(var i=0; i<info.length; ++i) {
		var stmp = info[i]['nickname'].split('|');
		var userName = stmp[0]
		var nickName = stmp[1]
		var member = stmp[2]
		$("#main-table").append('<div class="row row-background"><table class="table table-bordered table-bordered-no-top table-s"><tbody><tr></tr></tbody></table></div>');
		$("tbody:last").children("tr").attr("data-user-name", userName);
		$("tbody:last").children("tr").attr("data-nick-name", nickName);
		$("tbody:last").children("tr").attr("data-member", member);
		$("tbody:last").children("tr").append('<td class="single-rank">' + info[i]['rank'] + '</td>');
		$("tbody:last").children("tr").append('<td class="single-name">' + nickName  + '<br />' + userName + '</td>');
		$("tbody:last").children("tr").append('<td class="single-solved">' + info[i]['solved'] + '</td>');
		$("tbody:last").children("tr").append('<td class="single-time">' + parseInt(Math.floor(info[i]['time']/60)) + '</td>');
		for(var j=0; j<info[i]['statuses'].length; ++j) {
			var content = '';
			var resultClass = '';
			if(info[i]['statuses'][j]['result']==='AC' || info[i]['statuses'][j]['result']==='FB')
				content = info[i]['statuses'][j]['attempted'] + '/' + parseInt(Math.floor(info[i]['statuses'][j]['time']/60));
			else if(info[i]['statuses'][j]['result']==='F' || info[i]['statuses'][j]['result']==='?')
				content = info[i]['statuses'][j]['attempted'];
			if(info[i]['statuses'][j]['result'] === 'AC')
				resultClass = ' accepted';
			if(info[i]['statuses'][j]['result'] === 'FB')
				resultClass = ' fb';
			if(info[i]['statuses'][j]['result'] === 'F')
				resultClass = ' failed';
			if(info[i]['statuses'][j]['result'] === '?')
				resultClass = ' pending';
			$("tbody:last").children("tr").append('<td class="single-prob' + resultClass + '">' + content + '</td>');
		}
		if(i > cursor) {
			var medal = 0;
			for(var j=0; j<medalNum.length; ++j) {
				if(info[i]['rank'] <= medalNum[j]) {
					medal = j+1;
					break;
				}
			}
			for(var j=0; j<beforeProbTdNum; ++j) {
				$("tbody:last tr").children("td").eq(j).addClass("medal-" + medal);
			}
		}
	}
	$("#main-table").append('<div id="extra" class="row row-background" style="top: -9999px; position: absolute; width: 100%;"><table class="table table-bordered table-bordered-no-top table-s"><tbody><tr></tr></tbody></table></div>');
	$("tbody:last").children("tr").append('<td class="single-rank"></td>');
	$("tbody:last").children("tr").append('<td class="single-name"></td>');
	$("tbody:last").children("tr").append('<td class="single-solved"></td>');
	$("tbody:last").children("tr").append('<td class="single-time"></td>');
	for(var j=0; j<info[0]['statuses'].length; ++j) {
		$("tbody:last").children("tr").append('<td class="single-prob"></td>');
	}
	setFocus();
	setMedalTip();
}

function fillRow(row, infoSingle) {
	// console.log(infoSingle);
	var stmp = infoSingle['nickname'].split('|');
	var userName = stmp[0]
	var nickName = stmp[1]
	var member = stmp[2]
	row.css("top", 0);
	var tr = row.children("table").children("tbody").children("tr");
	// console.log(tr.eq(0).attr("data-user-name"));
	// console.log('do!');
	tr.eq(0).attr("data-user-name", userName);
	tr.eq(0).attr("data-nick-name", nickName);
	tr.eq(0).attr("data-member", member);
	// console.log(tr.eq(0).attr("data-user-name"));
	var td = row.children("table").children("tbody").children("tr").children("td");
	td.eq(0).text(infoSingle['rank']);
	td.eq(1).html(nickName + '<br />' + userName);
	td.eq(2).text(infoSingle['solved']);
	td.eq(3).text(parseInt(Math.floor(infoSingle['time'])/60));
	for(var j=0; j<infoSingle['statuses'].length; ++j) {
		var content = '';
		var resultClass = '';
		if(infoSingle['statuses'][j]['result']==='AC' || infoSingle['statuses'][j]['result']==='FB')
			content = infoSingle['statuses'][j]['attempted'] + '/' + parseInt(Math.floor(infoSingle['statuses'][j]['time']/60));
		else if(infoSingle['statuses'][j]['result']==='F' || infoSingle['statuses'][j]['result']==='?')
			content = infoSingle['statuses'][j]['attempted'];
		td.eq(beforeProbTdNum+j).text(content);
		td.eq(beforeProbTdNum+j).removeClass("accepted");
		td.eq(beforeProbTdNum+j).removeClass("fb");
		td.eq(beforeProbTdNum+j).removeClass("failed");
		td.eq(beforeProbTdNum+j).removeClass("pending");
		if(infoSingle['statuses'][j]['result'] === 'AC')
			resultClass = 'accepted';
		if(infoSingle['statuses'][j]['result'] === 'FB')
			resultClass = 'fb';
		if(infoSingle['statuses'][j]['result'] === 'F')
			resultClass = 'failed';
		if(infoSingle['statuses'][j]['result'] === '?')
			resultClass = 'pending';
		td.eq(beforeProbTdNum+j).addClass(resultClass);
	}
	// setMedalTip();
}

function resetRanklist() {
	for(var i=0; i<size; ++i) {
		fillRow($("#main-table").children("div").eq(i), info[i]);
		$("#main-table").children("div").eq(i).removeClass("z-index-middle");
		for(var j=0; j<beforeProbTdNum; ++j) {
			for(var k=0; k<medalNum.length; ++k) {
				$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").eq(j).removeClass("medal-" + (k+1));
				$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").eq(0).removeClass("medal-tip-" + (k+1));
				// console.log('resetRanklist 1');
			}
		}
		var hasFocus = false;
		if(i === cursor) {
			$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").each(function() {
				if($(this).hasClass("pending")) {
					hasFocus = true;
					return false;
				}
			});
		}
		if(i > cursor) {
			var medal = 0;
			for(var j=0; j<medalNum.length; ++j) {
				if(info[i]['rank'] <= medalNum[j]) {
					medal = j+1;
					break;
				}
			}
			for(var j=0; j<beforeProbTdNum; ++j) {
				$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").eq(j).addClass("medal-" + medal);
				// console.log('resetRanklist 2');
			}
		}
	}
	var top = $("#main-table").children("div").eq(0).position().top;
	top -= scrollHeightSize;
	$("#extra").css("top", top);
	// console.log('resetRanklist');
	setMedalTip();
}

function removeMedalTip() {
	// console.log('remove');
	for(var i=0; i<size; ++i) {
		for(var j=0; j<medalNum.length; ++j) {
			$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").eq(0).removeClass("medal-tip-" + (j+1));
		}
	}
}

function setMedalTip() {
	removeMedalTip();
	var hasPending = false;
	$("#main-table").children("div").eq(cursor).children("table").children("tbody").children("tr").children("td").each(function(index, element) {
		if($(this).hasClass("pending")) {
			hasPending = true;
			return false;
		}
	});
	// console.log(hasPending);
	// console.log(cursor);
	for(var i=0; i<size; ++i) {
		if(i<cursor || (i===cursor && hasPending)) {
			for(var j=0; j<medalNum.length; ++j) {
				if(info[i]['rank'] === medalNum[j]) {
					$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").eq(0).addClass("medal-tip-" + (j+1));
					// console.log('set ' + i + ' ' + info[i]['rank'] + ' ' + j);
					continue;
				}
			}
		}
	}
}

function update(res) {
	// console.log(res);
	eventID = res['event_id'];
	var type = res['type'];
	var status = res['status'];
	extra = res['extra'];
	// console.log('check read extra');
	// console.log(extra);
	// setMedalTip();
	if(type === 'scroll') {
		$("#main-table").children("div").eq(cursor).removeClass("scroll-focus-row");
		var medal = 0;
		for(var j=0; j<medalNum.length; ++j) {
			if(info[cursor]['rank'] <= medalNum[j]) {
				medal = j+1;
				break;
			}
		}
		for(var j=0; j<beforeProbTdNum; ++j) {
			$("#main-table").children("div").eq(cursor).children("table").children("tbody").children("tr").children("td").eq(j).addClass("medal-" + medal);
			// console.log('update');
		}
		$("#main-table").children("div").eq(cursor-1).addClass("scroll-focus-row");
		if(extra.length === 0) {
			cursor--;
			setFocus();
		}
		else {
			removeMedalTip();
			$("#one-scroll").attr("disabled", true);
			for(var i=size-1; i>=1; --i) {
				info[i] = info[i-1];
				$("#main-table").children("div").eq(i).animate({
						"top": scrollHeightSize
					},
					1000,
					function() {}
				);
			}
			$("#main-table").children("div").eq(0).animate({
					"top": scrollHeightSize
				},
				1000,
				function() {}
			);
			info[0] = extra;
			// console.log("scroll fillrow");
			fillRow($("#extra"), info[0]);
			var top = $("#main-table").children("div").eq(0).position().top;
			top -= scrollHeightSize;
			$("#extra").css("top", top);
			$("#extra").animate({
					"top": top+scrollHeightSize
				},
				1000,
				function() {
					$("#main-table").children("div").eq(cursor-1).removeClass("scroll-focus-row");
					resetRanklist();
					setFocus();
					$("#one-scroll").attr("disabled", false);
				}
			);
		}
	}
	if(type === 'show') {
		status['time'] -= (status['attempted']-1)*1200;
		var focusCell = $("#main-table").children("div").eq(cursor).children("table").children("tbody").children("tr").children("td").eq(focusIndex+beforeProbTdNum);
		info[cursor]['statuses'][focusIndex]['result'] = status['result'];
		info[cursor]['statuses'][focusIndex]['attempted'] = status['attempted'];
		info[cursor]['statuses'][focusIndex]['time'] = status['time'];
		focusCell.removeClass("pending");
		focusCell.removeClass("scroll-focus-prob");
		if(status['result'] === 'F') {
			focusCell.addClass("failed");
			setFocus();
		}
		else {
			$("#one-scroll").attr("disabled", true);
			if(status['result'] === 'AC')
				focusCell.addClass("accepted");
			if(status['result'] === 'FB')
				focusCell.addClass("fb");
			var origRank = info[cursor]['rank'];
			info[cursor]['rank'] = status['rank'];
			info[cursor]['solved']++;
			info[cursor]['time'] += (status['attempted']-1)*1200 + status['time'];
			var infoBak = info[cursor];
			$("#main-table").children("div").eq(cursor).children("table").children("tbody").children("tr").children("td").eq(0).text(info[cursor]['rank']);
			$("#main-table").children("div").eq(cursor).children("table").children("tbody").children("tr").children("td").eq(2).text(info[cursor]['solved']);
			$("#main-table").children("div").eq(cursor).children("table").children("tbody").children("tr").children("td").eq(3).text(parseInt(Math.floor(info[cursor]['time']/60)));
			focusCell.text(status['attempted'] + '/' + parseInt(Math.floor(status['time'])/60));
			var scrollNum = 0;
			var i;
			removeMedalTip();
			for(i=cursor-1; i>=0; --i) {
				if(info[i]['rank'] >= infoBak['rank']) {
					info[i]['rank']++;
					info[i+1] = info[i];
					scrollNum++;
					$("#main-table").children("div").eq(i).children("table").children("tbody").children("tr").children("td").eq(0).text(info[i]['rank']);
					$("#main-table").children("div").eq(i).animate({
							"top": scrollHeightSize
						},
						1000,
						function() {}
					);
				}
				else break;
			}
			info[i+1] = infoBak;
			// Scroll Overtop
			if(origRank-status['rank'] >= size-1) {
				$("#main-table").children("div").eq(cursor).addClass("z-index-middle");
				// extra['rank']++;
				info[0] = extra;
				// console.log("show overtop fillrow");
				fillRow($("#extra"), info[0]);
				var top = $("#main-table").children("div").eq(0).position().top;
				top -= scrollHeightSize;
				$("#extra").css("top", top);
				scrollNum++;
				$("#extra").children("table").children("tbody").children("tr").children("td").eq(0).text(info[0]['rank']);
				$("#extra").animate({
						"top": top+scrollHeightSize
					},
					1000,
					function() {}
				);
			}
			$("#main-table").children("div").eq(cursor).animate({
					"top": -scrollHeightSize*scrollNum
				},
				1000,
				function() {
					$("#main-table").children("div").eq(cursor).removeClass("scroll-focus-row");
					resetRanklist();
					setFocus();
					$("#one-scroll").attr("disabled", false);
				}
			);
		}
	}
	// setMedalTip();
	eventID++;
}

// function initRanklist() {
// 	$.ajax({
// 		// url: 'ranklist_api.php',
// 		url: 'scroll.json',
// 		dataType: 'json',
// 		timeout: 1000,
// 		cache: false,
// 		success: function (res) {
// 			init(res);
// 		}, error: function () {
// 			// alert("Error Occurred! Please contact author：tbdblue@gmail.com");
// 		}
// 	});
// }

// function eventHandler() {
// 	$.ajax({
// 		url: 'event_api.php?event_id=' + eventID,
// 		dataType: 'json',
// 		timeout: 1000,
// 		cache: false,
// 		success: function (res) {
// 			update(res);
// 		}, error: function () {
// 			// alert("Error Occurred! Please contact author：tbdblue@gmail.com");
// 		}
// 	});
// }

// $(function () {
// 	initRanklist();
// 	$("#one-scroll").click(function() {
// 		eventHandler();
// 	});
// });

function setFullScreenPhoto(userName, nickName, member, medalLevel) {
	$("#fs-real-photo").attr("src", 'http://acm.sdut.edu.cn/sdutacm_files/contests/2296/images/' + userName + '.jpg');
	$("#fs-info-1").text(nickName);
	$("#fs-info-2").text(member);
	$("#fs-medal").text(medalText[medalLevel-1]);
	$("#fs-photo").show();
	$("#fs-photo").oneTime('5000ms', function() {
		closeFullScreenPhoto();
	});
}

function closeFullScreenPhoto() {
	$("#fs-photo").hide();
}

// v1.0.3 for scroll button
$(function () {
	var scrollBtn = $("#scroll-button").find(".btn");
	scrollBtn.click(function () {
		$(this).button('loading');
		console.log('here');
		var scrollUrl = $(this).data('url');
		$.ajax({
			url: scrollUrl,
			timeout: 5000,
			cache: false,
			success: function (res) {
				console.log(scrollBtn);
				setTimeout(function () {
					scrollBtn.button('reset');
				}, 1100);
			}, error: function () {
			}
		});
	});
});