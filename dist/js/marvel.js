$(function () {
	_marvel.init();
});

var _marvel = (function(){
	var base_url = 'https://gateway.marvel.com:443/v1/public/'; 
	var ts = '1';
	var apikey = 'e2f4dbe31ade892cad3c28d261313f05';
	var hash = '392c0498298fd964711149712973c197';
	var limit = 10;
	var offset = 0;

	var $pagination = $('.pagination');
	var defaultOpts;

	var _init = function(){
	    setEvents();
	    loadCharacters();
	}
	var setEvents = function(){
		defaultOpts = {
	        totalPages: 1,
	        visiblePages: 5,
	        first: '',
	        prev: '<',
	        next: '>',
	        last: ''
	    };
		$pagination.twbsPagination(defaultOpts);

		$(document).on("click", ".page-link", function(e){
            e.preventDefault();
            $(this).addClass("active");
            var currentPage = $pagination.twbsPagination('getCurrentPage');
            offset = currentPage - 1;
            loadCharacters();
        });
	}
	var ajax = function(url,type,data,done,error){
	    $.ajax({
	        url: base_url+url,
	        context : document.body,
	        dataType: "json",
	        type: type,
	        data: data,
	        success: done,
	        error: error
	    });
	}
	var loadCharacters = function(){
		ajax(
	        'characters',
	        'GET',
	        {   
	            ts : ts,
	            apikey : apikey,
	            hash : hash,
	            limit: limit,
	            offset: limit * offset
	        },
	        function( response ){
	            if(response.status=="Ok"){
	            	var totalPages = response.data.total;
	            	var currentPage = $pagination.twbsPagination('getCurrentPage');

		            $pagination.twbsPagination('destroy');
		            $pagination.twbsPagination($.extend({}, defaultOpts, {
		            	startPage: currentPage,
		                totalPages: totalPages
		            }));

	            	$( "#characters" ).empty();
	            	for (var i = 0; i < response.data.count; i++) {
                        render(response.data.results[i]);
                    };
                    $('.se-pre-con').hide();
	            }
	        },function(){
	              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
	        }
	    );
	}
	var render = function(data,replace){
		var content = '<div class="col-md-6">' +
						'<div class="col-md-12 div-character">' +
							'<div class="row">' +
								'<div class="col-md-6">' + 
									'<img class="img-character" src="'+ data.thumbnail.path + '.' + data.thumbnail.extension +'" alt="Responsive image">' +
								'</div>' +
								'<div class="col-md-6 div-info">' +
									'<h4>' + data.name + '</h4>' +
									'<p>' + data.description.substr(0, 80) + '</p>' +
									'<button type="button" class="btn btn-danger">VIEW MORE</button>' +
								'</div>' +
								'<div class="col-md-12">';
									if(data.comics.available > 0){ 
										content += '<h5>Related comics</h5>' +
										'<div class="row">';
											var size = 0;
											if(data.comics.available >= 4){
												size = 4;
											}
											else{
												size = data.comics.available;
											}
											for (var i = 0; i < size; i++) {
												content += '<div class="col-md-6">' + data.comics.items[i].name + '</div>';
											}
										content += '</div>';
									}
								content += '</div>' +
							'</div>' +
						'</div>' +
					'</div>';

		$('#characters').append(content);
	}
	return {
      	init : _init
    }
})();