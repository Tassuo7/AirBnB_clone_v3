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

  const states = {};
  $("input.state-checkbox").change(function () {
    const state_id = $(this).data("id");
    const state_name = $(this).data("name");
    if ($(this).is(":checked")) states[state_id] = state_name;
    else delete states[state_id];
    const states_list = Object.values(states).join(", ");
    $(".locations h4").text(states_list);
  });
  const cities = {};
  $("input.city-checkbox").change(function () {
    const city_id = $(this).data("id");
    const city_name = $(this).data("name");

    if ($(this).is(":checked")) cities[city_id] = city_name;
    else delete cities[city_id];
    const cities_list = Object.values(cities).join(", ");
    console.log(cities_list);
    $(".locations h4").text(cities_list);
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

          const reviews = $("<div class='article-reviews'>");
          const reviewsHeader = $('<div class="article-reviews-header">');
          const reviewCount = $(`<h2> Reviews </h2>`);
          const reviewToggle = $(
            `<span id="toggle-reviews" data-id=${place.id}>show</span>`
          );

          $(reviewToggle).click(function () {
            const place_id = $(this).data("id");
            const btnTextEl = $(this);
            if (btnTextEl.text() == "show") {
              $.get(
                `http://localhost:5001/api/v1/places/${place_id}/reviews`,
                function (data) {
                  if (data) {
                    const reviewsList = $("<ul id='reviews-list'>");
                    $.get(
                      `http://localhost:5001/api/v1/places/${place_id}/reviews`,
                      function (data) {
                        if (data) {
                          const reviewsList = $("<ul class='reviews-list'>");
                          const getUsernamePromises = data.map((review) => {
                            return new Promise((resolve, reject) => {
                              $.get(
                                `http://localhost:5001/api/v1/users/${review.user_id}`,
                                function (userData) {
                                  if (userData) {
                                    const username = `${userData.first_name} ${userData.last_name}`;
                                    resolve(username);
                                  } else {
                                    resolve("");
                                  }
                                }
                              );
                            });
                          });

                          Promise.all(getUsernamePromises).then((usernames) => {
                            data.forEach((review, index) => {
                              const listItem = $("<li>");
                              const h3 = $("<h3>").text(
                                `${
                                  usernames[index]
                                    ? `From ${usernames[index]}`
                                    : ""
                                } the ${formatDate(review.created_at)}`
                              );
                              const p = $("<p>").text(review.text);

                              listItem.append(h3);
                              listItem.append(p);

                              reviewsList.append(listItem);
                            });

                            articleTag.append(reviewsList);
                            btnTextEl.text("hide");
                          });
                        }
                      }
                    );

                    function formatDate(dateString) {
                      const date = new Date(dateString);
                      const options = {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      };
                      return date.toLocaleDateString("en-US", options);
                    }
                  }
                }
              );
            } else {
              const reviewsList = articleTag.find(".reviews-list");
              reviewsList.remove();

              btnTextEl.text("show");
            }
          });

          reviewsHeader.append(reviewCount);
          reviewsHeader.append(reviewToggle);
          reviews.append(reviewsHeader);
          articleTag.append(reviews);

          $(".places").append(articleTag);
        });
      },
    });
  }

  makeAjaxReq(query);

  $("button").click(function () {
    const amenities_ids = Object.keys(amenities);
    const states_ids = Object.keys(states);
    const cities_ids = Object.keys(cities);

    if (amenities_ids.length > 0) query.amenities = amenities_ids;
    if (states_ids.length > 0) query.states = states_ids;
    if (cities_ids.length > 0) query.cities = cities_ids;

    makeAjaxReq(query);
  });
});
