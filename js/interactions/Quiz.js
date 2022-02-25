import { lockElement, unlockElement } from "./Interactions.js"
import {allowUserInput} from "./InteractionUtils/AuxiliaryFunctions.js"

const quizStartBtn = document.getElementById('quiz-start')
const quizNextBtn = document.getElementById('quiz-next')
const quizExitBtn = document.getElementById('quiz-exit')
const quizQuestionContainer = document.getElementById('quiz-container')
const quizQuestionElem = document.getElementById('question')
const quizAnswerBtnElem = document.getElementById('quiz-answer-btns')
const quizAnswerEvaluatedElem = document.getElementById('quizAnswerEvaluated');

let quizQuestionIndex
let quizCountCorrect
//boolean for quiz
let quizOpen = false
let openOnce = false

function quizOpen_True(){
	quizOpen = true
}
function quizOpen_False(){
	quizOpen = false
}
function openOnce_True(){
	openOnce = true
}
function openOnce_False(){
	openOnce = false
}

// Start-, Next- and Exit-Button
quizStartBtn.addEventListener('click', quizStart)
quizNextBtn.addEventListener('click', () => {
	quizQuestionIndex++
	quizNextQuestion()
});
quizExitBtn.addEventListener('click', () => {
	document.getElementById("abbeanum-quiz").style.visibility = 'hidden';
	quizOpen = false
	openOnce = false
	allowUserInput()
	setTimeout(function(){
		unlockElement("Flyer")
	}, 1500)
});


function quizStart(){	
	// start quiz, hide start-btn, show questions
	quizStartBtn.classList.add('hide')
	quizExitBtn.classList.add('hide')
	quizQuestionIndex = 0
	quizCountCorrect = 0
	quizQuestionContainer.classList.remove('hide')
	quizNextQuestion()
	document.getElementById('quizFinished').innerText = ''
}

function quizNextQuestion(){	
	resetAnswers()
	display_question(quizQuestions[quizQuestionIndex])
}

function display_question(question){
	quizQuestionElem.innerText = question.question;
	question.answers.forEach(answer => {	// display the answers onto the Buttons
		const button = document.createElement('button')
		button.innerText = answer.text
		button.classList.add('btn')
		if(answer.correct){
			button.dataset.correct = answer.correct
		}
		button.addEventListener('click', quizAnswer)
		quizAnswerBtnElem.appendChild(button)
	})
}

function resetAnswers(){
	quizAnswerEvaluatedElem.innerText = ''
	clearGivenAnswer(document.body)
	quizNextBtn.classList.add('hide')
	while(quizAnswerBtnElem.firstChild){
		quizAnswerBtnElem.removeChild(quizAnswerBtnElem.firstChild)
	}
}

function quizAnswer(e){ // check the answer
	const clickedBtn = e.target
	const correct = clickedBtn.dataset.correct	// check the dataset
	
	if (clickedBtn.dataset.correct =='true'){
		quizAnswerEvaluatedElem.innerText = 'richtig!'
		quizCountCorrect++
	} else if (clickedBtn.dataset.correct != 'true') {
		quizAnswerEvaluatedElem.innerText = 'leider falsch'
	}
	setGivenAnswer(document.body, correct)
	Array.from(quizAnswerBtnElem.children).forEach(button => {
		setGivenAnswer(button, button.dataset.correct)
	})
	if (quizQuestions.length > quizQuestionIndex +1){	
		quizNextBtn.classList.remove('hide')
	} else {
		document.getElementById('quizFinished').innerText = 'du hast ' + quizCountCorrect + ' von ' + quizQuestions.length + ' richtig'
		quizStartBtn.innerText = 'Restart'
		quizStartBtn.classList.remove('hide')
		quizExitBtn.classList.remove('hide')
	}
}

function setGivenAnswer(element, correct){
	clearGivenAnswer(element);
	if (correct){
		element.classList.add('correct')
	} else {
		element.classList.add('wrong')
	}
}

function clearGivenAnswer(element){
	element.classList.remove('correct')
	element.classList.remove('wrong')
}

const quizQuestions = [
	{
		question: 'Wer beauftragte den Bau des Abbeanums?',
		answers: [
			{ text: 'Carl-Zeiss-Stiftung', correct: true }, 
			{ text: 'JenOptik', correct: false},
			{ text: 'Ernst-Abbe-Hochschule', correct: false}
		]
	},{
		question: 'Wer war der Architekt dieses Gebäudes?',
		answers: [
			{text: 'Hugo Hartung', correct: false},
			{text: 'Ernst Abbe', correct: false},
			{text: 'Ernst Neufert', correct: true}
		]
	},{
		question: 'Welcher Bau-Stil liegt diesem Gebäude zugrunde?',
		answers: [
			{text: 'Bauhaus-Stil', correct: true},
			{text: 'Funktionalismus', correct: false},
			{text: 'Expressionismus', correct: false},
		]
	},{
		question: 'Zu welcher Fakultät gehört das Abbeanum?',
		answers:[
			{text: 'Physikalisch-Astronomische Fakultät', correct: true},
			{text: 'Philosophische Fakultät', correct: false},
			{text: 'Chemisch-Geowissenschaftliche Fakultät', correct: false}
		]
	}
]
// --- (ende quiz) ---

export {openOnce, quizOpen, openOnce_True, openOnce_False, quizOpen_True, quizOpen_False}
