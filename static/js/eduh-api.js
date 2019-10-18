function apiMathcarouselGetState()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/get_state", false);
	xhr.send();
	if(xhr.status == 200)
	{
		return JSON.parse(xhr.responseText);
	}
}

function apiMathcarouselStopRoulette()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/stop_baraban", false);
	xhr.send();
}