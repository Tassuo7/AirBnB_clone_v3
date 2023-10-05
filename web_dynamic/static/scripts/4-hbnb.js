$(document).ready(function () {
  const amenities = {};
  $("input.amenity-checkbox").change(function () {
    const amenity_id = $(this).data("id");
    const amenity_name = $(this).data("name");

    if ($(this).is(":checked")) amenities[amenity_id] = amenity_name;
    else delete amenities[amenity_id];
    const amenities_list = Object.values(amenities).join(", ");
    $(".amenities h4").text(amenities_list);
  });

  const apiUrl = "http://localhost:5001/api/v1/status";

  $.get(apiUrl, function (data) {
    const apiStatus = $("#api_status");
    data.status === "OK"
      ? apiStatus.addClass("available")
      : apiStatus.removeClass("available");
  });

  const search_api = "http://localhost:5001/api/v1/places_search/";
  let query = {};
  function makeAjaxReq(query) {
    $(".places").empty();
    $.ajax({
      url: search_api,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(query),
      dataType: "json",
      success: function (res) {
        $.each(res, function (idx, place) {
          const articleTag = $("<article>");

          const titleBox = $('<div class="title_box">');
          titleBox.append(`<h2>${place.name}</h2>`);
          titleBox.append(
            `<div class="price_by_night">$${place.price_by_night}</div>`
          );

          articleTag.append(titleBox);

          const information = $('<div class="information">');
          information.append(
            `<div class="max_guest">${place.max_guest} Guest${
              place.max_guest !== 1 ? "s" : ""
            }</div>`
          );
          information.append(
            `<div class="number_rooms">${place.number_rooms} Bedroom${
              place.number_rooms !== 1 ? "s" : ""
            }</div>`
          );
          information.append(
            `<div class="number_bathrooms">${place.number_bathrooms} Bathroom${
              place.number_bathrooms !== 1 ? "s" : ""
            }</div>`
          );

          articleTag.append(information);

          const description = $('<div class="description">').html(
            place.description
          );
          articleTag.append(description);

          $(".places").append(articleTag);
        });
      },
    });
  }

  makeAjaxReq(query);

  $("button").click(function () {
    const amenities_ids = Object.keys(amenities);
    if (amenities_ids.length > 0) query = { amenities: amenities_ids };
    makeAjaxReq(query);
  });
});
