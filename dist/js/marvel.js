$(function () {
	_marvel.init();
});

var _marvel = (function(){
	/* Variables para llamar la api de marvel */
	var base_url = 'https://gateway.marvel.com:443/v1/public/'; 
	var ts = '1';
	var apikey = 'e2f4dbe31ade892cad3c28d261313f05';
	var hash = '392c0498298fd964711149712973c197';
	/******************************************/

	//Almacenar el id del character seleccionado
	var idCharacter = 0;

	/* Inicar la paginación */
	var $pagination = $('.pagination');
	var defaultOpts;
	/************************/

	var limit = 10;
	var offset = 0;
	var offsetC = 0;

	//Validar si trae el servicio de characters o comics
	var filtro = 1;

	var _init = function(){
		var pagina = 0;
	    setEvents();
	    loadCharacters(pagina);
	}

	var setEvents = function(){
		/* Opciones para iniciar la paginación */
		defaultOpts = {
	        totalPages: 1,
	        visiblePages: 5,
	        first: '',
	        prev: '<',
	        next: '>',
	        last: ''
	    };
		$pagination.twbsPagination(defaultOpts);
		/***************************************/

		/* Si el value del input es "" entonces traigo el servicio de cargar los characters */
		$("#search-character").keyup(function(event) {
            if (event.which == 8) {
                if($("#search-character").val() == ""){
                	offset = 0;
                	$('.se-pre-con').show();
                	var pagina = 0;
                	loadCharacters(pagina);
                }
            }
        });
        /***********************************************************************************/

        /* Autocomplete de jQuery UI */
		$( "#search-character" ).autocomplete({
	      	source: function( request, response ) {
		        ajax(
			        'characters',
			        'GET',
			        {   
			            ts : ts,
			            apikey : apikey,
			            hash : hash,
			            limit: limit,
			            nameStartsWith: request.term
			        },
			        function( respuesta ){
			            if(respuesta.status=="Ok"){
			       			var characters = new Array();
			       			for (var i = 0; i < respuesta.data.count; i++) {
			       				var character = {
			       					id : respuesta.data.results[i].id,
			       					value : respuesta.data.results[i].name
			       				}
		                        characters.push(character);
		                    };
		                    response(characters);
			            }
			        },function(){
			              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
			        }
			    );
	      	},
		    minLength: 2,
		    select: function( event, ui ) {
		        idCharacter = ui.item.id;
		        offsetC = 0;
		        $('.se-pre-con').show();
		        var pagina = 0;
		        loadComics(pagina, ui.item.id);
		    }
	    } );
	    /****************************/

	    /* Validar si cargo los characters o los comics */
		$(document).on("click", ".page-link", function(e){
            e.preventDefault();
            $(this).addClass("active");
            var currentPage = $pagination.twbsPagination('getCurrentPage');
            var pagina = 1;
            if(filtro == 1){
            	offset = currentPage - 1;
            	$('.se-pre-con').show();
            	loadCharacters(pagina);
            }
            else{
            	offsetC = currentPage - 1;
            	$('.se-pre-con').show();
            	loadComics(pagina, idCharacter);
            }
            
        });
        /************************************************/

        /* Modal para ver el detallado de los personajes */
        $('#modalCharacter').on('show.bs.modal', function (event) {
			var button = $(event.relatedTarget);
			var id = button.data('id');
			var tipo = button.data('tipo');

			var modal = $(this);
			modal.find('.text-character').text('');

			if(tipo === "character"){
				ajax(
			        'characters/' + id,
			        'GET',
			        {   
			            ts : ts,
			            apikey : apikey,
			            hash : hash
			        },
			        function( response ){
			            if(response.status=="Ok"){
			            	var data = response.data.results[0];
			            	console.log(response);
			            	var imgCharacter = '"'+ data.thumbnail.path + '.' + data.thumbnail.extension +'"';
			            	$('.div-img').css('background-image', 'url(' + imgCharacter + ')');
			            	modal.find('.title-character').text(data.name);
			            	modal.find('.text-character').append(data.description);
			            	for (var i = 0; i < data.urls.length; i++) {
			            		if(data.urls[i].type == "detail"){
			            			$('.detail-character').attr("href", data.urls[i].url);
			            			break;
			            		}
			            	}

			            	modal.find('.detail-character').show();
			            	modal.find('#footer-comic').hide();
			            	modal.find('#footer-character').show();
			            }
			        },function(){
			              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
			        }
			    );
			}
			else{
				ajax(
			        'comics/' + id,
			        'GET',
			        {   
			            ts : ts,
			            apikey : apikey,
			            hash : hash
			        },
			        function( response ){
			            if(response.status=="Ok"){
			            	var data = response.data.results[0];
			            	console.log(response);
			            	var imgCharacter = '"'+ data.thumbnail.path + '.' + data.thumbnail.extension +'"';
			            	$('.div-img').css('background-image', 'url(' + imgCharacter + ')');
			            	modal.find('.title-character').text(data.title);
			            	modal.find('.text-character').append(data.description);

			            	modal.find('.detail-character').hide();
			            	modal.find('#footer-character').hide();
			            	modal.find('#footer-comic').show();
			            }
			        },function(){
			              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
			        }
			    );
			}
		})
		/************************************************/
	}

	/* Funcion ajax general */
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
	/***********************/

	/* Servicio para cargar los characters */
	var loadCharacters = function(pagina){
		filtro = 1;
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
	            	var totalPages = Math.ceil(response.data.total / limit);
	            	var currentPage;

	            	if(pagina == 0){
	            		currentPage = 1;
	            	}
	            	else{
	            		currentPage = $pagination.twbsPagination('getCurrentPage');
	            	}

		            $pagination.twbsPagination('destroy');
		            $pagination.twbsPagination($.extend({}, defaultOpts, {
		            	startPage: currentPage,
		                totalPages: totalPages
		            }));

	            	$( "#characters" ).empty();
	            	for (var i = 0; i < response.data.count; i++) {
                        render(response.data.results[i]);
                    };

                    paginacion = 1;
                    $('.se-pre-con').hide();
	            }
	        },function(){
	              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
	        }
	    );
	}
	/************************************/

	/* Servicio para cargar los comics */
	var loadComics = function(pagina, id){
		filtro = 2;
		ajax(
	        'characters/' + id + '/comics',
	        'GET',
	        {   
	            ts : ts,
	            apikey : apikey,
	            hash : hash,
	            limit: limit,
	            offset: limit * offsetC
	        },
	        function( response ){
	            if(response.status=="Ok"){
	            	var totalPages = Math.ceil(response.data.total / limit);
	            	var currentPage;

	            	if(pagina == 0){
	            		currentPage = 1;
	            	}
	            	else{
	            		currentPage = $pagination.twbsPagination('getCurrentPage');
	            	}

		            $pagination.twbsPagination('destroy');
		            $pagination.twbsPagination($.extend({}, defaultOpts, {
		            	startPage: currentPage,
		                totalPages: totalPages
		            }));

	            	$( "#characters" ).empty();
	            	for (var i = 0; i < response.data.count; i++) {
                        renderComics(response.data.results[i]);
                    };
                    $('.se-pre-con').hide();
	            }
	        },function(){
	              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
	        }
	    );
	}
	/************************************/

	/* Renderizar los characters */
	var render = function(data,replace){
		var content = '<div class="col-md-6">' +
						'<div class="col-md-12 div-character">' +
							'<div class="row">' +
								'<div class="col-md-6">' + 
									'<img class="img-character" src="'+ data.thumbnail.path + '.' + data.thumbnail.extension +'" alt="Responsive image">' +
								'</div>' +
								'<div class="col-md-6 div-info">' +
									'<h4>' + data.name + '</h4>' +
									'<p>' + data.description.substr(0, 75) + '</p>' +
									'<button type="button" class="btn btn-danger" data-toggle="modal" data-target="#modalCharacter" data-id="'+ data.id +'" data-tipo="character">VIEW MORE</button>' +
								'</div>' +
								'<div class="col-md-12">';
									if(data.comics.items.length > 0){ 
										content += '<h5>Related comics</h5>' +
										'<div class="row padding-left-5">';
											var size = 0;
											if(data.comics.items.length >= 4){
												size = 4;
											}
											else{
												size = data.comics.items.length;
											}
											for (var i = 0; i < size; i++) {
												content += '<div class="col-md-6 height-60">' + 
																'<span class="span-comic">' + data.comics.items[i].name + '</span>' + 
															'</div>';
											}
										content += '</div>';
									}
								content += '</div>' +
							'</div>' +
						'</div>' +
					'</div>';

		$('#characters').append(content);
	}
	/***************************/

	/* Renderizar los comics */
	var renderComics = function(data,replace){
		var content = '<div class="col-md-6">' +
						'<div class="col-md-12 div-character">' +
							'<div class="row">' +
								'<div class="col-md-6">' + 
									'<img class="img-character" src="'+ data.thumbnail.path + '.' + data.thumbnail.extension +'" alt="Responsive image">' +
								'</div>' +
								'<div class="col-md-6 div-info">' +
									'<h4>' + data.title.substr(0, 25) + '...' + '</h4>';
									if(data.description == null){
										data.description = "";
									}
									content += '<p>' + data.description.substr(0, 75) + '</p>' +
									'<button type="button" class="btn btn-danger" data-toggle="modal" data-target="#modalCharacter" data-id="'+ data.id +'" data-tipo="comic">VIEW MORE</button>' +
								'</div>' +
								'<div class="col-md-12">';
									if(data.characters.items.length > 0){ 
										content += '<h5>Related characters</h5>' +
										'<div class="row padding-left-5">';
											var size = 0;
											if(data.characters.items.length >= 4){
												size = 4;
											}
											else{
												size = data.characters.items.length;
											}
											for (var i = 0; i < size; i++) {
												content += '<div class="col-md-6 height-60">' + 
																'<span class="span-comic">' + data.characters.items[i].name + '</span>' + 
															'</div>';
											}
										content += '</div>';
									}
								content += '</div>' +
							'</div>' +
						'</div>' +
					'</div>';

		$('#characters').append(content);
	}
	/**************************/

	return {
      	init : _init
    }
})();