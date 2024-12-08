// New Story Manager class
class StoryManager {
    constructor(game) {
        this.game = game;
        this.isStoryComplete = false;
        this.storyBoard = document.getElementById('story-board-container');
        this.loadingAnimation = this.createLoadingAnimation();
        this.characterSection = this.createCharacterSection();
        this.dialogueSection = this.createDialogueSection();
        this.playerName = game.playerName; // Store player name
        this.currentGameDialogue = ''; // New property to track current game dialogue

        this.dialogues = [
            { speaker: 'Narrator', text: 'A fine day at work for Anil when the phone rings... Tring.... Tring.... Tring' },
            { speaker: 'Pinaz', text: 'Anil! Are you listening? I\'ve been kidnapped!' },
            { speaker: 'Anil', text: 'What? How? Where are you?' },
            { speaker: 'Pinaz', text: 'Tere dil mein.' },
            { speaker: 'Anil', text: 'Seriously babe!' },
            { speaker: 'Pinaz', text: 'I have been kidnapped how would I know? These guys want something from your company.' },
            { speaker: 'Anil', text: 'Okay, I\'ll figure something out  Just let me drive through and save you!' }
        ];

        this.gameDialogues = {
            1: 'Bhaiyaaa! Chalega',
            69: 'You crossed 69 - NAUGHTY!',
            250: 'Look baby, our Noon is advertising.',
            500: 'Wow, I like the stamina.',
            600: 'Give Gossip!',
            1000: 'WILD!',
            2000: 'Cute'

        };

        this.currentDialogueIndex = 0;
        this.lastTriggeredDialogueScore = 0;

        this.initializeStoryboard();
    }

    completeStory() {
        this.isStoryComplete = true;
        this.storyBoard.classList.add('hidden');
        // Don't show player name modal here
    }

    createLoadingAnimation() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-animation';
        this.storyBoard.appendChild(loadingDiv);
        return loadingDiv;
    }

    createCharacterSection() {
        const characterContainer = document.createElement('div');
        characterContainer.id = 'character-section';
        characterContainer.classList.add('character-container', 'hidden');

        // Pinaz character
        const pinazChar = document.createElement('div');
        pinazChar.classList.add('character', 'pinaz-avatar');
        // const pinazHair = document.createElement('div');
        // pinazHair.classList.add('character-hair', 'character-pinaz-hair');
        // const pinazFace = document.createElement('div');
        // pinazFace.classList.add('character-face');
        // pinazChar.appendChild(pinazHair);
        // pinazChar.appendChild(pinazFace);

        // Anil character
        const anilChar = document.createElement('div');
        anilChar.classList.add('character', 'anil-avatar');
        // const anilHair = document.createElement('div');
        // anilHair.classList.add('character-hair', 'character-anil-hair');
        // const anilFace = document.createElement('div');
        // anilFace.classList.add('character-face');
        // const anilGlasses = document.createElement('div');
        // anilGlasses.classList.add('character-glasses');
        // const leftLens = document.createElement('div');
        // leftLens.classList.add('glasses-lens');
        // const rightLens = document.createElement('div');
        // rightLens.classList.add('glasses-lens');
        // anilGlasses.appendChild(leftLens);
        // anilGlasses.appendChild(rightLens);
        // anilChar.appendChild(anilHair);
        // anilChar.appendChild(anilFace);
        // anilChar.appendChild(anilGlasses);

        characterContainer.appendChild(pinazChar);
        characterContainer.appendChild(anilChar);
        this.storyBoard.appendChild(characterContainer);
        return characterContainer;
    }
    createDialogueSection() {
        const dialogueContainer = document.createElement('div');
        dialogueContainer.id = 'dialogue-section';
        dialogueContainer.classList.add('dialogue-box', 'hidden');

        const dialogueTextDiv = document.createElement('div');
        dialogueTextDiv.id = 'dialogue-text';
        dialogueTextDiv.classList.add('dialogue-text');

        const nextButton = document.createElement('button');
        nextButton.id = 'next-dialogue-btn';
        nextButton.classList.add('next-button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => this.showNextDialogue());

        dialogueContainer.appendChild(dialogueTextDiv);
        dialogueContainer.appendChild(nextButton);
        this.storyBoard.appendChild(dialogueContainer);
        return dialogueContainer;
    }

    initializeStoryboard() {
        // Show loading animation
        this.loadingAnimation.classList.remove('hidden');
        
        // Simulate loading
        setTimeout(() => {
            this.loadingAnimation.classList.add('hidden');
            this.startStory();
        }, 2000);
    }

    startStory() {
        this.characterSection.classList.remove('hidden');
        this.dialogueSection.classList.remove('hidden');
        this.showNextDialogue();
    }

    showNextDialogue() {
        const dialogueText = document.getElementById('dialogue-text');
        
        if (this.currentDialogueIndex < this.dialogues.length) {
            const dialogue = this.dialogues[this.currentDialogueIndex];
            dialogueText.textContent = dialogue.text;
            this.currentDialogueIndex++;
        } else {
            this.completeStory();
        }
    }

    completeStory() {
        this.isStoryComplete = true;
        this.storyBoard.classList.add('hidden');
        document.getElementById('player-name-modal').style.display = 'flex';
    }

    // Modify the checkDialogueTriggers method
    checkDialogueTriggers(score) {
        for (let [triggerScore, dialogue] of Object.entries(this.gameDialogues)) {
            // Convert trigger score to number for comparison
            if (score === Number(triggerScore)) {
                this.currentGameDialogue = dialogue;
                this.updateGameCommentary();
                break;
            }
        }
    }

     // New method to update game commentary
     updateGameCommentary() {
        const commentaryTextElement = document.querySelector('.commentary-text');
        if (commentaryTextElement) {
            commentaryTextElement.textContent = this.currentGameDialogue;
        }
    }

    // New method to get current game dialogue
    getCurrentGameDialogue() {
        return this.currentGameDialogue;
    }

    reset() {
        this.isStoryComplete = false;
        this.currentDialogueIndex = 0;
        this.lastTriggeredDialogueScore = 0;

          // Only reinitialize if not already complete
        if (!this.isStoryComplete) {
            this.initializeStoryboard();
        }
    }
}