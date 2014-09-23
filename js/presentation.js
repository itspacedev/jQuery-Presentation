jQuery(document).ready(function(){
// Presentation Plugin for jQuery
	var preApi = window.preApi = {
		i:-1,
		settings: [],
		defaultSettings:{
			id: 0,
			elm: null,
			title: 'Default Title',
			slides: [],
			delay: 3,
			timeout: null,
			slide_id: 0,
			status: 0
		},
		
		init: function(elm, options){
			var id = ++window.preApi.i;
			window.preApi.settings[id] = jQuery.extend({}, window.preApi.defaultSettings, options, {
				id: id,
				elm: jQuery(elm),
				slides: window.preApi.make_slides()
			});
			window.preApi.make_html(id);
		},
		
		make_html: function(id){
			var s = window.preApi.settings[id], t='',
			origSize = window.preApi.getSize(s.elm),
			pSize = window.preApi.calc(id, origSize);
			
			//if(s.slides.length > 0){
				t += '<div id="present_'+id+'" class="present" style="visibility:hidden;">';
					t += '<div class="present__header">';
						t += s.title;
					t += '</div>';
					t += '<div class="present__mwrap">';
						t += '<div class="present__slides">';
							jQuery.each(s.slides, function(si, slide){
								t += '<a id="ph_'+id+'_'+si+'" class="present__slide__handler'+((si==0)?' selected':'')+'" href="javascript:{}" style="display:block;" onClick="javascript:{return window.preApi.show_slide('+id+', '+si+');};">';
									//t += 'Slide '+(si+1);
									t += '<img src="'+slide.image+'"/>';
								t += '</a>';
							});
						t += '</div>';
						t += '<div class="present__view">';
							jQuery.each(s.slides, function(si, slide){
								t += '<div id="ps_'+id+'_'+si+'" class="present__slide"'+((si>0)?' style="display:none;"':'')+'>';
									t += '<img src="'+slide.image+'"/>';
								t += '</div>';
							});
							t += '<a href="javascript:{}" class="present__button pb__prev" onClick="javascript:{return window.preApi.prev('+id+')}">&larr;</a>';
							t += '<a href="javascript:{}" class="present__button pb__play" onClick="javascript:{return window.preApi.play('+id+')}">&#9658;</a>';
							t += '<a href="javascript:{}" class="present__button pb__next" onClick="javascript:{return window.preApi.next('+id+')}">&rarr;</a>';
						t += '</div>';
					t += '</div>';
				t += '</div>';
				
			//}
			
			window.preApi.settings[id].elm.replaceWith(t);
			var pElm = jQuery('#present_'+id),
			pElmWrap = pElm.find('.present__mwrap'),
			pElmSlides = pElmWrap.find('.present__slides'),
			pElmView = pElmWrap.find('.present__view');
			
			pElmWrap.css({
				height: pSize.view.height
			});
			pElmSlides.css({
				width: pSize.slides.width,
				height: pSize.slides.height,
			});
			var fH = 0;
			pElmSlides.find('.present__slide__handler').each(function(){
				if(fH == 0){
					var fW = jQuery(this).outerWidth();
					fH = fW / (4/3);
					window.preApi.settings[id].handlerHeight = fH;
				}
				jQuery(this).css({
					height: fH
				});
			});
			pElmView.css({
				width: pSize.view.width,
				height: pSize.view.height,
			});
			pElm.css({
				width: pSize.box.width,
				height: pSize.box.height,
				visibility: 'visible'
			});
			window.preApi.settings[id].pElm = pElm;
		},
		getSize: function(elm){
			elm = jQuery(elm);
			return {
				width: elm.outerWidth(),
				height: elm.outerHeight()
			};
		},
		
		calc: function(id, size){
			var h = (size.width / (4/3));
			return {
				slides:{
					width: (size.width * 0.3),
					height: h
				},
				view: {
					width: (size.width),
					height: h
				},
				box: {
					width: size.width,
					height: h + 34 // plus header height (34px)
				}
			};
		},
		make_slides: function(){
			var slides = [];
			for(var i = 0; i<= 4; i++){
				slides.push({
					image: "./css/images/"+i+".jpg"
				});
			}
			
			return slides;
		},
		
		play: function(id){
			if(window.preApi.settings[id].status == 0){
				if(window.preApi.settings[id].slide_id == 0 || window.preApi.settings[id].slide_id == (window.preApi.settings[id].slides.length -1)){
					window.preApi.settings[id].pElm.find('.present__slide').hide();
					jQuery('#ps_'+id+'_0').show();
				
					window.preApi.settings[id].slide_id = 0;
				}
				
				window.preApi.set_status(id, 1);
				window.preApi.timeout_set(id, window.preApi.settings[id].slide_id);
				
				window.preApi.highlight_handler(id, window.preApi.settings[id].slide_id);

			}else if(window.preApi.settings[id].status == 1){
				window.preApi.set_status(id, 2);
				window.preApi.timeout_delit(id);
			}else if(window.preApi.settings[id].status == 2){
				window.preApi.set_status(id, 1);
				window.preApi.timeout_delit(id);
				window.preApi.timeout_set(id, window.preApi.settings[id].slide_id);
			}
		},
		
		next: function(id){
			var s = window.preApi.settings[id], slides_count = s.slides.length,
			old_slide = s.slide_id, new_slide = (old_slide+1);
			if(new_slide > (slides_count - 1)){
				return;
			}else{
				window.preApi.show_slide(id, new_slide);
			}
		},
		
		prev: function(id){
			var s = window.preApi.settings[id],
			old_slide = s.slide_id, new_slide = (old_slide-1);
			if(new_slide == -1){
				return;
			}else{
				window.preApi.show_slide(id, new_slide);
			}
		},
		
		highlight_handler: function(id, slide){
			var pElm = window.preApi.settings[id].pElm;
			pElm.find('.present__slide__handler').removeClass('selected');
			
			jQuery('#ph_'+id+'_'+slide).addClass('selected');
			pElm.find('.present__slides').animate({
				scrollTop: (window.preApi.settings[id].handlerHeight * slide)
			}, 500);
		},
		
		show_slide: function(id, slide){
			var s = window.preApi.settings[id];
			var s_old = jQuery('#ps_'+id+'_'+s.slide_id),  s_new = jQuery('#ps_'+id+'_'+slide);
			s_old.hide();
			s_new.show();
			
			window.preApi.highlight_handler(id, slide);
			
			if(window.preApi.settings[id].status == 1){
				if(slide > s.slide_id){	
					window.preApi.timeout_set(id, slide);
				}
				if(slide == (s.slides.length-1)){
					window.preApi.set_status(id, 0);
				}
			}
			window.preApi.settings[id].slide_id = slide;
		},
		
		set_status: function(id, status){
			// status
			// 0 - stop
			// 1 - playing
			//console.log('set status '+status+' for '+id);
			window.preApi.settings[id].status = status;
			var bhtml = '&#9658;';
			if(status == 1){
				bhtml = 'll';
			}
			window.preApi.settings[id].pElm.find('.pb__play').html(bhtml);
		},
		
		timeout_set: function(id, slide){
			window.preApi.timeout_delit(id);
			
			window.preApi.settings[id].timeout = setTimeout(function(){
				window.preApi.next(id);
			}, 1000 * (window.preApi.settings[id].slides[slide].delay || window.preApi.settings[id].delay));
		},
		
		timeout_delit: function(id){
			clearTimeout(window.preApi.settings[id].timeout);
		}
		
	};
	
	jQuery.fn.Presentation = function(options){
		return this.each(function(i, elm){
			window.preApi.init(elm, options);
		});
	};
});