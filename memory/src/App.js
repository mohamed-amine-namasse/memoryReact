import React, { useEffect, useState, useCallback, useMemo } from "react";
import Card from "./components/Card";
import deck from "./cards.json";
import "./App.css";

// Temps initial en secondes
const INITIAL_TIME = 60;

const App = () => {
  // Nouvel état pour gérer l'affichage du menu/jeu
  const [isGameStarted, setIsGameStarted] = useState(false);
  // Nouvel état pour le nombre de paires sélectionnées (défaut: 8)
  const [numPairs, setNumPairs] = useState(8);

  // Fonction de mélange
  const shuffleCards = useCallback((array, count) => {
    // Sélectionne uniquement le nombre de paires désirées
    const initialCards = array.slice(0, count);

    // Crée une grille double et ajoute les états initiaux
    const doubledDeck = [...initialCards, ...initialCards].map(
      (card, index) => ({
        ...card,
        // L'utilisation d'un index initial unique pour l'ID est maintenue
        id: `${card.pairId}-${index}`,
        isFlipped: false,
        isMatched: false,
      })
    );

    // Mélange le tableau
    const shuffled = [...doubledDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialisation d'état
  const [cards, setCards] = useState(() => shuffleCards(deck, 8));
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [victory, setVictory] = useState(false);
  const [turns, setTurns] = useState(0);

  // NOUVEAUX ÉTATS POUR LE TIMER ET GAME OVER
  const [timer, setTimer] = useState(INITIAL_TIME);
  const [isGameOver, setIsGameOver] = useState(false);

  // Détermine le style de la grille (colonnes et rangées)
  const gridStyle = useMemo(() => {
    const totalCards = numPairs * 2;
    let columns = 4; // Par défaut : 4 colonnes
    let rows = 2;

    if (totalCards === 12) {
      // 6 paires
      columns = 4;
      rows = 3;
    } else if (totalCards === 16) {
      // 8 paires
      // **Pour les grands écrans : 6 colonnes (3 rangées)**
      columns = 6;
      rows = 3;
    }

    // Retourne l'objet de style React complet
    return {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    };
  }, [numPairs]);

  // Réinitialise les choix pour le prochain tour
  const resetTurn = useCallback(() => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsDisabled(false); // Réactive les clics
  }, []);

  // Démarrage du jeu depuis le menu
  const handleStartGame = useCallback(() => {
    setCards(shuffleCards(deck, numPairs)); // Shuffle selon la sélection
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(0);
    setVictory(false);
    setIsDisabled(false);
    setTimer(INITIAL_TIME); // Réinitialise le timer
    setIsGameOver(false); // Réinitialise l'état Game Over
    setIsGameStarted(true); // Passe à l'écran de jeu
  }, [shuffleCards, numPairs]);

  // Gère la nouvelle partie (retour au menu)
  const handleNewGame = useCallback(() => {
    setCards(shuffleCards(deck, numPairs));
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsDisabled(false);
    setVictory(false);
    setTurns(0);
    setTimer(INITIAL_TIME); // Réinitialise le timer
    setIsGameOver(false); // Réinitialise l'état Game Over
    setIsGameStarted(false); // Retour au menu
  }, [shuffleCards, numPairs]);

  // LOGIQUE DU COMPTE À REBOURS
  useEffect(() => {
    let intervalId;
    if (isGameStarted && !victory && !isGameOver) {
      intervalId = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            setIsGameOver(true); // Déclenche Game Over
            setIsDisabled(true); // Désactive les clics
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Nettoyage de l'intervalle lorsque le composant est démonté ou les dépendances changent
    return () => clearInterval(intervalId);
  }, [isGameStarted, victory, isGameOver]);

  // Vérification de la correspondance
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setIsDisabled(true);
      setTurns((prevTurns) => prevTurns + 1);

      if (choiceOne.pairId === choiceTwo.pairId) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.pairId === choiceOne.pairId) {
              return { ...card, isMatched: true };
            }
            return card;
          });
        });

        // Réinitialiser immédiatement les choix après un match réussi
        resetTurn();
      } else {
        setTimeout(() => {
          setCards((prevCards) => {
            return prevCards.map((card) => {
              if (card.id === choiceOne.id || card.id === choiceTwo.id) {
                return { ...card, isFlipped: false };
              }
              return card;
            });
          });
          resetTurn();
        }, 1200);
      }
    }
  }, [choiceOne, choiceTwo, resetTurn]);

  // Vérification de victoire
  useEffect(() => {
    if (isGameStarted && cards.length > 0) {
      const allMatched = cards.every((card) => card.isMatched);
      if (allMatched) {
        setVictory(true);
        // La victoire désactive le timer via les dépendances du useEffect du timer
      }
    }
  }, [cards, isGameStarted]);

  // Gère le clic sur une carte
  const handleChoice = (cardClicked) => {
    // Les clics sont également bloqués si le jeu est terminé (Game Over ou Victoire)
    if (
      isDisabled ||
      cardClicked.isMatched ||
      cardClicked.id === choiceOne?.id ||
      victory ||
      isGameOver
    )
      return;

    // 1. Retourne la carte cliquée
    setCards((prevCards) => {
      return prevCards.map((card) => {
        if (card.id === cardClicked.id) {
          return { ...card, isFlipped: true };
        }
        return card;
      });
    });

    // 2. Enregistre le choix
    choiceOne ? setChoiceTwo(cardClicked) : setChoiceOne(cardClicked);
  };

  // Convertit les secondes restantes en format M:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Rendu du jeu
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Jeu de Mémoire</h1>
        <p>Trouvez toutes les paires !</p>
      </header>

      {/* Affichage conditionnel du Menu/Jeu/Victoire/Game Over */}
      {!isGameStarted ? (
        // 1. Menu de sélection de la taille
        <section className="menu-section">
          <h2>Sélectionnez la taille de la grille</h2>
          <div className="menu-options">
            <button
              onClick={() => setNumPairs(4)}
              className={`btn menu-button ${numPairs === 4 ? "selected" : ""}`}
            >
              4 paires (8 cartes)
            </button>
            <button
              onClick={() => setNumPairs(6)}
              className={`btn menu-button ${numPairs === 6 ? "selected" : ""}`}
            >
              6 paires (12 cartes)
            </button>
            <button
              onClick={() => setNumPairs(8)}
              className={`btn menu-button ${numPairs === 8 ? "selected" : ""}`}
            >
              8 paires (16 cartes)
            </button>
          </div>
          <button className="btn start-button" onClick={handleStartGame}>
            Commencer ({numPairs * 2} cartes)
          </button>
        </section>
      ) : (
        // 2. Grille de jeu
        <section className="game-section">
          <div className="score-display">
            {/* Affichage du Timer */}
            <div className="time-display">Temps : {formatTime(timer)}</div>

            <div className="text-lg font-semibold text-gray-700">
              Coups : <span>{turns}</span>
            </div>
            <button
              className="btn btn-game-secondary"
              onClick={handleNewGame} // Retourne au menu
            >
              Menu
            </button>
          </div>

          <div className="card-grid" style={gridStyle}>
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                handleChoice={handleChoice}
                isDisabled={isDisabled}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Écran de Victoire (Overlay) */}
      {victory && (
        <div className="overlay-screen">
          <div className="overlay-card victory-card">
            <h2>🎉 Bravo ! 🎉</h2>
            <p>
              Vous avez complété la grille de {numPairs * 2} cartes en
              <span>{turns}</span>
              coups.
            </p>
            <button
              className="btn start-button"
              onClick={handleNewGame} // Retourne au menu
            >
              Nouvelle partie
            </button>
          </div>
        </div>
      )}

      {/* 4. Écran de Game Over (Overlay) */}
      {isGameOver && !victory && (
        <div className="overlay-screen">
          <div className="overlay-card gameover-card">
            <h2>⏱️ Temps écoulé !</h2>
            <p>
              Dommage ! Vous n'avez pas réussi à trouver toutes les paires à
              temps.
            </p>
            <button
              className="btn start-button"
              onClick={handleNewGame} // Retourne au menu
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
