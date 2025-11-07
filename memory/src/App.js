import React, { useEffect, useState, useCallback, useMemo } from "react";
import Card from "./components/Card";
import deck from "./cards.json";
import "./App.css";

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

  // Détermine la taille de la grille (utile pour la réactivité, bien que la grille soit fixée à 4 colonnes)
  const gridTemplate = useMemo(() => {
    const totalCards = numPairs * 2;
    // La hauteur de la grille s'adapte, mais nous gardons 4 colonnes.
    if (totalCards === 8) return "grid-template-rows: repeat(2, 1fr);";
    if (totalCards === 12) return "grid-template-rows: repeat(3, 1fr);";
    return "grid-template-rows: repeat(4, 1fr);"; // 16 cartes
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
    setIsGameStarted(false); // Retour au menu
  }, [shuffleCards, numPairs]);

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

        // CORRECTION: Réinitialiser immédiatement les choix après un match réussi
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
      // S'assurer que 'isMatched' est présent dans les cartes avant de vérifier
      const allMatched = cards.every((card) => card.isMatched);
      if (allMatched) {
        setVictory(true);
      }
    }
  }, [cards, isGameStarted]);

  // Gère le clic sur une carte
  const handleChoice = (cardClicked) => {
    if (isDisabled || cardClicked.isMatched || cardClicked.id === choiceOne?.id)
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

  // Rendu du jeu
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Jeu de Mémoire</h1>
        <p>Trouvez toutes les paires !</p>
      </header>

      {/* BLOC MODIFIÉ : Affichage conditionnel du Menu/Jeu/Victoire */}
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
      ) : victory ? (
        // 2. Écran de victoire
        <div className="victory-screen-overlay">
          <div className="victory-card">
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
      ) : (
        // 3. Grille de jeu
        <section className="game-section">
          <div className="score-display">
            <div className="text-lg font-semibold text-gray-700">
              Coups : <span>{turns}</span>
            </div>
            <button
              className="btn btn-game-secondary"
              onClick={handleNewGame} // Retourne au menu
            >
              Recommencer (Menu)
            </button>
          </div>

          <div className="card-grid" style={{ gridTemplateRows: gridTemplate }}>
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
    </div>
  );
};

export default App;
