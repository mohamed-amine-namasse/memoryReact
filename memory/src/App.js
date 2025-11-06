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
      <style>{`
              /* Police et arrière-plan */
:root {
    --color-primary: #14B8A6; /* Teal 600 */
    --color-primary-dark: #0D9488; /* Teal 700 */
    --color-primary-darker: #0F766E; /* Teal 800 */
    --color-success: #10B981; /* Emerald 500 */
}
body { 
    margin: 0; 
    font-family: 'Inter', sans-serif; 
    background-color: #0F172A; /* Fond sombre */
}

/* Conteneur principal */
.app-container {
    min-height: 100vh;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

/* En-tête */
.app-header {
    width: 100%;
    max-width: 64rem; 
    margin: 0 auto;
    display: flex;
    justify-content: center;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}
.app-title {
    font-size: 2.25rem; 
    font-weight: 800; 
    color: white; 
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.7); 
    letter-spacing: -0.025em;
    text-transform: uppercase;
}

/* Section du jeu */
.game-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1; 
    justify-content: center;
}
.score-display {
    font-size: 1.25rem; 
    font-weight: 700; 
    color: white; 
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    margin-bottom: 2rem;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
}
.score-display span {
    color: var(--color-primary); 
}

/* GRILLE DE CARTES */
.card-grid {
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 1.25rem; 
    width: 100%;
    max-width: 700px; 
    margin: 0 auto;
    padding: 1rem;
}

/* COMPOSANT CARTE (Conteneur extérieur) */
.card-container {
    position: relative;
    width: 100%; 
    height: 0;
    padding-top: 100%; /* Maintient un ratio 1:1 */
    cursor: pointer; 
    perspective: 1000px; /* 🔑 ESSENTIEL pour l'effet 3D */
    border-radius: 0.75rem;
}

/* Le contenu englobe les deux faces et tourne */
.card-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.75rem;
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transform-style: preserve-3d; /* 🔑 ESSENTIEL: active la 3D pour les enfants */
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

/* Quand la carte est retournée (flip) */
.card-container.is-flipped .card-content {
    transform: rotateY(180deg);
}

/* Styles pour les cartes matchées (dos visible et non cliquable) */
.card-container.is-matched-static {
    cursor: default;
    pointer-events: none;
}
.card-container.is-matched-static .card-content {
    filter: grayscale(100%); 
    opacity: 0.6; 
}

/* Styles communs aux faces */
.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center; 
    border-radius: 0.75rem; 
    backface-visibility: hidden; /* 🔑 ESSENTIEL: masque la face opposée pendant le flip */
    overflow: hidden;
}

/* Recto de la carte (Contenu réel) */
.card-face-front {
  
    /* Le recto est tourné par défaut pour être vu APRÈS la rotation du parent. */
    transform: rotateY(180deg); 
}

/* Verso de la carte (Couverture/Dos) */
.card-face-back {
    
   
    /* Le verso est visible par défaut (rotation 0deg) */
    transform: rotateY(0deg); 
}

/* Image à l'intérieur de la face */
.card-image {
    width: 100%; 
    height: 100%; 
    object-fit: contain; 
    padding: 0.5rem; 
    border-radius: 0.5rem;
}

/* --- Responsive Layouts --- */
@media (max-width: 550px) { 
    .card-grid {
        gap: 0.75rem; 
        grid-template-columns: repeat(4, 1fr); 
        max-width: 95vw;
    }
    .app-title {
        font-size: 1.5rem;
    }
}

/* Écran de victoire et Boutons */
.victory-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    text-align: center;
    padding: 1rem;
}
.victory-card {
    background-color: rgba(255, 255, 255, 0.98); 
    padding: 3rem 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
    max-width: 400px;
    width: 90%;
}
.victory-card h2 {
    font-size: 2.5rem; 
    font-weight: 800;
    color: var(--color-success);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}
.victory-card p {
    font-size: 1.1rem;
    color: #4B5563; 
    margin-bottom: 1.5rem;
}
/* Styles de boutons (inchangés) */
.btn {
    padding: 0.75rem 1.5rem;
    font-weight: 700;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background-color 0.15s, transform 0.15s, box-shadow 0.15s;
    border: none;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}
.btn-primary {
    background-color: var(--color-primary);
    color: white;
    box-shadow: 0 4px var(--color-primary-darker);
    width: 100%;
}
.btn-primary:hover { 
    background-color: var(--color-primary-dark); 
}
.btn-primary:active {
    background-color: var(--color-primary-darker); 
    transform: translateY(4px);
    box-shadow: 0 0 var(--color-primary-darker); 
}
.btn-secondary {
    margin-top: 2rem;
    padding: 0.5rem 1.5rem;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    background-color: #E5E7EB; 
    color: #4B5563; 
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.btn-secondary:hover {
    background-color: #D1D5DB; 
}
            `}</style>
      <header className="app-header">
        <h1 className="app-title">Jeu de Mémoire React</h1>
      </header>

      {victory === true ? (
        // Écran de Victoire
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
        // Grille de Jeu
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
