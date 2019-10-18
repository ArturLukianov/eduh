var lastWord = "";
var intervalHandler;
var animationTime = 1000;
var rouletteSpinning = false;
var rouletteSteps = 0;
var rouletteX = -0.5 * rouletteSteps * 0.25;
var maxInterval = 125;
var currentRouletteStep = 0;
var colorTurn = 0;
var blinksCount = 20;
var currentBlinksCount = 0;
var animationInterval = 20;

function apiGetState()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/get_state", false);
	xhr.send();
	if(xhr.status == 200)
	{
		return JSON.parse(xhr.responseText);
	}
}

function apiStopRoulette()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/stop_baraban", false);
	xhr.send();
}

function flipCard(cardNumber)
{
	return function(){
	let start = Date.now();
	let timer = setInterval(function() {
		let timePassed = Date.now() - start;
		if(timePassed >= animation_time)
		{
			clearInterval(timer);
			return;
		}
		cardFlipAnimation(cardNumber, timePassed);
		console.log(timePassed);
	}, animationInterval);
	}
}

function cardFlipAnimation(number, timePassed) {
	document.getElementsByClassName('letter-container')[number].style = "transform: rotateX(" + timePassed / animation_time * 180 + "deg);";
}

function blink()
{
	var blinkingElement = document.getElementById("selected-bc");
	if(currentBlinksCount % 2 == 0)
	{
		selected.style="background: #7777CC";
	}
	else
	{
		selected.style="background: #5555AA";
	}
	currentBlinksCount ++;
	if(currentBlinksCount == blinksCount)
	{
		clearInterval(intervalHandler);
		rouletteSpinning = false;
	}
}

function calculateRouletteInterval()
{
	return Math.min(rouletteX * rouletteX / rouletteSteps, maxInterval);
}

function checkRouletteSpinning()
{
	return currentRouletteStep < rouletteSteps && !(calculateRouletteInterval() < maxInterval && rouletteX > 0);
}

function shiftRoulette()
{
	var rouletteCells = document.getElementsByClassName("baraban-cell");
	var rouletteHandler = document.getElementById("baraban-handler");
	var rouletteFirstCell = rouletteCells[0].cloneNode();
	
	for(var i = 0; i < cells.length; i++)
	{
		if(rouletteCells[i].id == "selected-bc")
		{
			rouletteCells[i].id = "";
			rouletteCells[i + 1].id = "selected-bc";
			break;
		}
	}
	
	rouletteFirstCell.innerHTML = rouletteCells[0].innerHTML;
	rouletteHandler.removeChild(rouletteCells[0]);
	rouletteHandler.append(rouletteFirstCell);
	
	clearInterval(intervalHandler);
	if(checkRouletteSpinning())
	{
		intervalHandler = setInterval(shiftRoulette, calculateRouletteInterval());
		rouletteX += 2;
		currentRouletteStep ++;
	}
	else
	{
		startBlinking();
		apiStopRoulette();
	}
}

function startBlinking()
{
	currentBlinksCount = 0;
	intervalHandler = setInterval(blink, 100);
}

function startRoulette()
{
	document.getElementById("selected-bc").style = "";
	currentRouletteStep = 0;
	intervalHandler = setInterval(shiftRoulette, 100);
}

function updateRouletteState(state)
{
	if(state["baraban"] == 0)
		return;
	rouletteSteps = state["baraban"];
	rouletteSpinning = true;
}

function updateWordState(state)
{
	var word_handler = document.getElementById("word-handler");
	if(lastWord.length == 0)
		lastWord = state["word"];
	while(word_handler.firstChild) {
		word_handler.removeChild(word_handler.firstChild);
	}
	for(var i = 0; i < state["word"].length; i++)
	{
		var new_node = document.createElement('div');
		new_node.className = "letter-wrapper";
		var new_letter = document.createElement('div');
		if(lastWord.length > i && lastWord[i] == "?")
			new_letter.className = "letter";
		else
			new_letter.className = "new-letter";
		new_letter.innerHTML = state["word"][i];
		new_node.append(new_letter);
		var new_n_node = document.createElement('td');
		new_n_node.className = "letter-container";
		new_n_node.append(new_node);
		word_handler.append(new_n_node);
	}
	for(var i = 0; i < state["word"].length; i++)
	{
		if(lastWord[i] != state["word"][i])
			animate_corpse(i)();
	}
	lastWord = state["word"];
}

function updateScoreState(state)
{
	var score_handler = document.getElementById("score-handler");
	score_handler.colSpan = state["word"].length;
	document.getElementById("baraban-tidy").colSpan = state["word"].length;
	document.getElementById("score1").innerHTML = state["score1"];
	document.getElementById("score2").innerHTML = state["score2"];
	document.getElementById("score3").innerHTML = state["score3"];
	if(state["selected"] == 0)
	{
		document.getElementById("score1").className = "selected-score";
		document.getElementById("score2").className = "";
		document.getElementById("score3").className = "";
	} else if(state["selected"] == 1)
	{
		document.getElementById("score1").className = "";
		document.getElementById("score2").className = "selected-score";
		document.getElementById("score3").className = "";
	} else {	
		document.getElementById("score1").className = "";
		document.getElementById("score2").className = "";
		document.getElementById("score3").className = "selected-score";
	}
}

function updateTaskState(state)
{
	if(state["task_status"] == 0)
	{
		document.getElementById('modal').style = "display: none";
		document.getElementById('task-answer').style = "display: none";
		document.getElementById('color-marker').style = "";
	}
	else
	{
		document.getElementById('modal').style = "display: block";
		document.getElementById('task-text').innerHTML = state["task_text"];
		if(state["task_status"] == 2)
		{
			document.getElementById('task-answer').style = "background: green; color: white;";
			document.getElementById('task-answer').innerHTML = state["task_answer"];
		}
		if(state["task_status"] == 3)
		{
			document.getElementById('task-answer').style = state["task_answer"];
		}
	}
}

function updateState()
{
	if(rouletteSpinning)
		return;
	var state = apiGetState();
	updateRouletteState(state);
	updateWordState(state);
	updateScoreState(state);
	updateTaskState(state);
	
	if(rouletteSpinning)
		startRoulette();
}

setInterval(updateState, 1000);