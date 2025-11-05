import React, { useEffect, useState } from "react";
import Card from "./components/Card";
import deck from "./cards.json";

function App() {
  const shuffleCards = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [cards, setCards] = useState(() => shuffleCards(deck));

  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [victory, setVictory] = useState(false);

  useEffect(() => {
    const allMatched = cards.every((card) => card.isMatched);
    if (allMatched) {
      setVictory(true);
    }
    /*if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }*/
  }, [cards]);

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setIsDisabled(true);

      if (choiceOne.pairId === choiceTwo.pairId) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.pairId === choiceOne.pairId) {
              return { ...card, isMatched: true, isFlipped: true };
            }
            return card;
          });
        });
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
        }, 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsDisabled(false);
  };

  const handleChoice = (cardClicked) => {
    if (
      isDisabled ||
      cardClicked.isMatched ||
      (choiceOne && choiceOne.id === cardClicked.id)
    ) {
      return;
    }

    setCards((prevCards) => {
      return prevCards.map((card) => {
        if (card.id === cardClicked.id) {
          return { ...card, isFlipped: true };
        }
        return card;
      });
    });
    choiceOne ? setChoiceTwo(cardClicked) : setChoiceOne(cardClicked);
  };

  const handleNewGame = () => {
    setCards(shuffleCards(deck));
    setChoiceOne(null);
    setChoiceTwo(null);
    setIsDisabled(false);
    setVictory(false);
  };

  return (
    <div className="App">
      <div className="background"></div>
      {victory === true ? (
        <div>
          <h2>Bravo !!</h2>
          <button className="restart" onClick={handleNewGame}>
            Nouvelle partie
          </button>
        </div>
      ) : (
        <section className="card-grid">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              handleChoice={handleChoice}
            />
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
