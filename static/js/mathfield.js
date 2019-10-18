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
		if(timePassed >= animationTime)
		{
			clearInterval(timer);
			return;
		}
		cardFlipAnimation(cardNumber, timePassed);
		console.log(timePassed);
	}, animationInterval);
	}
}

function cardFlipAnimation(cardNumber, timePassed) {
	document.getElementsByClassName('letter-container')[cardNumber].style = 
			"transform: rotateX(" + timePassed / animationTime * 180 + "deg);";
}

function blink()
{
	var blinkingElement = document.getElementById("selected-bc");
	if(currentBlinksCount % 2 == 0)
	{
		blinkingElement.style="background: #7777CC";
	}
	else
	{
		blinkingElement.style="background: #5555AA";
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
	
	for(var i = 0; i < rouletteCells.length; i++)
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

function clearWord()
{
	var wordHandler = document.getElementById("word-handler");
	while(wordHandler.firstChild) {
		wordHandler.removeChild(wordHandler.firstChild);
	}
}

function generateWord(word)
{
	var wordHandler = document.getElementById("word-handler");
	for(var i = 0; i < word.length; i++)
	{
		var letter = document.createElement('div');
		letter.className = "letter";
		letter.innerHTML = word[i];
		
		var letterWrapper = document.createElement('div');
		letterWrapper.className = "letter-wrapper";
		letterWrapper.append(letter);
		
		var tableElement = document.createElement('td');
		tableElement.className = "letter-container";
		tableElement.append(letterWrapper);
		
		wordHandler.append(tableElement);
	}
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
	var newWord = state["word"];
	if(lastWord.length != newWord.length)
	{
		clearWord();
		generateWord(newWord);
		lastWord = newWord;
		return;
	}
	var wordHandler = document.getElementById("word-handler");
	var letters = document.getElementsByClassName('letter');
	for(var i = 0; i < newWord.length; i++)
	{
		if(lastWord[i] != newWord[i])
		{
			letters[i].innerHTML = newWord[i];
			flipCard(i)();
		}
	}
	lastWord = newWord;
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