const startButton = document.getElementById('startButton');
const homeButton = document.getElementById('home_btn');
const volumeButton = document.getElementById('volume_btn');
let currentScreen = true;// True for menu screen and False for game screen

// Add event listener to start button
startButton.addEventListener('click', () => {
    // Add your start game logic here
    toggleContainer();
});

// Add event listener to home button
homeButton.addEventListener('click', () => {
    // Add your home button logic here
    if(currentScreen == false){
        toggleContainer();
    }
});

// function to toggle gameContainer and homeContainer
function toggleContainer() {
    currentScreen = !currentScreen;
    homeButton.classList.toggle('d-none');
    homeContainer.classList.toggle('d-none');
    gameContainer.classList.toggle('d-none');
}

// function to select the character
function selectCharacter(element, characterName) {
    // Remove 'selected' class from all character images
    const characters = document.querySelectorAll('.character-section img');
    characters.forEach(character => character.classList.remove('selected'));

    // Add 'selected' class to the clicked character
    element.classList.add('selected');

    // Update selected character name
    const selectedCharacter = document.getElementById('selected-character');
    selectedCharacter.textContent = `You have selected: ${characterName}`;

    // Enable the Start button
    document.getElementById('start-button').disabled = false;
}