// Put all your code in your document ready area
jQuery(function ($) {
  const corsFixer = 'https://cors-anywhere.herokuapp.com/';
  const mijnAppUrl = `${corsFixer}https://testen.solviteers.nl/MijnApp/api/v1/`;
  const bsn = '950051998';
  const token = 'Bearer'
      + ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDExMTk5MTAsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTM5MjUvIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo1MzkyNS8ifQ.lxlaXPg7V8aMT5ViLanqUH6kBmCHx_VGN0oQ9wgNvUg';
  const upl = 'huwelijksaangifte';
  const postcode = '5011';

  const getDataFromExternalResources = function () {
    //get link supplied by SC
    $.get(
        `${corsFixer}https://zoekdienst.overheid.nl/sru/Search?version=1.2&operation=searchRetrieve&x-connection=sc&startRecord=1&maximumRecords=10&query=(uniformeProductnaam="${upl}")and(postcode=${postcode})`).done(
        function (xml) {
          var link = xml.getElementsByTagName("dcterms:identifier")[0];
          if (link) {
            $('#huwelijksaangifte-link').attr('href', link.textContent);
          } else {
            alert("Sorry, no link.");
          }
        });

    //get personal data
    $.ajax({
      url: `${mijnAppUrl}personen/${bsn}`,
      type: 'GET',
      dataType: 'json',
      success: function (json) {
        // $('.voornaam').text(
        //     json.voornamen);
        $('.achternaam').text(
            (json.voorvoegselGeslachtsnaam
                ? json.voorvoegselGeslachtsnaam
                + ' ' : '') + json.geslachtsnaam);
        $('.partner-achternaam').text(
            (json.partnerVoorvoegselGeslachtsnaam
                ? json.partnerVoorvoegselGeslachtsnaam + ' ' : '')
            + json.partnerGeslachtsnaam);
        $('.plaats').text(json.adres ? json.adres.woonplaats : '');

        $('#radiobtn-achternaam').val(
            (json.voorvoegselGeslachtsnaam
                ? json.voorvoegselGeslachtsnaam
                + ' ' : '') + json.geslachtsnaam);

        $('#radiobtn-partner').val((json.partnerVoorvoegselGeslachtsnaam
            ? json.partnerVoorvoegselGeslachtsnaam + ' ' : '') +
            json.partnerGeslachtsnaam);

        $('#radiobtn-achternaam-partner').val(
            (json.voorvoegselGeslachtsnaam
                ? json.voorvoegselGeslachtsnaam
                + ' ' : '') + json.geslachtsnaam
            + ' - ' + (json.partnerVoorvoegselGeslachtsnaam
            ? json.partnerVoorvoegselGeslachtsnaam + ' ' : '')
            + json.partnerGeslachtsnaam);

        $('#radiobtn-partner-achternaam').val(
            (json.partnerVoorvoegselGeslachtsnaam
                ? json.partnerVoorvoegselGeslachtsnaam + ' ' : '') +
            json.partnerGeslachtsnaam + ' - '
            + (json.voorvoegselGeslachtsnaam
            ? json.voorvoegselGeslachtsnaam + ' ' : '')
            + json.geslachtsnaam);

      },
      error: function (e) {
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', token);
      }
    });
  };

  function addLocalEventListener(element, eventName, handler) {
    if (element.addEventListener) {
      element.addEventListener(eventName, handler);
    } else { // IE voor versie 9
      element.attachEvent('on' + eventName, handler);
    }
  };

  //wanneer contentblokken geladen zijn, injecteer extra tekst
  addLocalEventListener(
      document.getElementById('filtertool-container'), 'showresults-post',
      function (event) {
        //insert
        $('.filtertool-contentblock-body:contains("U en uw partner mogen elkaars achternaam gaan gebruiken. U kunt daarom uw achternaam wijzigen, maar dat hoeft niet. Uw achternaam wijzigen regelt u bij uw gemeente. U kunt uw keuze altijd weer veranderen.")').append(
            $('#first'));
        $('.filtertool-contentblock-body:contains("U kunt uw voorgenomen huwelijk digitaal melden op de website van uw gemeente. U doet dit met uw DigiD. Maar u kunt ook een afspraak maken aan het loket van het gemeentehuis.")').append(
            $('#second'));

        //show
        $('.filtertool-contentblock-body #second').toggleClass('hidden');
        $('.filtertool-contentblock-body #first').toggleClass('hidden');

        if (sessionStorage.loginStatus === 'loggedIn') {
          getDataFromExternalResources();
        }

        $('html').on("login", function () {
          getDataFromExternalResources();
        });
      }
  );

  //On submit geselecteerde achternaam
  $("#naam-keuze input.submit").click(function () {
    $('#naam-keuze').toggleClass('hidden');
    $('.afterLogin .modal').toggleClass('hidden');
    let selectedValue = $('input:radio[name=achternaam]:checked').val();
    //get personal data
    $.ajax({
      url: `${mijnAppUrl}personen/${bsn}/wijzignaamgebruik?naamgebruik=${selectedValue}`,
      type: 'POST',
      success: function (number) {
        let zaaknummer = '11111';
        if (number && !isNaN(number.substring(1, number.length - 1))) {
          zaaknummer = number.substring(1, number.length - 1);
        }
        $('#zaaknummer').text(zaaknummer);
      },
      error: function (e) {
        $('#zaaknummer').text('11111');
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', token);
      }
    });
    $('#selected-result').text(selectedValue);
    $('#radioValue').text(selectedValue);
    return false;
  });

  //Onclose achternaam formulier modal
  $(".achternaam-formulier button.close").click(function () {
    $('.achternaam-formulier .modal').toggleClass('hidden');
    $('#naam-keuze').toggleClass('hidden');
    return false;
  });

  // If name has changed, change login name
  var checked_option_radio = $('input:radio[name=achternaam]:checked').val();
  $("#radioValue").html(checked_option_radio);

  $("#nameChange").click(function (e) {
    var checked_option_radio = $('input:radio[name=achternaam]:checked').val();
    $("#radioValue").html(checked_option_radio);
  });

});
