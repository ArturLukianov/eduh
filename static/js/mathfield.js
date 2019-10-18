function get_state()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/get_state", false);
	xhr.send();
	if(xhr.status == 200)
	{
		return JSON.parse(xhr.responseText);
	}
}

function baraban_stopped()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/stop_baraban", false);
	xhr.send();
}

var old_word = "";

function update_state()
{
	if(!baraban_spinning)
	{
		var state = get_state();
		if(state["baraban"] != 0)
		{
			turns = state["baraban"];
			console.log(turns);
			baraban_spinning = true;
		}
		var word_handler = document.getElementById("word-handler");
		if(old_word.length == 0)
			old_word = state["word"];
		while(word_handler.firstChild) {
			word_handler.removeChild(word_handler.firstChild);
		}
		for(var i = 0; i < state["word"].length; i++)
		{
			var new_node = document.createElement('div');
			new_node.className = "letter-wrapper";
			var new_letter = document.createElement('div');
			if(old_word.length > i && old_word[i] == "?")
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
			if(old_word[i] != state["word"][i])
				animate_corpse(i)();
		}
		old_word = state["word"];
		
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
		console.log(state);
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
		
		if(baraban_spinning)
			baraban_start();
	}
}

var animation_time = 1000;

function animate_corpse(number)
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
		draw_animation(number, timePassed);
		console.log(timePassed);
	}, 20);
	}
}

function draw_animation(number, timePassed) {
	document.getElementsByClassName('letter-container')[number].style = "transform: rotateX(" + timePassed / animation_time * 180 + "deg);";
}

setInterval(update_state, 1000);
//setTimeout(update_state, 1000);
var baraban_spinning = false;
var turns = 115;

var x = -0.5 * turns * 0.25;
var maxInterval = 125;
var current_turn = 0;
var color_turn = 0;
var max_blinking = 20;
var blinks = 0;

function blink()
{
	var selected = document.getElementById("selected-bc");
	if(color_turn == 0)
	{
		selected.style="background: #7777CC";
	}
	else
	{
		selected.style="background: #5555AA";
	}
	color_turn = (color_turn + 1) % 2;
	blinks ++;
	if(blinks == max_blinking)
	{
		clearInterval(interval);
		baraban_spinning = false;
	}
}

function baraban_shift()
{
	var cells = document.getElementsByClassName("baraban-cell");
	for(var i = 0; i < cells.length; i++)
	{
		if(cells[i].id == "selected-bc")
		{
			cells[i].id = "";
			cells[i + 1].id = "selected-bc";
			break;
		}
	}
	var baraban = document.getElementById("baraban-handler");
	var cell = cells[0].cloneNode();
	cell.innerHTML = cells[0].innerHTML;
	baraban.removeChild(cells[0]);
	baraban.append(cell);
	clearInterval(interval);
	if(current_turn < turns || !(x * x / turns > maxInterval && x > 0))
	{
		interval = setInterval(baraban_shift, Math.min(x * x / turns, maxInterval));
		x += 2;
		current_turn ++;
	}
	else
	{
		blinking_start();
		baraban_stopped();
	}
}

function blinking_start()
{
	blinks = 0;
	interval = setInterval(blink, 100);
}

var interval;

function baraban_start()
{
	document.getElementById("selected-bc").style = "";
	console.log(turns);
	current_turn = 0;
	interval = setInterval(baraban_shift, 100);
}