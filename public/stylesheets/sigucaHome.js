

$(document).ready(function(){
  

  var cal = new CalHeatMap();
  cal.init({
    itemSelector: "#cal",
    cellSize: 3,
    range: 7,
    cellSize: 20,
    tooltip: true,
    legendColors: ["gray","green"],
    domain: "day",
    colLimit: 24,
    cellPadding: 8,
    verticalOrientation: true,
    legend: [1, 2, 3, 4],
	legendColors: ["#B2E9B2", "#232181"],
    label: {
		position: "right",
		width: 500,
		offset: {x: 10, y: 30}
	}

   
   });

cal.highlight(new Date(2014, 5, 18));

// Add January 5th to already highlighted dates
cal.highlight(cal.options.highlight.push(new Date(2014, 5, 14)));
$('#cal').mousedown(function(event) {
    switch (event.which) {
        case 1:
            alert('Left Mouse button pressed.');
            break;
        case 2:
            alert('Middle Mouse button pressed.');
            break;
        case 3:
            alert('Right Mouse button pressed.');
            break;
        default:
            alert('You have a strange Mouse!');
    }
});
});
