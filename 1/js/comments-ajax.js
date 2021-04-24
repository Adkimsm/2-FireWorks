/**
 * WordPress jQuery-Ajax-Comments v1.3 by Willin Kan.
 * URI: http://kan.willin.org/?p=1271
 * 由INLOJV进行更详细注释
 */
function ajaxComt(){
	var i = 0, got = -1, len = document.getElementsByTagName('script').length;// script标签的数目
	while (i <= len && got == -1) { // 这个循环用来抓取comments-ajax.js所在文件夹的路径 ，若该js是放在主题js文件夹下的！下面获取ajax_php的相对路径就要注意修改！
		var js_url = document.getElementsByTagName('script')[i].src,
		got = js_url.indexOf('comments-ajax.js');  // ××××××××××××××××××× 改为本js的名称
		i++;
	}
	js_url = js_url.replace("res.iowen.cn", "www.iowen.cn");//开启静态资源CDN的修改并启用这行代码
	var edit_mode = '0', // 再編輯模式 ( '1'=開; '0'=不開 )
		ajax_php_url = js_url.replace('comments-ajax.js', '../inc/comments-ajax.php'), // ××××××对应位置改为ajax php的路径，若js在主题js文件夹下，那么加 ../ 
		 
		comment = 'comment', // ××× textarea 的id 不带#
		commentlist = 'commentwrap',  // ××× 评论列表ul或ol的class，不带点 

		txt1 = '<div id="loading" class="text-info"><span class="comload"></span></div>',
		txt2 = '<div id="error">#</div>',
		txt3 = '"><div class="text-success"> <span class="sub-yes"></span>',
		txt4 = '<div id="textloading">#</div>',
		edt1 = ' 刷新页面之前您可以<a rel="nofollow" class="comment-reply-link" href="#edit" onclick=\'return addComment.moveForm("',
		edt2 = ')\'>再次编辑评论</a></div>',
		cancel_edit = '取消编辑',
		edit, num = 1, comm_array=[]; comm_array.push('');
		$comments = $('#comments-list-title'); // 评论计数的id
		$cancel = $('#cancel-comment-reply-link'); 
		cancel_text = $cancel.text();
		$submit = $('#commentform #submit'); // ×××××××××××××××××××××××××××××× 提交按钮的id或class
		$submit.attr('disabled', false);
		$('#'+comment).after( txt1 + txt2 + txt4);  // ×××××××××××××××××××××××××××××××××× 这是评论表单textarea的id或class
		$('#loading').hide(); 
		$('#error').hide();
		$('#textloading').hide();
		$body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
	
	/** 评论提交 */
	$('#commentform').submit(function() { // ×××××××××× form表单的id
		$('#loading').slideDown();
		$submit.attr('disabled', true).fadeTo('slow', 0.5);
		if ( edit ) $('#'+comment).after('<input type="text" name="edit_id" id="edit_id" value="' + edit + '" style="display:none;" />'); //×××××××× 在textarea标签之后插入
	
		/** 评论Ajax核心 */
		$.ajax( {
			url: ajax_php_url, // 这是ajax.php的路径
			data: $(this).serialize()+ "&action=ajax_comment_post",//iowen
			type: $(this).attr('method'),
			error: function(request) {
				$('#loading').slideUp();
				$('#error').slideDown().html('<span class="sub-no"></span>' +request.responseText);
				setTimeout(function() {$submit.attr('disabled', false).fadeTo('slow', 1); $('#error').slideUp();}, 3000);
				},
			success: function(data) {
				$('#loading').hide();
				comm_array.push($('#'+comment).val()); // ×××××××××××××××××××× 这个c-textarea为textarea的id
				$('textarea').each(function() {this.value = ''});
				var t = addComment, cancel = t.I('cancel-comment-reply-link'), temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId), post = t.I('comment_post_ID').value, parent = t.I('comment_parent').value;
				//location.reload(true);
				//$(".entry-content").html(data);//要刷新的div
				// 增加评论数
			if ( ! edit && $comments.length ) {
				n = parseInt($comments.text().match(/\d+/)); // 正则匹配文本内容中的数字
				$comments.html($comments.html().replace( n, n + 1 ));
			}
			// 评论显示
			new_htm = '" id="new_comm_' + num + '"></';
			new_htm = (parent == '0') ? ('\n<ol class="'+commentlist+'" ' +  new_htm + 'ol>') : ('\n<ul class="children' + new_htm + 'ul>');// ×××××××评论列表的class
			ok_htm = '\n<div class="ajax-notice" id="success_' + num + txt3;
			if ( edit_mode == '1' ) {
				div_ = (document.body.innerHTML.indexOf('div-comment-') == -1) ? '' : ((document.body.innerHTML.indexOf('li-comment-') == -1) ? 'div-' : '');
				ok_htm = ok_htm.concat(edt1, div_, 'comment-', parent, '", "', parent, '", "respond", "', post, '", ', num, edt2);
			} else {
				ok_htm += '评论成功';
			}
			ok_htm += '</span><span></span>\n';
	
				$('#respond').before(new_htm);
	
			$('#new_comm_' + num).append(data);
			$('#new_comm_' + num + ' li').append(ok_htm);
			$body.animate({scrollTop: $('#new_comm_' + num).offset().top - 200},900);
			countdown(); num++ ; edit = ''; $('*').remove('#edit_id');
			cancel.style.display = 'none';
			cancel.onclick = null;
			t.I('comment_parent').value = '0';
			if ( temp && respond ) {
				temp.parentNode.insertBefore(respond, temp);
				temp.parentNode.removeChild(temp)
			}
			}
		}); // end Ajax
	  return false;
	}); // end submit
	
	/** 移动回复表单 */
	addComment = {
		moveForm : function(commId, parentId, respondId, postId, num) {
			//reply(commId); // 回复添加@
			var t = this, div, comm = t.I(commId), respond = t.I(respondId), cancel = t.I('cancel-comment-reply-link'), parent = t.I('comment_parent'), post = t.I('comment_post_ID');
			if ( edit ) exit_prev_edit();
			num ? (
				t.I(comment).value = comm_array[num],// ××××××××××××××××××××这个为textarea的id
				edit = t.I('new_comm_' + num).innerHTML.match(/(comment-)(\d+)/)[2],
				$new_sucs = $('#success_' + num ), $new_sucs.hide(),
				$new_comm = $('#new_comm_' + num ), $new_comm.hide(),
				$cancel.text(cancel_edit)
			) : $cancel.text(cancel_text);
	
			t.respondId = respondId;
			postId = postId || false;
	
			if ( !t.I('wp-temp-form-div') ) {
				div = document.createElement('div');
				div.id = 'wp-temp-form-div';
				div.style.display = 'none';
				respond.parentNode.insertBefore(div, respond);
			}
	
			!comm ? ( 
				temp = t.I('wp-temp-form-div'),
				t.I('comment_parent').value = '0',
				temp.parentNode.insertBefore(respond, temp),
				temp.parentNode.removeChild(temp)
			) : comm.parentNode.insertBefore(respond, comm.nextSibling);
			$body.animate( { scrollTop: $('#respond').offset().top - 180 }, 400);
			if ( post && postId ) post.value = postId;
			parent.value = parentId;
			cancel.style.display = '';
			// 取消按钮动作
			cancel.onclick = function() {
				if ( edit ) exit_prev_edit();
				var t = addComment, temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId);
	
				t.I('comment_parent').value = '0';
				if ( temp && respond ) {
					temp.parentNode.insertBefore(respond, temp);
					temp.parentNode.removeChild(temp);
				}
				this.style.display = 'none';
				this.onclick = null;
				$('textarea').val(''); // 清空textarea区
				return false;
			};
	
			try { t.I('comment').focus(); }
			catch(e) {}
	
			return false;
		},
	
		I : function(e) {
			return document.getElementById(e);
		}
	}; // end addComment
	
	function exit_prev_edit() {
			$new_comm.show(); $new_sucs.show();
			$('textarea').each(function() {this.value = ''});
			edit = '';
	}
	
	/** 重编辑等待时间 防止快速提交 */
	var wait = 8, submit_val = $submit.val();
	function countdown() {
		if ( wait > 0 ) {
			$submit.val(wait); wait--; setTimeout(countdown, 1000);
		} else {
			$submit.val(submit_val).attr('disabled', false).fadeTo('slow', 1);
			wait = 8;
	  }
	}
 
 
	}
	 
	// end Ajax评论
	jQuery(document).ready(function() {
		ajaxComt();
	});
	