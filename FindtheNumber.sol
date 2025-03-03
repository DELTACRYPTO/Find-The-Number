
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GuessTheNumber {
    address public owner;
    uint8 private secretNumber;
    bool public gameActive;
    mapping(address => bool) public hasGuessed;  // Enregistre si un joueur a déjà deviné
    address[] public players;

    event NumberGuessed(address indexed player, uint8 guessedNumber, bool success);
    event GameRestarted(uint8 newSecretNumber);

    constructor(uint8 _secretNumber) {
        owner = msg.sender;
        secretNumber = _secretNumber;
        gameActive = true;
    }

    // Fonction pour deviner le nombre secret
    function guess(uint8 _number) public {
        require(gameActive, "Le jeu est termine.");
        require(!hasGuessed[msg.sender], "Vous avez deja devine.");
        require(_number >= 1 && _number <= 10, "Choisissez un nombre entre 1 et 10.");

        // Marque que ce joueur a deviné
        hasGuessed[msg.sender] = true;
        players.push(msg.sender);  // Ajoute le joueur à la liste des participants

        if (_number == secretNumber) {
            gameActive = false;  // Fin du jeu si le bon nombre est trouvé
            emit NumberGuessed(msg.sender, _number, true);
        } else {
            emit NumberGuessed(msg.sender, _number, false);
        }
    }

    // Fonction pour redémarrer le jeu avec un nouveau nombre secret
    function restartGame(uint8 _newSecretNumber) public {
        require(msg.sender == owner, "Seul l'admin peut relancer le jeu.");
        require(_newSecretNumber >= 1 && _newSecretNumber <= 10, "Le nombre doit etre entre 1 et 10.");

        secretNumber = _newSecretNumber;
        gameActive = true;
        // Réinitialise les tentatives des joueurs pour la nouvelle partie
        for (uint i = 0; i < players.length; i++) {
            hasGuessed[players[i]] = false;
        }
        delete players;  // Efface la liste des joueurs
        emit GameRestarted(_newSecretNumber);
    }
}

