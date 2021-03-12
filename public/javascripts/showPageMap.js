mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat] 51.062374308734256, 10.408435388439907
    zoom: 6, // starting zoom 
});

new mapboxgl.Marker();

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${campground.title}</h4><p>${campground.location}</p>`)
        .setMaxWidth("300px")
        .addTo(map)
    )
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl());