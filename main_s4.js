searchVisible = 0;
transparent = true;
window.CURRENT_STOREY = {storey: 0, parent: 0};
var mapTimeout;
var OVERLAY = {
    image       : "",
    fontawesome : "fa fa-xs fa-spinner fa-spin",
    background  : "rgba(255, 255, 255, 0.3)"
};
var RECAPTCHA = '6Le0U2cUAAAAAG6uer38mz-ybXH8hoTgOj7OXkv5';
$(function(){
    /* Fix bootbox */
    $(document).on('hidden.bs.modal', '.bootbox.modal', function (e) {
        if($(".modal").hasClass('in')) {
            $('body').addClass('modal-open');
        }
    });
    /* Init Map */
    init();
    /*  Tooltips */
    $('[rel="tooltip"]').tooltip();
    //modal
    $(document).on('show.bs.modal', '.modal', function (e) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        $(this).removeAttr("tabindex");
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });
    //support click
    $(document).on('click','.btn-ajax-modal',function(e){
        e.preventDefault();
        showLoading();
        let title = $(this).text();
        $.post('/ajax/' + $(this).attr('id'),function(html) {
            window.support_modal = bootbox.dialog({
                title: title,
                message: html
            });
            hideLoading();
        });
        return false;
    });
    //pd
    $('#pd').click(function(){
        loadModal(null, null, 'wizzard-pd');
    });
    //unload
    $(window).on('beforeunload', function(){
        beforeClose();
        var view = window.map.getView();
        localStorage.setItem('mobilitateurbana4_mc', view.getCenter().join('|') + '|' + view.getZoom());
    });
});
//multi store
function multiStorey(){
    var view = window.map.getView();
    var extent = view.calculateExtent(window.map.getSize());
    var currentZoom = view.getZoom();
    var list, list_name='#map #storeyList';
    if(currentZoom < 20 && !$(list_name).is(':visible')) {
        return;
    }
    $.ajax({
        type: "POST",
        url: '/ajax/check-level',
        data: {extent: extent},
        dataType: 'json'
    }).done(function (data) {
        if(!$.isEmptyObject(data) && Object.entries(data).length > 0){
            if($(list_name).length > 0){
                list = $(list_name).empty().show();
            }else{
                list = $('<div>').addClass('btn-group-vertical').attr('id','storeyList').appendTo('#map');
            }
            $(list).find('button').removeClass('btn-success');
            let customLabel = false;
            $.each(data,function(k, floor){
                if(floor.storey_label){
                    customLabel = true;
                }
                var isSelected = window.CURRENT_STOREY.parent === 0 && floor.parent === 0 ||
                    (window.CURRENT_STOREY.parent === floor.parent && window.CURRENT_STOREY.storey === floor.storey );
                if(isSelected && window.CURRENT_STOREY.storey !== floor.storey){
                    window.CURRENT_STOREY.storey = floor.storey;
                }
                $('<button>').addClass('btn btn-default' + (isSelected ? ' btn-success' : '')).
                data({'storey' : floor.storey,'parent' : floor.parent}).
                text(floor.storey_label ?? ('P' + floor.storey)).
                attr('id','storeySwitch_' + floor.parent + '_' + floor.storey).
                click(function(e){
                    e.preventDefault();
                    var parent = $(this).data('parent');
                    var storey = $(this).data('storey');
                    switchStorey(parent,storey);
                    return false;
                }).appendTo($(list));
            });
            $(list).css({
                'width' : customLabel ? 'auto' : '32px',
                'top' : customLabel ? 140 : 65
            });
        }else{
            $(list_name).empty().hide();
            if(window.CURRENT_STOREY.parent === 0 && window.CURRENT_STOREY.storey === 0){
                return false;
            }
            window.CURRENT_STOREY = {storey: 0, parent: 0};
            var layer = window.map.getLayers().getArray()[0].getSource();
            var update = {ENV: 'parinte:0'};
            layer.updateParams(update);
            refreshMap();
        }
    });
}
function switchStorey(parent, storey){
    parent = typeof parent !== 'undefined' ? parent : '';
    storey = typeof storey !== 'undefined' ? storey : '';
    if(JSON.stringify(window.CURRENT_STOREY) === JSON.stringify({parent: parent, storey: storey}) || (window.CURRENT_STOREY.parent === 0 && parent === 0)){
        return false;
    }
    if(parent !== '' && storey !== '') {
        $('#storeyList').find('button').removeClass('btn-success');
        $('#storeySwitch_' + parent + '_' + storey).addClass('btn-success');
        window.CURRENT_STOREY = {parent: parent, storey: storey};
        var layer = window.map.getLayers().getArray()[0].getSource();
        var update = {ENV: 'parinte:' + parent + (parent !== 0 ? (';nivel:' + storey) : '')};
        layer.updateParams(update);
        refreshMap();
    }
}
function fwMap(){
    //resize
    $("#map").width($(window).width()).height($(window).height());
}
function init(){
    //full width
    fwMap();
    //Bounds
    var bounds = [586493,315703,593269,326373];
    //Projection for GeoServer stereo 70
    var projection = new ol.proj.Projection({
        code: 'EPSG:31700',
        units: 'm',
        axisOrientation : 'neu'
    });
    //Geoserver
    var GEOSERVER = 'https://gs1.mobilitateurbana4.ro/?';

    //tile source
    var source = new ol.source.ImageWMS({
        ratio: 1,
        url: GEOSERVER,
        params: {
            'LAYERS': 'sector4_' + (window.TipParcaj === 1 ? 'aplicatie' : 'publice') + (window.isMoto === 1 ? "_moto" : ""),
            'TILED': true,
            'FORMAT': 'image/jpeg',
            'QUALITY': 20
        },
        gutter: 0
    });
    var main_layer = new ol.layer.Image({
        title :"wmsLayer",
        extent : bounds,
        source : source
    });
    //Map initialization
    window.map = new ol.Map({
        view: new ol.View({
            extent : bounds,
            projection : ol.proj.get(projection) ,
            minZoom : 15,
            maxZoom : 22
        }),
        interactions: ol.interaction.defaults({mouseWheelZoom: true}),
        layers:[main_layer],
        target:'map',
        logo : false,
        pixelRatio: 1,
        controls : ol.control.defaults({
            attribution : false,
            zoom : true,
        })
    });
    //view
    var view = map.getView();
    //Map click
    map.on("click", function(e) {
        //show overlay
        showLoading();
        //get long / lat from click
        var coords = e.coordinate;
        //get wizzard
        loadModal(coords[0],coords[1]);
    });
    //resize map
    $(window).resize(function(){
        fwMap();
        map.updateSize();
    });
    //restore map center
    var storageName = 'mobilitateurbana4_mc';
    var storageZoom = false;
    if(localStorage.getItem(storageName)){
        var sVal = localStorage.getItem(storageName).split('|');
        if(sVal.length === 3) {
            storageZoom = true;
            zoomTo(sVal[0], sVal[1], sVal[2]);
        }
    }
    if(!storageZoom) {
        //fit map
        map.getView().fit(bounds, map.getSize());
        //zoom
        view.setZoom(16);
    }
    //select2 for search
    if(window.TipParcaj === 1) {
        addSelect2({
            id: '#search select',
            placeholder: 'Introduceti adresa Dumneavoastra',
            ddParent: '#map',
            width: '100%'
        });
    }else{
        //parking level switch
        window.map.on('moveend', function(){
            clearTimeout(mapTimeout);
            mapTimeout = setTimeout(function(){multiStorey()}, 300);
        });
        //select2
        $('#search select').select2({
            placeholder: 'Alegeti un parcaj',
            width: '100%',
            language: 'ro',
            id: 'x',
            escapeMarkup: function (data) {
                return data;
            },
            dropdownParent: $('#map')
        });
        //multi storey parking
    }
    /* SELECT2 Change */
    $('#search select').on('select2:select', function (e) {
        showLoading();
        if(window.TipParcaj === 1) {
            var data = e.params.data;
        } else {
            var data = {
                x: $(e.params.data.element).data('x'),
                y: $(e.params.data.element).data('y'),
                parent: $(e.params.data.element).data('parent'),
                storey: $(e.params.data.element).data('storey'),
            }
        }
        if(typeof data.x !== 'undefined' && data.x != null){
            zoomTo(data.x,data.y, 20);
            $('#search select').val(null).trigger('change');
            if(window.TipParcaj === 1) {
                $.post('/ajax/check-available', {id: data.id}, function (data) {
                    if (data === "0") {
                        bootbox.dialog({
                            title: 'Loc de parcare indisponibil',
                            message: '<div class="container-fluid">' +
                                '<div class="alert alert-info">' +
                                'Pentru această adresă nu există un loc de parcare disponibil. Apăsând butonul "Trimite o solicitare", vă înscrieți pe o listă de așteptare în cazul eliberării unui loc în zonă.' +
                                '</div>' +
                                '</div>',
                            buttons: {
                                petitie: {
                                    label: 'Trimite o solicitare',
                                    class: 'btn btn-success',
                                    callback: function () {
                                        e.preventDefault();
                                        bootbox.hideAll();
                                        loadModal(null, null, 'petitie');
                                        return true;
                                    }
                                }
                            }
                        });
                    }
                    hideLoading();
                });
            }else{
                switchStorey(data.parent,data.storey);
                multiStorey();
                hideLoading();
            }
        }
    });
    /* Hash */
    var cUrl = location.hash.match(/^#?([0-9.]+)-([0-9.]+)$/);
    //check
    if(cUrl && typeof cUrl[1] !== 'undefined' && cUrl[1] !== null &&
        typeof cUrl[2] !== 'undefined' && cUrl[2] !== null){
        loadModal(cUrl[1],cUrl[2]);
    }
    /* token */
    var token = location.hash.match(/^#([a-z0-9]{40})$/);
    if(token && token[1] !== 'undefined'){
        loadModal(null, null, 'wizzard-' + token[1]);
    }
}
//let modalIsLoading = false;
function loadModal(x,y,url){
    //check if modal was opened
    if($('#mainModal').is(':visible')) {
        return false;
    }
    //modal loading
    /* if(modalIsLoading){
        hideLoading();
        return false;
    }*/
    //modalIsLoading = true;
    //url
    url = (typeof url === "undefined" ? 'wizzard' : url);
    //data
    var data = {x:x ,y:y};
    if(window.TipParcaj === 2){
        data = Object.assign(data, window.CURRENT_STOREY);
    }
    //send ajax request
    $.post('/ajax/' + url,data,function(html){
        //add x - y to url
        if(x !== null && y !== null)
            window.location.hash = '#' + x + "-" + y;
        //load modal
        if(html.length > 0) {
            /* Show modal */
            var modal = bootbox.dialog({
                message: html,
                size: 'large'
            });
            /* Modal on hide */
            modal.on("hidden.bs.modal", function (e) {
                if(url === 'wizzard'){
                    beforeClose();
                }
                history.pushState("", document.title, window.location.pathname + window.location.search);
                modal = null;
            });
            /* Modal on show */
            modal.on("shown.bs.modal", function (e) {
                modal.attr('id','mainModal');
                if(url === 'wizzard' && !$('#inEdit').length){
                    window.notifications = setTimeout(getNotification, 10000);
                }
            });
            //stop loading
            //modalIsLoading = false;
        }
        //hide overlay
        setTimeout(function(){
            hideLoading();
        }, 1000);
    });
}
function getNotification(){
    var id = $('input[name="id_loc_parcare"]').val();
    $.post('/ajax/unload-check',{id:id},function(data){
        if(data !== "1") {
            clearTimeout(window.notifications);
            window.notifications = null;
            if($('#wizardProfile').length) {
                bootbox.hideAll();
                bootbox.alert({
                    title: 'Sesiune expirata',
                    message: '<div class="p10">Sesiunea dumneavoastra a expirat, timpul maxim de completare a solicitarii este de 15 minute.</div>'
                });
            }
        }else{
            window.notifications = setTimeout(getNotification, 10000);
        }
    });
}
function beforeClose(){
    clearTimeout(window.notifications);
    window.notifications = null;
    $.post('/ajax/unload');
    return true;
}
function checkTab(){
    showLoading();
    var $valid = ($('.wizard-card form').valid() &&  $('.wizard-card form').valid());
    hideLoading();
    if(!$valid) {
        $('.wizard-card form').find(":input.error:first").focus();
        return false;
    }
    if($('input[name="tip_cetatean"]').filter(':checked').val() === "pf"){
        $('.row-pj').addClass('hidden');
        $('.row-pf').removeClass('hidden');
    }else{
        $('.row-pj').removeClass('hidden');
        $('.row-pf').addClass('hidden');
    }
    return true;
}
function wizzard(){
    /* Zoom to loc */
    if(typeof locGeom !== 'undefined' && typeof locGeom[0] !== 'undefined' && typeof locGeom[1] !== 'undefined') {
        zoomTo(locGeom[0], locGeom[1], 20);
    }
    /* Rules */
    let rules = {
        tip_cetatean: {
            required: true
        },
        cnp_cui: {
            required: true,
            minlength: 5,
            remote: {
                url: "/ajax/validate?f=cnp_cui",
                type: "post",
                data: {
                    'cnp_cui': function () {
                        return $("input[name='cnp_cui']").val();
                    },
                    'tip_cetatean': function () {
                        return $('input[name="tip_cetatean"]:checked').val();
                    },
                    'pToken': function(){
                        return ($("input[name='pToken']").length ? $("input[name='pToken']").val():"");
                    },
                    'id_loc_parcare': function () {
                        return $("input[name='id_loc_parcare']").val();
                    },
                    'form_pd' : function() {
                        return $('[data-form-pd]').data('form-pd') === 1 ? "1" : "0"
                    }
                },
                async: false,
                dataType: 'text',
                dataFilter: function (data) {
                    if(data.length > 0) {
                        return data;
                    } else {
                        return true;
                    }
                }
            }
        },
        bloc: {
            required: true,
            remote: {
                url: "/ajax/validate?f=cladire",
                type: "post",
                data: {
                    'bloc': function () {
                        return $("#adresa").val();
                    },
                    'scara': function () {
                        return $("input[name='scara']").val();
                    },
                    'apartament': function () {
                        return $("input[name='apartament']").val();
                    },
                    'id_loc_parcare': function () {
                        return $("input[name='id_loc_parcare']").val();
                    },
                    'pToken': function(){
                        return ($("input[name='pToken']").length ? $("input[name='pToken']").val():"");
                    }
                },
                async: false,
                dataType: 'text',
                dataFilter: function (data) {
                    if(data.length > 0) {
                        return data;
                    } else {
                        return true;
                    }
                }
            }
        },
        scara: {
            remote: {
                url: "/ajax/validate?f=scara",
                type: "post",
                data: {
                    'bloc': function () {
                        return $("#adresa").val();
                    },
                    'scara': function () {
                        return $("input[name='scara']").val();
                    }
                },
                async: false,
                dataType: 'text',
                dataFilter: function (data) {
                    if(data.length > 0) {
                        return data;
                    } else {
                        return true;
                    }
                }
            }
        },
        apartament: {
            required: true
        },
        tos: {
            required: true
        },
        nume: {
            required: true
        },
        prenume: {
            required: true
        },
        email: {
            required: true,
            email: true
        },
        numar_masina: {
            required: true,
            minlength: 5,
            remote: {
                url: "/ajax/validate?f=numar_masina",
                type: "post",
                data: {
                    'numar_masina': function () {
                        return $("input[name='numar_masina']").val();
                    },
                    'id_loc_parcare': function () {
                        return $("input[name='id_loc_parcare']").val();
                    }
                },
                async: false,
                dataType: 'text',
                dataFilter: function (data) {
                    if(data.length > 0) {
                        return data;
                    } else {
                        return true;
                    }
                }
            }
        },
        serie_sasiu: {
            required: true,
            minlength: 14,
            maxlength: 17
        },
        telefon: {
            required: true
        },
        carte_auto: {
            required: true
        },
        rca: {
            required: true
        },
        data_expirarii_itp: {
            required: true
        },
        data_expirarii_rca: {
            required: true
        },
    };
    /* Tip abonament */
    if(window.TipParcaj === 2){
        $.extend({}, rules, {
            tip_abonament: {
                required: true
            }
        });
        if(typeof $('input[name="tip_abonament"]:checked').val() === 'undefined'){
            $('input[name="tip_abonament"]').first().prop("checked", true);
        }
    }
    /*  Validate */
    var $validator = $('.wizard-card form').validate({
        rules: rules,
        onkeyup: false,
        focusInvalid: true
    });
    $('input[name="finish"]').click(function(){
        if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            var $inputs = $('input[type="file"]:not([disabled])');
            $inputs.each(function(_, input) {
                if (input.files.length > 0) return
                $(input).prop('disabled', true);
            });
        }
        var formData = new FormData($('#request')[0]);
        if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            $inputs.prop('disabled', false);
        }
        var url = $('#request').attr('action');
        $.ajax({
            url: url,
            type: 'POST',
            dataType: "json",
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = new XMLHttpRequest();
                if (xhr.upload) {
                    showLoading(true);
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            $.LoadingOverlay("progress", (Math.ceil((e.loaded || e.position) / e.total * 100)-5));
                        }
                    } , false);
                }
                return xhr;
            },
            success: function(data){
                setTimeout(function(){
                    $.LoadingOverlay("hide");
                    //add type to message
                    data.text = '<div class="alert alert-' + (data.type === 'ok'?'success':'danger') + '">'+
                        data.text +
                        '</div>';
                    //if ok redirect
                    if(data.type === 'ok') {
                        bootbox.hideAll();
                        //unload
                        beforeClose();
                        //refresh map
                        refreshMap();
                    }else{
                        grecaptcha.reset();
                    }
                    //show error message
                    bootbox.alert({
                        title: ('<span class="fa fa-fw fa-' +
                            (data.type === 'ok'?'check-circle':'exclamation-triangle') +
                            '"></span> ' + (data.type === 'ok'?'Succes':'Eroare')),
                        message: data.text
                    });
                },1000);
            },
            error: function(error){
                hideLoading();
                bootbox.alert({
                    title: 'Eroare',
                    message: 'Eroare necunoscuta, va rugam sa ne contactati'
                });
                console.log(error);
            }
        });
    });
    /* RECAPTCHA */
    grecaptcha.render('g-recaptcha', {'sitekey' : RECAPTCHA});
    /* SELECT2 */
    addSelect2({
        id: '#adresa',
        placeholder: 'Alege o adresa',
        ddParent: '.bootbox',
        width: '100%'
    });
    /* SELECT2 Change */
    $('#adresa').on('select2:select', function (e) {
        var data = e.params.data;

        if(typeof data.nr !== 'undefined' && data.nr.length > 0){
            $('#nr_postal').val(data.nr);
        }else{
            $('#nr_postal').val(null);
        }
        if(typeof data.bl !== 'undefined' && data.bl.length > 0){
            $('#bloc').val(data.bl);
        }else{
            $('#bloc').val(null);
        }
        if(typeof data.scara !== 'undefined' && data.scara !== null && data.scara.length > 0){
            $('input[name="scara"]').val(data.scara).prop('readonly',true);
        }else{
            $('input[name="scara"]').val(null).prop('readonly',false);
        }
    });
    /* TIP */
    var $tip_cetatean = $('input[name="tip_cetatean"]');
    /* CNP / CUI */
    $tip_cetatean.change(function(){
        var defText = " <small class='text-danger'>(*)</small>";
        var defTextCui = " <small class='text-danger'>(*) fara RO in fata</small>";

        if($(this).val() === 'pf'){
            $('input[name="cnp_cui"]').attr('type','number').prev().html('CNP' + defText);
        }else{
            $('input[name="cnp_cui"]').attr('type','text').prev().html('CUI' + defTextCui);
        }
        payAmount();
    });
    // tip abonament
    if(window.TipParcaj === 2 && $('input[name="tip_abonament"]').length > 0 ) {
        $('input[name="tip_abonament"]').change(function () {
            payAmount();
        });
        payAmount();
    }
    /*  Wizzard */
    $('.wizard-card').bootstrapWizard({
        'tabClass': 'nav nav-pills',
        'nextSelector': '.btn-next',
        'previousSelector': '.btn-previous',

        onNext: function(tab, navigation, index) {
            return checkTab();
        },

        onInit : function(tab, navigation, index){
            var $total = navigation.find('li').length;
            $width = 100/$total;

            navigation.find('li').css('width',$width + '%');

        },

        onTabClick : function(tab, navigation, index){
            return checkTab();
        },

        onTabShow: function(tab, navigation, index) {
            var $total = navigation.find('li').length;
            var $current = index+1;

            var $wizard = navigation.closest('.wizard-card');

            if($current >= $total) {
                $($wizard).find('.btn-next').hide();
                $($wizard).find('.btn-finish').show();
            } else {
                $($wizard).find('.btn-next').show();
                $($wizard).find('.btn-finish').hide();
            }

            var move_distance = 100 / $total;
            move_distance = move_distance * (index) + move_distance / 2;

            $wizard.find($('.progress-bar')).css({width: move_distance + '%'});


            $wizard.find($('.wizard-card .nav-pills li.active a .icon-circle')).addClass('checked');

        }
    });
    $('.set-full-height').css('height', 'auto');
}
function payAmount(){

    if(window.TipParcaj !== 2)
        return;

    var cetatean = $('input[name="tip_cetatean"]:checked').val();
    var abonament = $('input[name="tip_abonament"]:checked').val();

    if(typeof abonament === 'undefined' || abonament.length===0)return;

    $.ajax({
        url: "/ajax/pay-amount",
        type: "POST",
        data: {
            tip: cetatean,
            tip_abonament: abonament,
            id: $('input[name="id_loc_parcare"]').val()
        },
        cache: false,
        dataType: "json",
        success: function(data) {
            $('#payAmount').text('Valoare de plata pentru abonamentul ' + (abonament == 1 ? 'fara' : 'cu') +' blocator este de ' + data.debit + ' lei ( ' + data.luni + ' luni * ' + data.tarif +' lei).').addClass('alert alert-success alert-sm');
        }
    });
}
function addSelect2(conf){
    $(conf.id).select2({
        ajax:  {
            url: "/search/cladiri/",
            dataType: 'jsonp',
            jsonp:"callback",
            jsonpCallback: 'nano',
            delay: 250,
            processResults: function (data, params) {
                return { results: data.suggestions};
            },
            data: function(params){
                return {
                    query: params.term
                }
            }
        },
        placeholder: conf.placeholder,
        width: conf.width,
        language: 'ro',
        minimumInputLength: 2,
        id: 'x',
        escapeMarkup: function (data) {
            return data;
        },
        dropdownParent: $(conf.ddParent)
    });
}
function showLoading(progress){
    var progress = (typeof progress !== 'undefined');
    if(progress)
        $.LoadingOverlay("show",{
            progress: true,
            progressColor: '#68B3C8',
            progressFixedPosition: 'top',
            image       : "",
            fontawesome : "fa fa-xs fa-spinner fa-spin",
            background  : "rgba(255, 255, 255, 0.3)"

        });
    else
        $.LoadingOverlay("show",OVERLAY);
}
function hideLoading(){
    $.LoadingOverlay("hide");
}
function refreshMap(){
    map.updateSize();
    var layers = map.getLayers().getArray();
    var layer = layers[0];
    layer.getSource().updateParams({time_:(new Date()).getTime()});
}
//Zoom to point
function zoomTo(lat,lon,level){
    //default level
    if(typeof level !== 'undefined' && level === 'current'){
        level = map.getView().getZoom();
        if(level<20)
            level = 20;
    }
    //view
    var view = map.getView();
    //center
    view.setCenter([parseFloat(lat),parseFloat(lon)]);
    //zoom level
    level = typeof level !== 'undefined' ? parseInt(level):19;
    //zoom
    view.setZoom(level);
}

