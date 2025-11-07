import React, { useEffect, useState, useCallback } from "react";
import Card from "./components/Card";
import deck from "./cards.json";
import "./App.css";

const App = () => {
  // Fonction de mélange
  const shuffleCards = useCallback((array) => {
    // Crée une grille double (8 cartes) et ajoute les états initiaux
    const doubledDeck = [...array, ...array].map((card, index) => ({
      ...card,
      // Utilisation de l'index initial pour l'ID unique
      id: `${card.pairId}-${index}`,
      isFlipped: false,
      isMatched: false,
    }));

    // Mélange le tableau
    const shuffled = [...doubledDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialisation d'état
  const [cards, setCards] = useState(() => shuffleCards(deck));
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [victory, setVictory] = useState(false);
  const [turns, setTurns] = useState(0);

  // Réinitialise les choix pour le prochain tour
  const resetTurn = useCallback(() => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsDisabled(false); // Réactive les clics
  }, []);

  // Gère la nouvelle partie
  const handleNewGame = useCallback(() => {
    setCards(shuffleCards(deck));
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsDisabled(false);
    setVictory(false);
    setTurns(0);
  }, [shuffleCards]);

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setIsDisabled(true); // Désactive les clics pendant la vérification
      setTurns((prevTurns) => prevTurns + 1);

      // Si les cartes correspondent
      if (choiceOne.pairId === choiceTwo.pairId) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            // Marque toutes les cartes avec le même pairId comme matchées
            if (card.pairId === choiceOne.pairId) {
              // On définit isMatched: true et on laisse isFlipped à TRUE
              // pour qu'elles restent visibles le temps du reset.
              // Le composant Card se chargera de la persistance via isMatched.
              return { ...card, isMatched: true }; // ⬅️ isFlipped: true n'est plus nécessaire ici
            }
            return card;
          });
        });

        // 🔑 NOUVEAU : On réinitialise les choix immédiatement après le match
        // SANS utiliser resetTurn, pour garder la logique de désactivation.
        setChoiceOne(null); // Ces deux lignes vont déclencher le useEffect ci-dessous
        setChoiceTwo(null);
      } else {
        // Si les cartes ne correspondent pas, les retourne après un délai
        setTimeout(() => {
          setCards((prevCards) => {
            return prevCards.map((card) => {
              // Retourne uniquement les deux cartes actuellement sélectionnées
              if (card.id === choiceOne.id || card.id === choiceTwo.id) {
                return { ...card, isFlipped: false };
              }
              return card;
            });
          });
          resetTurn(); // On réinitialise les choix et réactive les clics après le retournement
        }, 1200);
      }
    }
  }, [choiceOne, choiceTwo, setCards, resetTurn, setTurns, setIsDisabled]); // resetTurn retiré

  // 🔑 NOUVEAU useEffect pour gérer la réactivation du jeu après un match
  // Cet useEffect s'exécute quand choiceOne et choiceTwo redeviennent null
  useEffect(() => {
    // Si les deux choix sont null ET qu'il n'y a pas d'autres clics en attente (isDisabled est false)
    if (!choiceOne && !choiceTwo && isDisabled) {
      // Cela signifie que le tour est terminé (match ou non-match)
      setIsDisabled(false);
    }
  }, [choiceOne, choiceTwo, isDisabled]); // Dépend de l'état des choix et de l'état de désactivation
  // Gère le clic sur une carte
  const handleChoice = (cardClicked) => {
    // 🔑 CORRECTION 2 : NE PAS TRAITER LE CLIC si la carte est matchée.
    if (cardClicked.isMatched) return; // <-- AJOUTER CETTE VÉRIFICATION

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
      {/* 4. DÉFINITION DES STYLES (CORRIGÉ POUR LE FLIP) */}

      <header className="app-header">
        <h1 className="app-title">Jeu de Mémoire React</h1>
      </header>

      {victory === true ? (
        // Victory Screen
        <div className="victory-screen">
          <div className="victory-card">
            <h2>Bravo !</h2>
            <p>
              Vous avez complété la grille en
              <span
                style={{ fontWeight: 800, color: "var(--color-primary-dark)" }}
              >
                {" "}
                {turns}{" "}
              </span>
              coups.
            </p>
            <button className="btn btn-primary" onClick={handleNewGame}>
              Nouvelle partie
            </button>
          </div>
        </div>
      ) : (
        // Game Grid
        <section className="game-section">
          <div className="score-display">
            Coups : <span>{turns}</span>
          </div>

          <div className="card-grid">
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

          <button className="btn btn-secondary" onClick={handleNewGame}>
            Recommencer la partie
          </button>
        </section>
      )}
    </div>
  );
};

export default App;
