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

	//Array para almacenar comics en favoritos
	var comics = new Array();

	//Almacenar el id del character seleccionado para traer los comics
	var idCharacter = 0;
	//Limite para el autocomplete
	var limitSearch = 10;
	//limite para los items de characters o de comics
	var limit = 20;
	// offset characters
	var offset = 0;
	// offset comics
	var offsetC = 0;

	//Validar si trae el servicio de characters o comics
	var filtro = 1;

	/* Inicar la paginación */
	var $pagination = $('.pagination');
	var defaultOpts;
	/************************/

	var _init = function(){
		//Variable para saber si se agrega la paginacion actual o si se agrega la pagina 1
		var pagina = 0;

	    setEvents();
	    loadCharacters(pagina);
	    loadFavourites();
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
                	$( "#h3-character" ).text('Characters');
                	loadCharacters(pagina);
                }
            }
        });
        /***********************************************************************************/

        /* Obtener id del comic seleccionado para guardar en favoritos */
        $('.btn-favourites').click(function(e){
            e.preventDefault();
            $('#img-favourites').attr("src", "../dist/img/icons/btn-favourites-primary.png");
            var id = $("#footer-comic").data("id");
            saveFavourites(id);
        })
        /***************************************************************/

        /* Eliminar el comic seleccionado de favoritos */
        $(document).on("click", ".img-delete", function(e){
            e.preventDefault();
            var favorito = $(this).attr("data-id");
            deleteFavourite(favorito);
        });
        /***********************************************/

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
			            limit: limitSearch,
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
		        $( "#h3-character" ).text('Comics');
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

        /* Modal para ver el detallado de los personajes o de los comics*/
        $('#modalCharacter').on('show.bs.modal', function (event) {
			var button = $(event.relatedTarget);
			var id = button.data('id');
			var tipo = button.data('tipo');

			var storedComics = JSON.parse(localStorage.getItem("comics"));
			if (storedComics.indexOf(id) > -1) {
			    $('#img-favourites').attr("src", "../dist/img/icons/btn-favourites-primary.png");
			    $(".btn-favourites").css("background-color", "#302928");
			    $(".btn-favourites").css("color", "#E8222D");
			    $(".btn-favourites").css("border-color", "#302928");
			}

			var modal = $(this);
			modal.find('.text-character').text('');

			/* Detallado de los personajes */
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
			/*********************************/
			/* Detallado de los comics */
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
			            	var imgCharacter = '"'+ data.thumbnail.path + '.' + data.thumbnail.extension +'"';
			            	$('.div-img').css('background-image', 'url(' + imgCharacter + ')');
			            	modal.find('#footer-comic').data('id', id);
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
			/****************************/
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

	/* Almacenar comic en localSotarge */
	var saveFavourites = function(idComic){
		var storedComics = JSON.parse(localStorage.getItem("comics"));

		if(storedComics == null){
			comics.push(idComic);
			localStorage.setItem("comics", JSON.stringify(comics));
			$( "#comic-favourites" ).empty();
		    loadFavourites();
		}
		else{
			if (storedComics.indexOf(idComic) > -1) {
			    console.log("Ya esta en localStorage");
			} else {
				storedComics.push(idComic);
			    localStorage.setItem("comics", JSON.stringify(storedComics));
			    $( "#comic-favourites" ).empty();
		    	loadFavourites();
			}
		} 
	}
	/***********************************/

	/* Eliminar comic de favoritos */
	var deleteFavourite = function(idComic){
		var r = confirm("Estás seguro de eliminar este comic de favoritos!");
		if (r == true) {
		    var storedComics = JSON.parse(localStorage.getItem("comics"));
		    
		    for (var i = 0; i < storedComics.length; i++) {
		    	if(storedComics[i] == idComic){
		    		storedComics.splice(i, 1);
		    		localStorage.setItem("comics", JSON.stringify(storedComics));
		    		$( "#comic-favourites" ).empty();
		    		loadFavourites();

		    		break;
		    	}
		    }
		}
	}
	/*******************************/

	/* Servicio para cargar los comics almacenados en favoritos */
	var loadFavourites = function(){
		$('.se-pre-con').show();
		var storedComics = JSON.parse(localStorage.getItem("comics"));

		if(storedComics == null || storedComics.length == 0){
			ajax(
		        'comics',
		        'GET',
		        {   
		            ts : ts,
		            apikey : apikey,
		            hash : hash

		        },
		        function( response ){
		            if(response.status=="Ok"){
		            	var number1 = Math.floor(Math.random() * 20);
		            	var number2 = Math.floor(Math.random() * 20);
		            	var number3 = Math.floor(Math.random() * 20);

						var favourites = new Array();
						favourites.push(number1, number2, number3);

		            	for (var i = 0; i < favourites.length; i++) {
		            		renderFavourites(response.data.results[favourites[i]]);
		            	}
		            	$('.se-pre-con').hide();
		            }
		        },function(){
		              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
		        }
		    );
		}
		else{
			for (var i = 0; i < storedComics.length; i++) {
				ajax(
			        'comics/' + storedComics[i],
			        'GET',
			        {   
			            ts : ts,
			            apikey : apikey,
			            hash : hash
			        },
			        function( response ){
			            if(response.status=="Ok"){
			            	renderFavourites(response.data.results[0]);
							$('.se-pre-con').hide();
			            }
			        },function(){
			              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente 2.');
			        }
			    );
			}
		}
	}
	/************************************/

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
                        render(1, response.data.results[i]);
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
                        render(2, response.data.results[i]);
                    };
                    $('.se-pre-con').hide();
	            }
	        },function(){
	              alert('Ha ocurrido un error, verifica tu conexión e intenta nuevamente.');
	        }
	    );
	}
	/************************************/

	/* Renderizar los comics favoritos */
	var renderFavourites = function(data,replace){
		var content = '<div class="col-xs-12 col-sm-12 col-md-12">' +
						'<img src="../dist/img/icons/btn-delete.png" class="img-delete" data-id="'+ data.id +'">' +
						'<div class="div-favoritos" style="background-image: url(' + data.thumbnail.path + '.' + data.thumbnail.extension + ')"></div>' +
						'<div class="div-text-favoritos">' +
							'<h5 class="text-center m-bottom-40 color-text">' + data.title + '</h5>' +
						'</div>' +
					'</div>';

		$('#comic-favourites').append(content);
	}
	/***************************/

	/* Renderizar los characters o los comics */
	var render = function(tipo,data,replace){
		var name = '';
		var items = new Array();
		var marvel = '';

		if(tipo == 1){
			name = data.name;
			items = data.comics.items;
			marvel = "character";
		}
		else{
			name = data.title.substr(0, 25);
			items = data.characters.items;
			marvel = "comic";
			if(data.description == null){
				data.description = "";
			}
		}

		var content = '<div class="col-xs-12 col-sm-6 col-md-6">' +
						'<div class="col-xs-12 col-sm-12 col-md-12 div-character">' +
							'<div class="row">' +
								'<div class="col-xs-6 col-sm-6 col-md-6">' + 
									'<img class="img-character" src="'+ data.thumbnail.path + '.' + data.thumbnail.extension +'" alt="Responsive image">' +
								'</div>' +
								'<div class="col-xs-6 col-sm-6 col-md-6 div-info">' +
									'<h4>' + name + '</h4>' +
									'<p>' + data.description.substr(0, 70) + '</p>' +
									'<button type="button" class="btn btn-danger" data-toggle="modal" data-target="#modalCharacter" data-id="'+ data.id +'" data-tipo="'+ marvel +'">VIEW MORE</button>' +
								'</div>' +
								'<div class="col-xs-12 col-sm-12 col-md-12">';
									if(items.length > 0){ 
										content += '<h5>Related comics</h5>' +
										'<div class="row padding-left-5">';
											var size = 0;
											if(items.length >= 4){
												size = 4;
											}
											else{
												size = items.length;
											}
											for (var i = 0; i < size; i++) {
												content += '<div class="col-xs-6 col-sm-6 col-md-6 height-60">' + 
																'<span class="span-comic">' + items[i].name + '</span>' + 
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

	return {
      	init : _init
    }
})();