function drawJSON(json, stop_clear, color){
    stop_clear = typeof stop_clear !== 'undefined';
    if(!stop_clear){
        clearDraw();
    }
    let geoImage = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({color: 'red', width: 1})
    });
    if(typeof json === 'string'){
        json = JSON.parse(json);
    }
    let geoStyles = {
        'Point': new ol.style.Style({
            image: geoImage
        }),
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color:'#3399CC',
                width: 6
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color:'#3399CC',
                width: 6
            })
        }),
        'MultiPoint': new ol.style.Style({
            image: geoImage
        }),
        'MultiPolygon': new ol.style.Style({
            fill:   new ol.style.Fill  ({
                color: typeof color === "undefined" ? [238, 153, 0, 0.2] : color
            }),
            stroke: new ol.style.Stroke({
                color: '#3399CC', width: 2
            })
        }),
        'Polygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: (typeof color === "undefined" ? [238, 153, 0, 0.3] : color)
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };
    let geoStyleFunction = function(feature) {
        feature.setStyle(geoStyles[feature.getGeometry().getType()]);
    };
    let vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(json)
    });
    let vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: geoStyleFunction,
        title: "dbLayer"
    });
    vectorLayer.setZIndex(1000);
    window.map.addLayer(vectorLayer);
    window.map.getView().fit(vectorSource.getExtent(), map.getSize());
}
//Clear draw
function clearDraw(){
    var mLayers = map.getLayers().getArray();
    var index  = mLayers.length -1;
    while( index > 0 ){
        var layerTitle = mLayers[index].getProperties()['title'];
        if(layerTitle === "dbLayer"){
            map.removeLayer(mLayers[index]);
        }
        index--;
    }
}
//Stradal
function formStradal(){
    let $checkbox = $('input[name="tos[]"]');
    let $signup = $('button[name="signup_send"]');
    let $form = $('#formSignup');
    let $message = $('#tosMessage');
    let handleCheckbox = function() {
        if ($checkbox.filter(':checked').length === 2) {
            $form.removeClass('hidden');
            $message.addClass('hidden');
        }else{
            $form.addClass('hidden');
            $message.removeClass('hidden');
        }
    }
    handleCheckbox();
    $checkbox.change(function(){
        handleCheckbox();
    });
    let id =  $('input[name="id_parcare"]').val();
    $form.validate({
        rules: {
            nume: {
                required: true
            },
            prenume: {
                required: true
            },
            email: {
                required: true,
                email: true
            },
            telefon: {
                required: true
            },
            numar_masina: {
                required: true,
                minlength: 3,
                remote: {
                    url: "/ajax/validate?f=numar_masina&stradal=" + id,
                    type: "post",
                    data: {
                        'numar_masina': function () {
                            return $form.find("input[name='numar_masina']").val();
                        },
                        'stradal': function() {
                            return id;
                        }
                    },
                    async: false,
                    dataType: 'text',
                    dataFilter: function (data) {
                        if(data.length > 0) {
                            return data;
                        } else {
                            return true;
                        }
                    }
                }
            },
        },
        onkeyup: false,
        focusInvalid: true
    });
    grecaptcha.render('st-recaptcha', {'sitekey' : RECAPTCHA});
    let finishLoad = function(){
        $signup.prop('disabled', false);
        hideLoading();
    }
    $signup.click(function(e){
        e.preventDefault();
        $signup.prop('disabled', true);
        showLoading();
        let valid = $form.valid() && $form.valid();
        if(!valid) {
            $form.find(":input.error:first").focus();
            finishLoad();
            return false;
        }else{
            if(grecaptcha && grecaptcha.getResponse().length){
                $.ajax({
                    type: "POST",
                    url: '/ajax/save-stradal',
                    data: $form.serialize(),
                    dataType: "json",
                    success: function(data){
                        if(data.type === 'success') {
                            window.location = data.location;
                        }else{
                            grecaptcha.reset();
                            bootbox.alert({
                                title: data.title,
                                message: data.message
                            });
                        }
                        finishLoad();
                    },
                    error: function(error){
                        finishLoad();
                        bootbox.alert({
                            title: 'Eroare',
                            message: 'Eroare salvare date, va rugam sa ne contactati'
                        });
                    }
                });
            }else {
                bootbox.alert({
                    title: 'Cod securitate',
                    message: 'Va rugam sa bifati codul de securitate'
                });
                finishLoad();
            }
        }
        return false;
    });
}