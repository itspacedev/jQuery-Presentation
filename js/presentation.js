jQuery(document).ready(function(){
// Presentation Plugin for jQuery
	var preApi = window.preApi = {
	// Presentation Index	
		i:-1,
		
	// Settings Cache	
		settings: [],
		
	// Default Settings	
		defaultSettings:{
			id: 0,
			elm: null,
			title: 'Presentation',
			slides: [],
			delay: 3,
			timeout: null,
			slide_id: 0,
			status: 0
		},
		
	// Method: Init presentation
	// @elm - elm to replace
	// @options - presentation options
		init: function(elm, options){
			var id = ++window.preApi.i;
			this.settings[id] = jQuery.extend({}, this.defaultSettings, options, {
				id: id,
				elm: jQuery(elm),
				slides: this.make_slides()
			});
			this.make_html(id);
		},
		
	// Method: Make html code of presentation
	// @id - id presentation
		make_html: function(id){
			var s = this.settings[id], t='',
			origSize = this.getSize(s.elm),
			pSize = this.calc(id, origSize);
			
			t += '<div id="present_'+id+'" class="present" style="visibility:hidden;">';
				t += '<div class="present__header">';
					t += s.title + (id+1);
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
			
			this.settings[id].elm.replaceWith(t);
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
			this.settings[id].pElm = pElm;
		},
		
	// Method: Get size of element
	// @elm - element
		getSize: function(elm){
			elm = jQuery(elm);
			return {
				width: elm.outerWidth(),
				height: elm.outerHeight()
			};
		},
		
	// Method: Calculate sizes for presentation
	// @id - id presentation
	// @size - size of original element
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
		
	// Method: Generate slides fro presentation
	// Method for showing demo
		make_slides: function(){
			var slides = [];
			for(var i = 0; i<= 4; i++){
				slides.push({
					image: "./css/images/"+i+".jpg"
				});
			}
			
			return slides;
		},
		
	// Method: Play 
	// @id - id presentation
		play: function(id){
			var status = this.settings[id].status;
			
			if(status == 0){
				if(this.settings[id].slide_id == 0 || this.settings[id].slide_id == (this.settings[id].slides.length -1)){
					this.settings[id].pElm.find('.present__slide').hide();
					jQuery('#ps_'+id+'_0').show();
					this.settings[id].slide_id = 0;
				}
				this.set_status(id, 1);
				this.timeout_set(id, this.settings[id].slide_id);
				this.highlight_handler(id, this.settings[id].slide_id);

			}else if(status == 1){
				this.set_status(id, 2);
				this.timeout_delit(id);
				
			}else if(status == 2){
				this.set_status(id, 1);
				this.timeout_delit(id);
				this.timeout_set(id, this.settings[id].slide_id);
			}
		},
		
	// Method: Next slide
	// @id - id presentation
		next: function(id){
			var s = this.settings[id], slides_count = s.slides.length,
			old_slide = s.slide_id, new_slide = (old_slide+1);
			if(new_slide > (slides_count - 1)){
				return;
			}else{
				this.show_slide(id, new_slide);
			}
		},
		
	// Method: Prev slide
	// @id - id presentation
		prev: function(id){
			var s = this.settings[id],
			old_slide = s.slide_id, new_slide = (old_slide-1);
			if(new_slide == -1){
				return;
			}else{
				this.show_slide(id, new_slide);
			}
		},
		
	// Method: Highlight slide handler
	// @id - id presentation
	// @slide - id slide
		highlight_handler: function(id, slide){
			var pElm = this.settings[id].pElm;
			pElm.find('.present__slide__handler').removeClass('selected');
			
			jQuery('#ph_'+id+'_'+slide).addClass('selected');
			pElm.find('.present__slides').animate({
				scrollTop: (window.preApi.settings[id].handlerHeight * slide)
			}, 500);
		},
	
	// Method: Show slide
	// @id - id presentation
	// @slide - id slide in @id presentation
		show_slide: function(id, slide){
			var s = this.settings[id];
			var s_old = jQuery('#ps_'+id+'_'+s.slide_id),  s_new = jQuery('#ps_'+id+'_'+slide);
			s_old.hide();
			s_new.show();
			
			this.highlight_handler(id, slide);
			
			if(s.status == 1){
				if(slide > s.slide_id){	
					this.timeout_set(id, slide);
				}
				if(slide == (s.slides.length-1)){
					this.set_status(id, 0);
				}
			}
			this.settings[id].slide_id = slide;
		},
	
	// Method: Set status
	// @id - id presentation
	// @status - new status to set
	// @status: 
	// 0 - stop
	// 1 - playing
	// 2 - paused
		set_status: function(id, status){
			this.settings[id].status = status;
			var bhtml = '&#9658;';
			if(status == 1){
				bhtml = 'll';
			}
			this.settings[id].pElm.find('.pb__play').html(bhtml);
		},
	
	// Method: Set timeout for showing next slide
	// @id - id presentation
	// @slide - current slide	
		timeout_set: function(id, slide){
			this.timeout_delit(id);
			
			this.settings[id].timeout = setTimeout(function(){
				window.preApi.next(id);
			}, 1000 * (this.settings[id].slides[slide].delay || this.settings[id].delay));
		},
	
	// Method: Clear timeout
	// @id - id presentation	
		timeout_delit: function(id){
			clearTimeout(this.settings[id].timeout);
		}
		
	};
	
	jQuery.fn.Presentation = function(options){
		return this.each(function(i, elm){
			window.preApi.init(elm, options);
		});
	};
});